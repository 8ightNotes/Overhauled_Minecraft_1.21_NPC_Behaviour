// main.js - entry for FaceTie AI core (scaffold)
// This file implements a self-contained FaceTie core with memory, emotions, decision pools,
// Thought UI hooks, and basic social logic. It's written as a library to be invoked by
// Bedrock script event handlers (on_tick, on_entity_interacted_with, on_entity_hurt, etc.).

const FaceTie = (() => {
    // In-memory stores; in real integration persist to entity components or world storage
    const entities = new Map();

    function _ensureEntity(id) {
        if (!entities.has(id)) {
            entities.set(id, {
                id,
                short_term: [], // circular buffer of recent events
                long_term: {}, // trusts, known locations, long memories
                emotions: {
                    fear: 0,
                    curiosity: 10,
                    anger: 0,
                    sadness: 0,
                    joy: 0,
                    trust: 50,
                    surprise: 0
                },
                social_links: {}, // entityId -> {trust, last_interaction}
                thought_pool: []
            });
        }
        return entities.get(id);
    }

    // Memory API
    function remember(id, event) {
        const e = _ensureEntity(id);
        e.short_term.push({time: Date.now(), event});
        if (e.short_term.length > 10) e.short_term.shift();
        // simple long term update for important events
        if (event.type === 'rescue' || event.type === 'attack' || event.type === 'found_location') {
            e.long_term[event.key || event.type] = event;
        }
    }

    function getRecent(id, filterFn) {
        const e = _ensureEntity(id);
        return e.short_term.filter(filterFn);
    }

    // Emotions API (0-100)
    function modEmotion(id, name, delta) {
        const e = _ensureEntity(id);
        if (!(name in e.emotions)) return;
        e.emotions[name] = Math.max(0, Math.min(100, e.emotions[name] + delta));
    }

    function setEmotion(id, name, value) {
        const e = _ensureEntity(id);
        if (!(name in e.emotions)) return;
        e.emotions[name] = Math.max(0, Math.min(100, value));
    }

    function getEmotions(id) {
        return Object.assign({}, _ensureEntity(id).emotions);
    }

    // Social logic
    function cooperate(id, targetId) {
        // simple trust boost
        _ensureEntity(id).social_links[targetId] = _ensureEntity(id).social_links[targetId] || {trust: 50};
        _ensureEntity(id).social_links[targetId].trust = Math.min(100, _ensureEntity(id).social_links[targetId].trust + 5);
    }

    function gossip(id, message, nearbyIds=[]) {
        // spread a memory/event to nearby entities
        remember(id, {type: 'gossip', message});
        nearbyIds.forEach(nid => remember(nid, {type:'gossip_heard', message, from: id}));
    }

    function alert(id, message, nearbyIds=[]) {
        remember(id, {type:'alert', message});
        nearbyIds.forEach(nid => modEmotion(nid, 'fear', 10));
    }

    function form_temporary_hierarchy(leaderId, memberIds=[]) {
        memberIds.forEach(mid => {
            _ensureEntity(mid).social_links[leaderId] = _ensureEntity(mid).social_links[leaderId] || {trust: 50};
            _ensureEntity(mid).social_links[leaderId].leader = true;
        });
    }

    // Debug flag and LOD settings
    let debugMode = false;
    const lodConfig = {thought_ui_range: 64, thought_ui_lod_levels: [32, 48, 64]};

    function setDebugMode(enabled) {
        debugMode = !!enabled;
    }

    function setLODConfig(conf) {
        Object.assign(lodConfig, conf);
    }

    // Advanced decision pool evaluator - weighted by emotions, memory recency, and social trust
    function decide(id, pool) {
        // pool: {options: [..], weights: optional, selection_logic: string}
        const e = _ensureEntity(id);
        // emotion vector normalization
        const emo = e.emotions;
        const emoSum = Object.values(emo).reduce((a,b)=>a+b,0) || 1;
        const norm = {};
        Object.keys(emo).forEach(k => norm[k] = emo[k] / emoSum);

        // compute recency factor for each option based on short_term memory (newer events give stronger influence)
        const now = Date.now();
        function recencyBoost(option) {
            let boost = 1.0;
            for (let i=e.short_term.length-1;i>=0;i--) {
                const ev = e.short_term[i];
                if (!ev.event) continue;
                if (JSON.stringify(ev.event).includes(option)) {
                    const age = Math.max(1, now - ev.time);
                    boost += Math.max(0, 0.5 * (1 - (age / (1000*60*5)))); // recent within 5min -> up to +0.5
                    break;
                }
            }
            return boost;
        }

        // social trust influence: options referencing other entities may get boosted by trust
        function socialBoost(option) {
            // naive: if option mentions 'call' or 'help', increase weight by average trust
            const keys = Object.keys(e.social_links || {});
            if (keys.length === 0) return 1.0;
            const avgTrust = keys.reduce((s,k)=>s + (e.social_links[k].trust||50),0)/keys.length;
            if (typeof option === 'string' && /(call|help|cooperate|gossip)/i.test(option)) {
                return 1 + (avgTrust - 50)/200; // small boost
            }
            return 1.0;
        }

        const weights = pool.options.map(opt => {
            // base weight
            let w = (pool.weights && pool.weights[opt]) ? pool.weights[opt] : 1;
            // selection logic parsing - support keywords: fear, curiosity, anger, trust
            if (pool.selection_logic) {
                if (pool.selection_logic.includes('fear')) w *= (1 + emo.fear/50);
                if (pool.selection_logic.includes('curiosity')) w *= (1 + emo.curiosity/50);
                if (pool.selection_logic.includes('anger')) w *= (1 + emo.anger/60);
                if (pool.selection_logic.includes('trust')) w *= (1 + emo.trust/100);
            }
            // normalized emotion cross-influence (mild)
            w *= (1 + norm.curiosity*0.5 - norm.fear*0.2 + norm.anger*0.2);
            // recency and social boosts
            w *= recencyBoost(opt) * socialBoost(opt);
            // small random factor for emergent unpredictability
            w *= (0.9 + Math.random()*0.2);
            return Math.max(0.01, w);
        });

        const total = weights.reduce((a,b)=>a+b,0);
        let r = Math.random()*total;
        for (let i=0;i<weights.length;i++) {
            if (r < weights[i]) {
                if (debugMode && typeof console !== 'undefined') console.log('FaceTie.decide', id, pool, '->', pool.options[i], 'weights', weights);
                return pool.options[i];
            }
            r -= weights[i];
        }
        return pool.options[0];
    }

    // Thought UI: produce a thought string from a pool
    function think(id, pools) {
        const e = _ensureEntity(id);
        // pools is an array of strings or object pools
        const candidate = pools[Math.floor(Math.random()*pools.length)];
        const thought = (typeof candidate === 'string') ? candidate : (candidate.options ? decide(id, candidate) : candidate.text);
        e.thought_pool.push({time:Date.now(), thought});
        if (e.thought_pool.length > 5) e.thought_pool.shift();
        return thought;
    }

    // Exported API
    return {
        remember,
        getRecent,
        modEmotion,
        setEmotion,
        getEmotions,
        cooperate,
        gossip,
        alert,
        form_temporary_hierarchy,
        decide,
        think,
        // Persistence helpers for development/testing (Node.js filesystem usage)
        saveState: function(filePath) {
            try {
                if (typeof require === 'undefined') throw new Error('fs not available');
                const fs = require('fs');
                const data = {};
                entities.forEach((v,k)=> data[k]=v);
                fs.writeFileSync(filePath, JSON.stringify(data,null,2), 'utf8');
                return true;
            } catch (e) {
                if (typeof console !== 'undefined') console.warn('saveState failed', e);
                return false;
            }
        },
        loadState: function(filePath) {
            try {
                if (typeof require === 'undefined') throw new Error('fs not available');
                const fs = require('fs');
                if (!fs.existsSync(filePath)) return false;
                const raw = fs.readFileSync(filePath,'utf8');
                const data = JSON.parse(raw);
                entities.clear();
                Object.keys(data).forEach(k => entities.set(k, data[k]));
                return true;
            } catch (e) {
                if (typeof console !== 'undefined') console.warn('loadState failed', e);
                return false;
            }
        },
        debugDump: function(entityId) {
            const e = entities.get(entityId);
            if (!e) return null;
            const snapshot = JSON.parse(JSON.stringify(e));
            if (typeof console !== 'undefined') console.log('FaceTie debugDump', entityId, snapshot);
            return snapshot;
        },
        // Produce a sample Bedrock-style component mapping that could be attached to an entity
        // Note: actual Bedrock runtime APIs vary; this function returns a JSON object you can copy into
        // a `minecraft:entity` component or use as a template for persistence.
        createEntityComponentSnapshot: function(entityId) {
            const e = entities.get(entityId);
            if (!e) return null;
            return {
                "component": "overhauled:faceTie_state",
                "data": {
                    id: entityId,
                    short_term: e.short_term.slice(),
                    long_term: e.long_term,
                    emotions: e.emotions,
                    social_links: e.social_links
                }
            };
        },
        // Apply a snapshot (reverse of createEntityComponentSnapshot) to in-memory FaceTie state
        applyEntityComponentSnapshot: function(snapshot) {
            if (!snapshot || !snapshot.data || !snapshot.data.id) return false;
            const id = snapshot.data.id;
            const e = _ensureEntity(id);
            e.short_term = snapshot.data.short_term || [];
            e.long_term = snapshot.data.long_term || {};
            e.emotions = snapshot.data.emotions || e.emotions;
            e.social_links = snapshot.data.social_links || {};
            return true;
        },
        _internal: {entities}
    };
})();

// Example exports for Bedrock script host; adapt to the environment's module system.
if (typeof module !== 'undefined') module.exports = FaceTie;

// If running in global script host, attach to global
if (typeof this !== 'undefined' && !this.FaceTie) this.FaceTie = FaceTie;

// End of main.js

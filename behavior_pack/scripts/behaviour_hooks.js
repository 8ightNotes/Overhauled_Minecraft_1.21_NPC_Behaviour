// behaviour_hooks.js - sample glue functions that would be called by behavior JSON events.
// These functions show how to call the FaceTie API from entity event handlers.

const FaceTie = (typeof require !== 'undefined') ? require('./main') : (this.FaceTie || {});
const Pools = (typeof require !== 'undefined') ? require('./faceTie_core') : (this.FaceTie_Pools || {});
const Animator = (typeof require !== 'undefined') ? require('./animator') : (this.Animator || {});
const SoundMap = (typeof require !== 'undefined') ? require('./sound_map.json') : (this.SoundMap || {});
const Sequences = (typeof require !== 'undefined') ? require('./behavior_sequences') : (this.Sequences || {});
// Merge AAA generated sequences if available
try {
    if (typeof require !== 'undefined') {
        const AAA = require('./aaa_sequences_generated');
        Object.assign(Sequences, AAA);
    }
} catch (e) { /* ignore if not present in the runtime */ }

// Generic handler used by auto-generated per-mob functions
function faceTie_generic_tick(entityId, mobType) {
    // perform core think
    try {
        const thought = FaceTie.think(entityId, Pools[`${mobType}_thoughts`] || Pools.villager_thoughts || ["..."]);
        // Example: fire detection -> villager pool decision
        if (mobType === 'villager') {
            const recentFire = FaceTie.getRecent(entityId, ev => ev.event && ev.event.type === 'fire');
            if (recentFire.length > 0) {
                const decision = FaceTie.decide(entityId, Pools.villager_fire_decision_pool);
                FaceTie.remember(entityId, {type:'decision', decision});
                // map decision to animation/intent
                // Map decision to sequences where possible
                const seq = Sequences.villager_fire && Sequences.villager_fire[decision];
                if (seq && Array.isArray(seq)) {
                    seq.forEach(step => {
                        if (step.type === 'animate') Animator.applyAnimation(entityId, step.payload);
                        if (step.type === 'sound' && typeof console !== 'undefined') console.log('Play sound', step.payload);
                        if (step.type === 'item' && typeof console !== 'undefined') console.log('Use item', step.payload);
                        if (step.type === 'gossip') FaceTie.gossip(entityId, step.payload);
                    });
                } else if (decision === 'panic_and_flee') {
                    FaceTie.modEmotion(entityId, 'fear', 15);
                    Animator.applyAnimation(entityId, Animator.generateWalk({speed:2.0, stride:1.6}));
                } else {
                    // fallback animation
                    Animator.applyAnimation(entityId, Animator.generateWalk({speed:1.4}));
                }
            }
        }

        // Generic behaviors for animals
        if (mobType === 'wolf') {
            // if trust high, follow alpha (stub)
            const emo = FaceTie.getEmotions(entityId);
            if (emo.trust > 60) Animator.applyAnimation(entityId, Animator.generateWalk({speed:1.2}));
        }

            // Piglin behavior: gold obsession and trade evaluation
            if (mobType === 'piglin') {
                // if entity remembers seeing gold nearby recently, attempt trade
                const recentGold = FaceTie.getRecent(entityId, ev => ev.event && ev.event.type === 'found_item' && ev.event.item === 'gold_ingot');
                if (recentGold.length > 0) {
                    const decision = FaceTie.decide(entityId, Pools.piglin_trade_pool);
                    FaceTie.remember(entityId, {type:'piglin_decision', decision});
                    if (decision === 'inspect_gold_and_trade') {
                            FaceTie.modEmotion(entityId, 'curiosity', 10);
                            Animator.applyAnimation(entityId, Animator.generateWalk({speed:1.1}));
                        } else if (decision === 'demand_gold_and_attack') {
                            FaceTie.modEmotion(entityId, 'anger', 20);
                            Animator.applyAnimation(entityId, Animator.generateWalk({speed:1.6}));
                        }
                }
            }

            // Ender Dragon strategy: change behavior based on health/dragon pool
            if (mobType === 'ender_dragon' || mobType === 'dragon') {
                // pretend to read a long_term key 'last_battle_damage' for context
                const e = FaceTie._internal.entities.get(entityId) || {};
                const health = e.long_term && e.long_term.health ? e.long_term.health : null;
                const strategy = FaceTie.decide(entityId, Pools.dragon_strategy_pool);
                FaceTie.remember(entityId, {type:'dragon_strategy', strategy});
                if (strategy === 'retreat_and_heal') {
                    Animator.applyAnimation(entityId, Animator.generateWalk({speed:0.6, stride:0.6}));
                    FaceTie.modEmotion(entityId, 'fear', 5);
                } else if (strategy === 'flank_with_wings') {
                    FaceTie.modEmotion(entityId, 'anger', 10);
                }
            }

            // Dolphin rescue behaviors
            if (mobType === 'dolphin') {
                const recentItem = FaceTie.getRecent(entityId, ev => ev.event && ev.event.type === 'dropped_item');
                if (recentItem.length > 0) {
                    const decision = FaceTie.decide(entityId, Pools.aquatic_rescue_pool);
                    FaceTie.remember(entityId, {type:'dolphin_decision', decision});
                    if (decision === 'rescue_item_and_return') {
                        Animator.applyAnimation(entityId, Animator.generateSwim ? Animator.generateSwim({speed:1.4}) : Animator.generateWalk({speed:1.4}));
                    }
                }
            }

            // Iron Golem: if fire nearby, attempt crush_fire or patrol
            if (mobType === 'iron_golem') {
                const recentFire = FaceTie.getRecent(entityId, ev => ev.event && ev.event.type === 'fire');
                if (recentFire.length > 0) {
                    const seq = Sequences.iron_golem_fire && Sequences.iron_golem_fire.crush_fire;
                    if (seq) {
                        seq.forEach(step => {
                            if (step.type === 'animate') Animator.applyAnimation(entityId, step.payload);
                            if (step.type === 'sound' && typeof console !== 'undefined') console.log('Play sound', step.payload);
                        });
                    }
                }
            }

        // Sound mapping by emotion (toy example)
        const e = FaceTie._internal.entities.get(entityId);
        if (e && e.emotions) {
            const highest = Object.keys(e.emotions).reduce((a,b)=> e.emotions[a] > e.emotions[b] ? a : b, 'curiosity');
            const sound = (SoundMap.emotion_sounds && SoundMap.emotion_sounds[highest]) || null;
            if (sound && typeof console !== 'undefined') console.log('Play sound for', entityId, sound);
        }

        return thought;
    } catch (err) {
        if (typeof console !== 'undefined') console.warn('faceTie_generic_tick error', err);
    }
}

// Auto-generate named tick functions for a broad set of mobs so behavior JSONs referencing
// specific functions keep working while routing to generic logic.
const mobList = [
    'villager','iron_golem','wolf','fox','pig','chicken','cow','sheep','zombie','skeleton','spider','pillager','evoker','vindicator','ravager',
    'piglin','hoglin','zoglin','ghast','blaze','magma_cube','strider',
    'enderman','ender_dragon','shulker','endermite',
    'cod','dolphin','squid','turtle','guardian','elder_guardian'
];

const exportsObj = {};
for (const mob of mobList) {
    const fnName = `faceTie_${mob}_tick`;
    // create a closure binding mob
    exportsObj[fnName] = (function(m) {
        return function(entityId) { return faceTie_generic_tick(entityId, m); };
    })(mob);
}

if (typeof module !== 'undefined') module.exports = exportsObj;

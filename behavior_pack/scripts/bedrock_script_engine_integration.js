// bedrock_script_engine_integration.js
// Concrete integration for Minecraft Bedrock Script Engine (vanilla experimental scripting).
// This system hydrates FaceTie state from components on spawn, runs FaceTie ticks for
// overhauled entities, persists snapshots back to entity components, and shows a simple
// thought overlay to nearby players via chat/title commands for demonstration.

(function() {
    const FACE_TIE_MODULE_PATH = './main';
    let FaceTie = null;
    try { FaceTie = require(FACE_TIE_MODULE_PATH); } catch (e) { /* running in engine, may expose FaceTie globally */ }

    const system = server.registerSystem(0, 0);

    system.initialize = function() {
        this.listenForEvent('minecraft:entity_created', (e) => this.onEntityCreated(e));
        // Create a query to select our overhauled entities. We'll match all entities and filter by identifier.
        this.overhauledQuery = this.createQuery({ all: ['minecraft:health'] });
        this.tickInterval = 0;
    };

    system.onEntityCreated = function(eventData) {
        const entity = eventData.data.entity;
        try {
            // Attempt to read our FaceTie component and hydrate
            const comp = this.getComponent(entity, 'overhauled:faceTie_state');
            if (comp) {
                let data = comp;
                if (typeof comp === 'string') data = JSON.parse(comp);
                // data should contain id or we attach runtime id
                data.id = data.id || (entity.__unique_id || entity.__identifier || entity.id);
                if (FaceTie) FaceTie.applyEntityComponentSnapshot({data});
            }
        } catch (err) {
            this.broadcastEvent('minecraft:display_chat_event', `FaceTie hydrate error: ${err}`);
        }
    };

    // Helper to persist an entity's FaceTie snapshot into a component
    system.persistFaceTieForEntity = function(entity) {
        try {
            const id = entity.__unique_id || entity.id || entity.__identifier;
            if (!FaceTie) return false;
            const snapshot = FaceTie.createEntityComponentSnapshot(id);
            if (!snapshot) return false;
            // applyComponentChanges accepts an entity and a list of changes
            const changes = [{ component: 'overhauled:faceTie_state', properties: snapshot.data }];
            this.applyComponentChanges(entity, changes);
            return true;
        } catch (e) {
            this.broadcastEvent('minecraft:display_chat_event', `FaceTie persist error: ${e}`);
            return false;
        }
    };

    // Main tick - run every update, but throttle to every N ticks to reduce cost
    system.update = function() {
        this.tickInterval++;
        if (this.tickInterval % 20 !== 0) return; // run once per second (20 ticks)
        const entities = this.getEntitiesFromQuery(this.overhauledQuery) || [];
        for (const ent of entities) {
            try {
                // Derive mob name from identifier if available
                const ident = ent.__identifier || (ent.components && ent.components['minecraft:identifier'] && ent.components['minecraft:identifier'].value) || '';
                if (!ident || !ident.includes(':')) continue;
                const mob = ident.split(':').pop();

                // Build runtime id
                const id = ent.__unique_id || ent.id || (ident + '_' + (ent.__unique_id || Math.random()));

                // Ensure FaceTie knows the entity
                if (FaceTie && FaceTie._internal && !FaceTie._internal.entities.has(id)) FaceTie.remember(id, {type: 'spawn'});

                // Call the generated per-mob tick function if available in global scope
                const fnName = `faceTie_${mob}_tick`;
                if (typeof globalThis[fnName] === 'function') {
                    globalThis[fnName](id);
                } else if (typeof this['faceTie_generic_tick'] === 'function') {
                    this['faceTie_generic_tick'](id, mob);
                }

                // After tick, persist a snapshot for the entity
                this.persistFaceTieForEntity(ent);

                // Display last thought to nearby players (demo): fetch last thought from FaceTie memory
                if (FaceTie) {
                    const eState = FaceTie.debugDump(id);
                    const lastThought = (eState && eState.thought_pool && eState.thought_pool.length) ? eState.thought_pool[eState.thought_pool.length-1].thought : '';
                    if (lastThought) {
                        const msg = `${mob} thinks: ${lastThought}`;
                        // tell all players - for a real overlay, send to nearest players only
                        this.executeCommand(`tellraw @a {"rawtext":[{"text":"${msg.replace(/\"/g,'\\\"')}"}]}`, () => {});
                        // Broadcast a lightweight custom event so client systems can render a graphical HUD
                        try {
                            this.broadcastEvent('overhauled:thought_update', { entityId: id, mob: mob, thought: lastThought });
                        } catch (e) {
                            // ignore if host doesn't support cross-system events
                        }
                    }
                }

            } catch (e) {
                this.broadcastEvent('minecraft:display_chat_event', `FaceTie tick error: ${e}`);
            }
        }
    };

})();

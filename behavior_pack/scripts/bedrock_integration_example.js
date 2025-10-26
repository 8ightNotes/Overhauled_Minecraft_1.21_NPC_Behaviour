/*
  bedrock_integration_example.js

  Example integration code (pseudo/templated) for a Minecraft Bedrock server scripting system.
  This file demonstrates how to persist FaceTie state to an entity component and how to
  call the FaceTie per-mob tick handlers. Adapt to the specific Bedrock scripting API/version
  you use (server-side systems, Bridge, LiteLoader, etc.).

  NOTE: This is an example. Bedrock's scripting APIs differ between versions. Use this as a
  template to adapt to your runtime.
*/

(function() {
    // Try to access the FaceTie API provided by the scaffold when running inside a JS host
    const FaceTie = (typeof require !== 'undefined') ? require('./main') : (this.FaceTie || null);

    // Pseudocode for registering a system in the Bedrock scripting environment
    // Many Bedrock script hosts use a `server.registerSystem` or similar API.
    if (typeof server !== 'undefined' && server.registerSystem) {
        const system = server.registerSystem(0, 0);

        // Example: on init, register for entity spawn and tick events
        system.initialize = function() {
            // Listen for entity created/spawn events to hydrate FaceTie from stored components
            system.listenForEvent('minecraft:entity_spawned', onEntitySpawned);
            // Register a recurring tick (the engine will call update periodically)
            system.listenForEvent('minecraft:tick', onTick);
        };

        function onEntitySpawned(eventData) {
            try {
                const entity = eventData.data.entity;
                // hydrate FaceTie from a component if present
                const raw = system.getComponent(entity, 'overhauled:faceTie_state');
                if (raw) {
                    // raw might be a JSON string or an object depending on host
                    let data = raw;
                    if (typeof raw === 'string') data = JSON.parse(raw);
                    FaceTie && FaceTie.applyEntityComponentSnapshot({data: Object.assign({id: entity}, data)});
                }
            } catch (e) {
                system.log('Error hydrating FaceTie on spawn: ' + e);
            }
        }

        function onTick(eventData) {
            // Query for all entities with the overhauled behaviors; you can narrow by families/types
            const entities = system.getEntitiesFromQuery({family:'overhauled:all_entities'});
            entities.forEach(ent => {
                try {
                    // Call the generated tick handler for this entity type
                    // Attempt to derive mobType from entity.__identifier or component
                    const type = (ent.__identifier || (ent.components && ent.components['minecraft:identifier'] && ent.components['minecraft:identifier'].value)) || 'villager';
                    const mobName = type.split(':').pop();
                    const fnName = 'faceTie_' + mobName + '_tick';
                    if (typeof globalThis[fnName] === 'function') {
                        globalThis[fnName](ent.__unique_id || ent.__identifier || ent.id);
                    } else if (FaceTie && FaceTie._internal && FaceTie._internal.entities) {
                        // fallback: call the generic tick via behaviour_hooks (if exported into the host)
                        if (globalThis['faceTie_generic_tick']) globalThis['faceTie_generic_tick'](ent.__unique_id || ent.id, mobName);
                    }
                } catch (e) {
                    system.log('Error running FaceTie tick for an entity: ' + e);
                }
            });
        }

        // Expose a helper to persist FaceTie state for an entity
        system.persistFaceTieState = function(entity) {
            if (!FaceTie) return false;
            const id = entity.__unique_id || entity.id;
            const snapshot = FaceTie.createEntityComponentSnapshot(id);
            if (!snapshot) return false;
            // Save snapshot.data into the entity's component property; adapt to host API
            try {
                system.applyComponentChanges(entity, [{component:'overhauled:faceTie_state', properties: snapshot.data}]);
                return true;
            } catch (e) {
                system.log('Failed to persist FaceTie state: ' + e);
                return false;
            }
        };
    } else {
        if (typeof console !== 'undefined') console.warn('Bedrock integration example: server.registerSystem not found in this host.');
    }
})();

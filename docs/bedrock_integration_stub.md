Bedrock integration stub
=======================

This file contains example snippets and guidance for integrating the FaceTie scaffold with a Minecraft Bedrock scripting/runtime that supports entity components and script hooks.

1) Persisting FaceTie state into an entity component

Example (pseudocode - adapt to your Bedrock runtime API):

```js
// Called when you want to persist an entity's FaceTie state
function persistFaceTieState(entity, faceTie) {
  const snapshot = faceTie.createEntityComponentSnapshot(entity.id);
  // snapshot is a plain object. Convert to a JSON-serializable string for a component property
  entity.setComponent('overhauled:faceTie_state', JSON.stringify(snapshot.data));
}

// On entity load, rehydrate
function hydrateFaceTieFromEntity(entity, faceTie) {
  const raw = entity.getComponent('overhauled:faceTie_state');
  if (!raw) return;
  let data = raw;
  if (typeof raw === 'string') data = JSON.parse(raw);
  const snapshot = { data };
  faceTie.applyEntityComponentSnapshot(snapshot);
}
```

2) Hooking ticks

- Use your Bedrock script host to call `faceTie_<mob>_tick(entityId)` on a per-entity tick, or call a global handler which then routes by entity type. The scaffold's `behaviour_hooks.js` exposes these functions when running under Node or when loaded in a compatible script host.

3) Client Thought UI

- The scaffold provides `resource_pack/ui/thought_overlay.json` as a placeholder. To render thoughts in-game you must implement a client-side UI overlay that reads the currently visible entities' thought strings (via a networked component or a client script) and draws them.

4) Notes & caveats

- Bedrock scripting API versions vary. The scaffold's Node helpers (`saveState`, `loadState`, `createEntityComponentSnapshot`) are for development and must be mapped to your runtime's persistence mechanisms.
- Security: avoid writing large amounts of data to entity components per tick. Instead, persist only important long-term memory keys and compress/evict short-term memory periodically.

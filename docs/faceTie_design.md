# FaceTie Design Notes

This document outlines the FaceTie core architecture included in the scaffold.

Core concepts
- Entities: represented by a unique `entityId` (use runtime-provided ID).
- Memory: short_term (5-10 events) and long_term (keyed events).
- Emotions: fear, curiosity, anger, sadness, joy, trust, surprise (0-100).
- Social links: maps of trust/leader info for other entities.
- Decision pools: declarative JSON pools evaluated by `decide(entityId, pool)`.

Integration points
- Hook `faceTie_<mob>_tick` into entity on_tick events (examples in `behavior_pack/entities`).
- On interaction, call `FaceTie.remember(entityId, {type:'interaction', data:...})`.
- To display Thought UI, call `FaceTie.think(entityId, pool)` and map to resource pack UI overlays inside the client.

Persistence
- The scaffold uses in-memory maps. For real Bedrock usage persist per-entity to `minecraft:loot_table` style components or world storage.

Extending
- Add new pools to `faceTie_core.js` and reference them from behavior JSONs.
- Map decisions to behavior engine components (navigate_to, play_animation, equip_item).

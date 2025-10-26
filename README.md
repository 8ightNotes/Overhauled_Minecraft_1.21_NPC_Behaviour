# Overhauled Minecraft 1.21 NPC Behaviour

This repository contains a scaffold for a Minecraft Bedrock (PE) 1.21 addon that overhauls mob behavior using a custom AI core (FaceTie) and Thought UI (FacePlay integration stubs).

What this scaffold provides:
- Behavior pack skeleton with manifests and sample entity behavior JSONs for Villager, Wolf, Enderman, and Ghast.
- A scripts folder with a FaceTie core JS module implementing memory, emotions, decision pools, social logic, and Thought UI hooks (placeholder implementation).
- Resource pack skeleton with Thought UI asset placeholders.
- README and usage instructions.

This is a scaffold and starting point. The scripts are written as well-documented, extensible modules intended to be connected to Bedrock scripting/event hooks when running in Minecraft Bedrock server or client script host.

Installation (simple):
1. Copy `behavior_pack/` and `resource_pack/` into your Minecraft `com.mojang` `behavior_packs` and `resource_packs` directories respectively.
2. Enable the behavior and resource pack in your world settings.
3. Enable "Scripts" / "Experimental Gameplay" as required by Bedrock scripting APIs (version dependent).

See the `docs/` folder for details on how the FaceTie API is designed and how to extend behaviors.

---
Files of interest:
- `behavior_pack/scripts/faceTie_core.js` - Core AI system (memory, emotions, decision pools).
- `behavior_pack/entities/*.behavior.json` - Behavior files for sample mobs showing how to call FaceTie.
- `resource_pack/ui/thought_ui.json` - Thought UI definitions and placeholder assets.

Notes:
- The provided JS is intentionally self-contained and includes placeholder hooks. To fully integrate with Minecraft PE, hook the methods to the Bedrock entity event system (on_tick, on_entity_hurt, on_entity_interacted_with, etc.).
- This scaffolding avoids binary image files; add your own icons/textures under `resource_pack/textures/`.

If you want, I can now: wire a sample event hook file for a popular Bedrock script host, expand the FaceTie core to include serialization to entity components, or add more sample behaviors for other mobs and dimensions.

Developer notes — quick commands
- Generate many behavior JSON templates (creates files in `behavior_pack/entities`):

```bash
node behavior_pack/scripts/generate_behaviors.js
```

- Save current FaceTie in-memory state to disk (Node.js dev host):

```js
const FaceTie = require('./behavior_pack/scripts/main');
FaceTie.saveState('/tmp/facetie_state.json');
```

- Load FaceTie state from disk (Node.js dev host):

```js
FaceTie.loadState('/tmp/facetie_state.json');
```

- Create a Bedrock-style component snapshot (example) for a given entity id:

```js
const snapshot = FaceTie.createEntityComponentSnapshot('entity-1234');
console.log(JSON.stringify(snapshot, null, 2));
```

Notes on persistence and Bedrock integration
- The scaffold uses in-memory maps. Real Bedrock runtimes expose entity components and world storage APIs; map the output of `createEntityComponentSnapshot()` to a proper component or world storage key and call `applyEntityComponentSnapshot()` when the world/behavior loads entities.

Recent additions (automated expansion)
-------------------------------------
- `behavior_pack/scripts/behavior_sequences.js` — expanded with placeholder sequences for many mobs (villager, iron_golem, wolf, piglin, blaze, ghast, magma_cube, enderman, ender_dragon, shulker, dolphin, guardian, passive animals, and more). These map high-level decisions to animation/sound/item/gossip steps.
- `behavior_pack/scripts/animator.js` — swim/attack/walk/eat/throw procedural animation generators and an `applyAnimation()` stub used by sequences.
- `behavior_pack/scripts/behaviour_hooks.js` — a generic tick handler plus auto-generated per-mob tick functions which route to the generic logic; integrates FaceTie, sequences, animator, and sound map.
- `behavior_pack/components/faceTie_component.json` — example component template showing how to persist FaceTie state into an entity component (adapt to your Bedrock runtime).
- `docs/bedrock_integration_stub.md` — pseudocode and guidance for persisting/hydrating FaceTie state with Bedrock components and hooking ticks.
- `resource_pack/ui/thought_overlay.json` and `resource_pack/textures/thought_icons.json` — Thought UI placeholders (overlay mapping and icon paths). Add actual icon PNGs in `resource_pack/textures/ui/thoughts/`.
- `behavior_pack/scripts/test_facetie.js` — Node test which simulates entities, triggers decisions, exercises persistence (save/load), and applies animation stubs.
- `behavior_pack/scripts/validate_entities_json.js` — validator that parses all behavior JSON files to catch syntax issues.

If you'd like, next I can:
- Replace the placeholder Thought UI overlay with a concrete client-side UI implementation for a specific Bedrock scripting host (tell me which host/version), or
- Convert the FaceTie state persistence to use a particular Bedrock API for components/world storage and show a working integration example, or
- Flesh out the sequences with more detailed item-usage and procedural animation parameters per mob.



// behavior_sequences.js - maps high-level decisions to animation/sound/item sequences
const Animator = (typeof require !== 'undefined') ? require('./animator') : (this.Animator || {});
const SoundMap = (typeof require !== 'undefined') ? require('./sound_map.json') : (this.SoundMap || {});

// Centralized mapping from high-level decisions to ordered sequences of steps.
// Each step may be: animate, sound, item, gossip, effect, spawn, etc.
const Sequences = {
    // Villager emergency behaviors
    villager_fire: {
        run_to_water_and_fetch_bucket: [
            {type:'animate', payload: Animator.generateWalk({speed:1.6})},
            {type:'sound', payload: SoundMap.action_sounds && SoundMap.action_sounds.run},
            {type:'item', payload: {use: 'bucket', action: 'fetch_water'}}
        ],
        alert_nearby_villagers: [
            {type:'animate', payload: Animator.generateWalk({speed:0.8})},
            {type:'gossip', payload: 'Help! Fire!'}
        ],
        attempt_extinguish_directly: [
            {type:'animate', payload: Animator.generateThrow({power:0.6, arc:0.2})},
            {type:'item', payload: {use:'bucket', action:'splash'}}
        ],
        panic_and_flee: [
            {type:'animate', payload: Animator.generateWalk({speed:2.2, stride:1.6})},
            {type:'sound', payload: SoundMap.emotion_sounds && SoundMap.emotion_sounds.fear}
        ],
        call_iron_golems_for_help: [
            {type:'animate', payload: Animator.generateWalk({speed:1.0})},
            {type:'gossip', payload: 'Call golems!'}
        ],
        help_animals_escape: [
            {type:'animate', payload: Animator.generateWalk({speed:1.2})},
            {type:'item', payload: {use:'lead', action:'lead_animals'}}
        ]
    },

    // Iron Golem behaviors
    iron_golem_fire: {
        crush_fire: [
            {type:'animate', payload: Animator.generateAttack({power:2.0, swing:1.0})},
            {type:'sound', payload: SoundMap.action_sounds && SoundMap.action_sounds.attack}
        ],
        patrol_and_guard: [
            {type:'animate', payload: Animator.generateWalk({speed:0.8})}
        ]
    },

    // Wolf pack behavior
    wolf_behaviors: {
        hunt_prey: [ {type:'animate', payload: Animator.generateWalk({speed:1.8})}, {type:'sound', payload: SoundMap.action_sounds && SoundMap.action_sounds.run} ],
        follow_alpha: [ {type:'animate', payload: Animator.generateWalk({speed:1.0})} ],
        flee: [ {type:'animate', payload: Animator.generateWalk({speed:2.0})}, {type:'sound', payload: SoundMap.emotion_sounds && SoundMap.emotion_sounds.fear} ]
    },

    // Piglin trade/aggro behaviors
    piglin_behaviors: {
        inspect_gold_and_trade: [ {type:'animate', payload: Animator.generateWalk({speed:1.1})}, {type:'gossip', payload:'Gold!'} ],
        steal_item_and_run: [ {type:'animate', payload: Animator.generateWalk({speed:2.0})}, {type:'item', payload:{action:'steal'}} ],
        demand_gold_and_attack: [ {type:'animate', payload: Animator.generateAttack({power:1.5})}, {type:'sound', payload: SoundMap.emotion_sounds && SoundMap.emotion_sounds.anger} ],
        observe_player_cautiously: [ {type:'animate', payload: Animator.generateWalk({speed:0.6})} ]
    },

    // Blaze and ghast behaviors
    blaze_behaviors: {
        vertical_patrol: [ {type:'animate', payload: Animator.generateWalk({speed:0.6})}, {type:'sound', payload: SoundMap.action_sounds && SoundMap.action_sounds.jump} ],
        flame_burst: [ {type:'animate', payload: Animator.generateAttack({power:1.8})}, {type:'sound', payload: SoundMap.action_sounds && SoundMap.action_sounds.attack} ]
    },

    ghast_behaviors: {
        strategic_fireball: [ {type:'animate', payload: Animator.generateWalk({speed:0.4})}, {type:'sound', payload: SoundMap.action_sounds && SoundMap.action_sounds.attack} ],
        retreat: [ {type:'animate', payload: Animator.generateWalk({speed:1.2})} ]
    },

    magma_cube_behaviors: {
        split_tactic: [ {type:'animate', payload: Animator.generateAttack({power:1.2})}, {type:'effect', payload:{type:'split'}} ]
    },

    // End behaviors
    enderman_behaviors: {
        mimic_structure: [ {type:'animate', payload: Animator.generateWalk({speed:0.4})}, {type:'item', payload:{action:'place_block'}} ],
        observe_player: [ {type:'animate', payload: Animator.generateWalk({speed:0.2})} ]
    },

    ender_dragon_behaviors: {
        flank_with_wings: [ {type:'animate', payload: Animator.generateAttack({power:3.0})}, {type:'sound', payload: SoundMap.emotion_sounds && SoundMap.emotion_sounds.anger} ],
        focus_crystals: [ {type:'animate', payload: Animator.generateWalk({speed:0.8})} ],
        retreat_and_heal: [ {type:'animate', payload: Animator.generateWalk({speed:0.5})}, {type:'sound', payload: SoundMap.emotion_sounds && SoundMap.emotion_sounds.fear} ]
    },

    shulker_behaviors: {
        tactical_shell: [ {type:'animate', payload: Animator.generateWalk({speed:0.2})}, {type:'effect', payload:{type:'shield'}} ]
    },

    dolphin_behaviors: {
        rescue_item_and_return: [ {type:'animate', payload: Animator.generateSwim({speed:1.4})}, {type:'item', payload:{action:'pickup_and_return'}} ],
        play_with_player: [ {type:'animate', payload: Animator.generateSwim({speed:0.8})}, {type:'sound', payload: SoundMap.emotion_sounds && SoundMap.emotion_sounds.joy} ]
    },

    guardian_behaviors: {
        patrol_perimeter: [ {type:'animate', payload: Animator.generateSwim({speed:0.9})} ],
        focus_on_player: [ {type:'animate', payload: Animator.generateAttack({power:2.0})}, {type:'sound', payload: SoundMap.action_sounds && SoundMap.action_sounds.attack} ]
    },

    // Generic placeholder behaviors for common passive mobs
    passive_animals: {
        graze: [ {type:'animate', payload: Animator.generateWalk({speed:0.4})} ],
        flee: [ {type:'animate', payload: Animator.generateWalk({speed:1.8})}, {type:'sound', payload: SoundMap.emotion_sounds && SoundMap.emotion_sounds.fear} ]
    }
};

module.exports = Sequences;

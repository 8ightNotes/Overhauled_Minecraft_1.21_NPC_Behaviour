// faceTie_core.js - small helper showing typical pools and examples used by behaviors
// This file contains example decision pools, thought pools, and item logic templates.

const FaceTie_Pools = {
    villager_fire_decision_pool: {
        options: [
            "run_to_water_and_fetch_bucket",
            "alert_nearby_villagers",
            "attempt_extinguish_directly",
            "panic_and_flee",
            "call_iron_golems_for_help",
            "help_animals_escape"
        ],
        selection_logic: "weighted by fear and curiosity"
    },

    villager_thoughts: [
        "Help! Fire!",
        "Curious traveler nearby",
        "Repairing barn",
        "Seeking water",
        "Alerting others"
    ],

    wolf_thoughts: [
        "Hunting prey",
        "Following alpha",
        "Fleeing danger",
        "Curious about player"
    ],

    dragon_thoughts: [
        "Attack strategy: flank",
        "Crystal under threat",
        "Player approaching",
        "Retreat if too damaged"
    ],

    villager_item_logic: {
        action: "use_item",
        item_types: ["food","bucket","tool","weapon","firework"],
        context: "current_goal_and_emotion",
        animation: "context_appropriate_animation"
    }
};

// Example function to expand pools programmatically (helper)
FaceTie_Pools.expandPool = function(baseName, modifiers) {
    const base = FaceTie_Pools[baseName];
    if (!base) return null;
    const out = Object.assign({}, base);
    if (Array.isArray(out.options)) {
        out.options = out.options.concat(modifiers || []);
    }
    return out;
};

// Additional specialized pools
FaceTie_Pools.piglin_trade_pool = {
    options: [
        "inspect_gold_and_trade",
        "steal_item_and_run",
        "demand_gold_and_attack",
        "observe_player_cautiously"
    ],
    selection_logic: "weighted by curiosity and trust"
};

FaceTie_Pools.dragon_strategy_pool = {
    options: [
        "flank_with_wings",
        "direct_breath_attack",
        "focus_crystals",
        "retreat_and_heal"
    ],
    selection_logic: "weighted by anger and health"
};

FaceTie_Pools.aquatic_rescue_pool = {
    options: [
        "rescue_item_and_return",
        "alert_nearby_dolphins",
        "playful_investigate",
        "ignore_and_flee"
    ],
    selection_logic: "weighted by curiosity and trust"
};

FaceTie_Pools.guardian_defense_pool = {
    options: ["patrol_perimeter","focus_on_player","retreat_to_home","summon_help"],
    selection_logic: "weighted by anger and trust"
};

FaceTie_Pools.listPools = function() {
    return Object.keys(FaceTie_Pools).filter(k => k.endsWith('_pool') || k.endsWith('_thoughts'));
};

if (typeof module !== 'undefined') module.exports = FaceTie_Pools;
if (typeof this !== 'undefined' && !this.FaceTie_Pools) this.FaceTie_Pools = FaceTie_Pools;

// generate_behaviors.js - utility to generate behavior JSON templates for many mobs
// Run with Node.js to create entity behavior JSON templates in this project for extension.

const fs = require('fs');
const path = require('path');

const mobs = [
    // Overworld
    'villager','iron_golem','wolf','fox','pig','chicken','cow','sheep','zombie','skeleton','spider','pillager','evoker','vindicator','ravager',
    // Nether
    'piglin','hoglin','zoglin','ghast','blaze','magma_cube','strider',
    // End
    'enderman','ender_dragon','shulker','endermite',
    // Aquatic
    'cod','dolphin','squid','turtle','guardian','elder_guardian'
];

const outDir = path.join(__dirname, '..', 'entities');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});

function template(identifier) {
    return {
        "format_version": "1.19.50",
        "minecraft:entity": {
            "description": {"identifier": `overhauled:${identifier}`, "is_spawnable": true},
            "components": {
                "minecraft:health": {"value": 10}
            },
            "events": {
                "faceTie:on_tick": {"run_command": {"command": `javascript:faceTie_${identifier}_tick {entity_id}`}}
            }
        }
    };
}

for (const m of mobs) {
    const file = path.join(outDir, `${m}.behavior.json`);
    if (fs.existsSync(file)) continue; // don't overwrite
    fs.writeFileSync(file, JSON.stringify(template(m), null, 2), 'utf8');
    console.log('Wrote', file);
}

console.log('Behavior generation complete.');

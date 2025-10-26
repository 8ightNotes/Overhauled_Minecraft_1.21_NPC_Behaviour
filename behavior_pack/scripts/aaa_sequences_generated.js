// aaa_sequences_generated.js
// Programmatically generate placeholder AAA-level sequences for all entities found in behavior_pack/entities
const fs = require('fs');
const path = require('path');
const Animator = require('./animator');
const SoundMap = require('./sound_map.json');

const entitiesDir = path.join(__dirname, '..', 'entities');
const files = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.behavior.json'));

const Sequences = {};

files.forEach(f => {
  const name = path.basename(f, '.behavior.json');
  const key = `${name}_behaviors`;
  // Generate template sequences with more detailed placeholders
  Sequences[key] = {
    idle: [ {type:'animate', payload: Animator.generateWalk({speed:0.4})}, {type:'sound', payload: SoundMap.emotion_sounds && SoundMap.emotion_sounds.curiosity} ],
    investigate: [ {type:'animate', payload: Animator.generateWalk({speed:0.9})}, {type:'sound', payload: SoundMap.action_sounds && SoundMap.action_sounds.jump} ],
    attack: [ {type:'animate', payload: Animator.generateAttack({power:1.8})}, {type:'sound', payload: SoundMap.action_sounds && SoundMap.action_sounds.attack} ],
    flee: [ {type:'animate', payload: Animator.generateWalk({speed:2.0})}, {type:'sound', payload: SoundMap.emotion_sounds && SoundMap.emotion_sounds.fear} ],
    assist: [ {type:'animate', payload: Animator.generateWalk({speed:1.0})}, {type:'gossip', payload:'Assisting'} ]
  };
});

module.exports = Sequences;

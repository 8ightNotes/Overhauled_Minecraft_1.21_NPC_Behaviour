// animator.js - procedural animation helper (stub)
// Provides small procedural animation generators and mapping hooks for entities.

const Animator = (() => {
    // Generate a procedural walk animation descriptor
    function generateWalk({speed=1.0, stride=1.0, bounce=0.05} = {}) {
        return {type:'walk', speed, stride, bounce};
    }

    function generateEat({chewSpeed=1.0, headTilt=0.2} = {}) {
        return {type:'eat', chewSpeed, headTilt};
    }

    function generateThrow({power=1.0, arc=0.3} = {}) {
        return {type:'throw', power, arc};
    }

    function generateSwim({speed=1.0, stroke=1.0} = {}) {
        return {type:'swim', speed, stroke};
    }

    function generateAttack({power=1.0, swing=0.5} = {}) {
        return {type:'attack', power, swing};
    }

    // Apply animation: in-game this should call engine animation components; here it's a stub
    function applyAnimation(entityId, animationDescriptor) {
        // For debugging, store a last_animation memory event
        if (typeof require !== 'undefined') {
            try {
                const FaceTie = require('./main');
                FaceTie.remember(entityId, {type:'animation', animation: animationDescriptor});
            } catch (e) {
                // ignore
            }
        }
        if (typeof console !== 'undefined') console.log('ApplyAnimation', entityId, animationDescriptor);
        return true;
    }

    return {generateWalk, generateEat, generateThrow, generateSwim, generateAttack, applyAnimation};
})();

if (typeof module !== 'undefined') module.exports = Animator;

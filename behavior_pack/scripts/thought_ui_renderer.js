// thought_ui_renderer.js - stub for rendering Thought UI
// This file demonstrates how to pick and format thoughts for entities within range.

const ThoughtUI = (() => {
    function nearbyThoughts(centerEntityId, allEntities, range=64) {
        // allEntities: array of {id, position: {x,y,z}, thought_pool}
        const center = allEntities.find(e => e.id === centerEntityId);
        if (!center) return [];
        const results = [];
        for (const e of allEntities) {
            const dx = e.position.x - center.position.x;
            const dy = e.position.y - center.position.y;
            const dz = e.position.z - center.position.z;
            const dist2 = dx*dx + dy*dy + dz*dz;
            if (dist2 <= range*range) {
                // occlusion-aware stub: real implementation would raycast
                const lastThought = (e.thought_pool && e.thought_pool.length) ? e.thought_pool[e.thought_pool.length-1].thought : '';
                results.push({id: e.id, thought: lastThought});
            }
        }
        return results;
    }

    // Render mapping (client): in Bedrock this would create UI overlays. Here it's a format helper.
    function formatForRender(thoughtEntries) {
        return thoughtEntries.map(t => `${t.id}: ${t.thought}`);
    }

    return {nearbyThoughts, formatForRender};
})();

if (typeof module !== 'undefined') module.exports = ThoughtUI;

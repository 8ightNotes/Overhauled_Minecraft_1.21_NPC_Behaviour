// thought_ui_client_system.js
// Client-side system for Minecraft Bedrock Script Engine (experimental).
// Listens for 'overhauled:thought_update' events and displays a small HUD (actionbar)
// showing the thought. This is a cross-platform fallback; replace with a proper
// UI overlay if your client runtime exposes it.

(function() {
    if (typeof client === 'undefined' && typeof client_registerSystem === 'undefined' && typeof client.registerSystem === 'undefined') {
        if (typeof console !== 'undefined') console.warn('Client thought UI: client.registerSystem not available in this host');
        return;
    }

    const system = (typeof client !== 'undefined' && client.registerSystem) ? client.registerSystem(0, 0) : (typeof client_registerSystem !== 'undefined' ? client_registerSystem() : null);
    if (!system) {
        if (typeof console !== 'undefined') console.warn('Client thought UI: failed to register client system');
        return;
    }

    system.initialize = function() {
        // Listen for the custom event the server integration broadcasts
        this.listenForEvent('overhauled:thought_update', (e) => this.onThoughtUpdate(e));
    };

    system.onThoughtUpdate = function(eventData) {
        try {
            const data = eventData.data || eventData;
            const thought = data.thought || '';
            const mob = data.mob || '';
            if (!thought) return;
            // Use actionbar/title as a simple HUD overlay (works across platforms)
            // Example: show actionbar text to the local player
            const text = `${mob}: ${thought}`;
            // Use /title actionbar as a short HUD message
            // Note: executeCommand on client may be restricted on some platforms.
            try {
                this.executeCommand(`title @s actionbar ${JSON.stringify(text)}`, () => {});
            } catch (e) {
                // Fallback: log to console
                if (typeof console !== 'undefined') console.log('Thought HUD:', text);
            }
        } catch (err) {
            if (typeof console !== 'undefined') console.warn('Thought UI client error', err);
        }
    };

})();

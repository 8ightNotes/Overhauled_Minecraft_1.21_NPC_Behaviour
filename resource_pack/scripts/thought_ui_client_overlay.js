// thought_ui_client_overlay.js
// Client overlay implementation (best-effort) for Bedrock 1.21 Script Engine.
// Because true world-to-screen projection and icon overlays are limited in some hosts,
// this script uses a short-lived actionbar/title HUD and a lightweight overlay JSON
// as a placeholder for a proper UI. Replace icons under resource_pack/textures/ui/thoughts/.

(function() {
    const DISPLAY_MS = 3000; // how long to display a thought
    const REFRESH_MS = 500; // refresh to keep overlay visible

    // Keep a small registry of active thoughts to refresh overlay
    const activeThoughts = new Map(); // key: entityId, value: {mob, thought, expires}

    function displayActionbarForPlayer(system, text) {
        try {
            // Use JSON text to support simple formatting; we use title actionbar
            system.executeCommand(`title @s actionbar ${JSON.stringify(text)}`, () => {});
        } catch (e) {
            if (typeof console !== 'undefined') console.log('HUD actionbar fallback:', text);
        }
    }

    // Client system registration
    const clientSystem = (typeof client !== 'undefined' && client.registerSystem) ? client.registerSystem(0,0) : null;
    if (!clientSystem) {
        if (typeof console !== 'undefined') console.warn('thought_ui_client_overlay: client.registerSystem not available');
        return;
    }

    clientSystem.initialize = function() {
        // Listen for the custom event from server integration
        this.listenForEvent('overhauled:thought_update', (e) => this.onThoughtUpdate(e));
        // Periodic refresh to keep overlay visible
        this.interval = 0;
    };

    clientSystem.update = function() {
        this.interval += 1;
        if (this.interval % (REFRESH_MS / 50) !== 0) return; // approximate 50ms ticks
        const now = Date.now();
        for (const [id, entry] of activeThoughts.entries()) {
            if (entry.expires <= now) {
                activeThoughts.delete(id);
                continue;
            }
            // show actionbar for local player
            const icon = '💭'; // placeholder emoji; replace with texture-based overlay if available
            const text = `${icon} ${entry.mob}: ${entry.thought}`;
            displayActionbarForPlayer(this, text);
        }
    };

    clientSystem.onThoughtUpdate = function(eventData) {
        try {
            const data = eventData.data || eventData;
            const id = data.entityId || (data.mob + '_' + Math.random());
            const mob = data.mob || 'entity';
            const thought = data.thought || '';
            if (!thought) return;
            activeThoughts.set(id, {mob, thought, expires: Date.now() + DISPLAY_MS});
            // immediate display
            const icon = '💭';
            displayActionbarForPlayer(this, `${icon} ${mob}: ${thought}`);
        } catch (e) {
            if (typeof console !== 'undefined') console.warn('onThoughtUpdate failed', e);
        }
    };

})();

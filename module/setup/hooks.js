import { removeExpiredEffects } from '../scripts/temporaryEffects/temporaryEffectHook.js';
import { applyGeneralCombatHooks } from '../scripts/combat/generalCombatHook.js';
import { countdownDurationOfRegions } from '../scripts/regions/regionHooks.js';

export function registerHooks() {
    Hooks.on('updateCombat', (combat, update, options, userId) => {
        combatHooks(combat, update, options, userId);
    });
}

function combatHooks(combat, update, options, userId) {
    applyGeneralCombatHooks(combat);
    removeExpiredEffects(combat);
    countdownDurationOfRegions(combat, update, options, userId);
}

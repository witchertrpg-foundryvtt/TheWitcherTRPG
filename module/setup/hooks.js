import { removeExpiredActiveEffects } from '../scripts/activeEffects/activeEffectHook.js';
import { applyGeneralCombatHooks } from '../scripts/combat/generalCombatHook.js';
import { countdownDurationOfRegions } from '../scripts/regions/regionHooks.js';

export function registerHooks() {
    Hooks.on('updateCombat', (combat, update, options, userId) => {
        combatHooks(combat, update, options, userId);
    });
}

function combatHooks(combat, update, options, userId) {
    applyGeneralCombatHooks(combat);
    removeExpiredActiveEffects(combat);
    countdownDurationOfRegions(combat, update, options, userId);
}

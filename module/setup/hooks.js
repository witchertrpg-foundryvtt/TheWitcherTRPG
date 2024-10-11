import { removeExpiredActiveEffects } from '../scripts/activeEffects/activeEffectHook.js';

export function registerHooks() {
    Hooks.on('updateCombat', (combat, update, options, userId) => {
        combatHooks(combat, update, options, userId);
    });
}

function combatHooks(combat, update, options, userId) {
    removeExpiredActiveEffects(combat);
}

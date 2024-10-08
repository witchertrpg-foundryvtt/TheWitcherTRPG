import { removeExpiredActiveEffects } from '../scripts/activeEffects/activeEffectHook.js';
import { applyStatusRoundEffects } from '../scripts/statusEffects/statusEffectHook.js';

export function registerHooks() {
    Hooks.on('updateCombat', (combat, update, options, userId) => {
        combatHooks(combat, update, options, userId);
    });
}

function combatHooks(combat, update, options, userId) {
    removeExpiredActiveEffects(combat);
    applyStatusRoundEffects(combat);
}

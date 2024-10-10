import { applyActiveEffectToActor, applyActiveEffectToActorViaId } from '../scripts/activeEffects/applyActiveEffect.js';
import { applyStatusEffectToActor } from '../scripts/statusEffects/applyStatusEffect.js';

export const registerSocketListeners = function () {
    let SYSTEM_SOCKET = 'system.TheWitcherTRPG';

    let callableFunctions = {
        applyStatusEffectToActor,
        applyActiveEffectToActor,
        applyActiveEffectToActorViaId
    };

    if (!game.socket || !game.user) return;

    game.socket.on(SYSTEM_SOCKET, async message => {
        if (game.user !== game.users.activeGM) return;

        console.log('Received system socket message.', message);

        callableFunctions[message.type](...message.data);
    });
};

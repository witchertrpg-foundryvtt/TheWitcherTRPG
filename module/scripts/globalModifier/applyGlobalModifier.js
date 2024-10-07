import { emitForGM } from '../socket/socketMessage.js';

export async function applyModifierToTargets(globalModifiers) {
    let targets = game.user.targets;

    if (targets.size == 0) return;

    targets.forEach(target => {
        let actorUuid = target.actor.uuid;
        globalModifiers.forEach(modifier => applyModifierToActor(actorUuid, modifier));
    });
}

export async function applyModifierToActor(actorUuid, globalModifier) {
    let actor = fromUuidSync(actorUuid);

    if (!actor) return;

    if (!actor.isOwner) {
        sendToGm(actorUuid, globalModifier);
        return;
    }

    actor._activateGlobalModifier(globalModifier);
}

function sendToGm(actorUuid, globalModifier) {
    emitForGM('applyModifierToActor', [actorUuid, globalModifier]);
}

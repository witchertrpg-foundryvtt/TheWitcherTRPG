import { emitForGM } from '../socket/socketMessage.js';

export async function applyActiveEffectToTargets(activeEffects, duration) {
    let targets = game.user.targets;

    if (targets.size == 0) return;

    targets.forEach(target => {
        let actorUuid = target.actor.uuid;
        applyActiveEffectToActor(actorUuid, activeEffects, duration);
    });
}

export async function applyActiveEffectToActorViaId(actorUuid, itemUuid, applyWhen, duration) {
    let item = fromUuidSync(itemUuid);

    if (!item) {
        sendToGm('applyActiveEffectToActorViaId', actorUuid, itemUuid, applyWhen, duration);
        return;
    }

    applyActiveEffectToActor(
        actorUuid,
        item.effects.filter(effect => effect.system[applyWhen]),
        duration
    );
}

export async function applyActiveEffectToActor(actorUuid, activeEffects, duration) {
    let actor = fromUuidSync(actorUuid);

    if (!actor) return;

    if (!actor.isOwner) {
        sendToGm('applyActiveEffectToActor', actorUuid, activeEffects, duration);
        return;
    }

    let newEffects = activeEffects.map(effect =>
        effect.clone(
            {
                'duration.rounds': duration ?? effect.duration.rounds,
                'duration.combat': ui.combat.combats.find(combat => combat.isActive)?.id,
                'system.applySelf': false,
                'system.applyOnTarget': false,
                'system.applyOnHit': false,
                'system.applyOnDamage': false
            },
            { parent: actor }
        )
    );

    actor.createEmbeddedDocuments('ActiveEffect', newEffects);
}

function sendToGm(call, actorUuid, activeEffects, duration) {
    emitForGM(call, [actorUuid, activeEffects, duration]);
}

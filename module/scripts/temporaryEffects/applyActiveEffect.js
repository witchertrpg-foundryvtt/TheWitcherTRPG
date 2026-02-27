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

    applyTemporaryItemImprovements(actor, activeEffects);

    if (!actor.isOwner) {
         sendToGm(
             'applyActiveEffectToActor',
             actorUuid,
             activeEffects.filter(effect => effect.type != 'temporaryItemImprovement'),
             duration
         );
        return;
    }

    let newEffects = activeEffects
        .filter(effect => effect.type != 'temporaryItemImprovement')
        .map(effect =>
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

    await actor.createEmbeddedDocuments('ActiveEffect', newEffects);
}

async function applyTemporaryItemImprovements(actor, activeEffects) {
    if (!actor.isOwner) {
        getActorOwner(actor).query('TheWitcherTRPG.applyTemporaryItemImprovements', {
            actorUuid: actor.uuid,
            effects: activeEffects
        });
        return;
    }

    actor.applyTemporaryItemImprovements(activeEffects);
}

function getActorOwner(actor) {
    let owner = game.users.activeGM;
    if (actor.hasPlayerOwner) {
        owner = game.users.find(e => actor.testUserPermission(e, 'OWNER') && !e.isGM);
    }
    return owner;
}

function sendToGm(call, actorUuid, activeEffects, duration) {
    emitForGM(call, [actorUuid, activeEffects, duration]);
}

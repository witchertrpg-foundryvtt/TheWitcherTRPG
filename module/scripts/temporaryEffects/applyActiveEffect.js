import { getActorOwner } from '../helper.js';

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
        game.users.activeGM.query('TheWitcherTRPG.query', {
            function: 'applyActiveEffectToActorViaId',
            data: [actorUuid, itemUuid, applyWhen, duration]
        });
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

    activeEffects.forEach(effect => (effect.duration.rounds = duration ?? effect.duration.rounds));
    applyTemporaryItemImprovements(actor, activeEffects);

    if (!actor.isOwner) {
        getActorOwner(actor).query('TheWitcherTRPG.query', {
            function: 'applyActiveEffectToActor',
            data: [actorUuid, activeEffects.filter(effect => effect.type != 'temporaryItemImprovement')]
        });
        return;
    }

    let newEffects = activeEffects
        .filter(effect => effect.type != 'temporaryItemImprovement')
        .map(effect => {
            if (effect.clone) return effect;
            else return new ActiveEffect(effect);
        })
        .map(effect =>
            effect.clone(
                {
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

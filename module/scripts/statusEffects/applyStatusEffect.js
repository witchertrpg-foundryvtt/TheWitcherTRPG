import { getCurrentCharacter } from '../helper.js';
import { emitForGM } from '../socket/socketMessage.js';

export function addStatusEffectChatListeners(html) {
    // setup chat listener messages for each message as some need the message context instead of chatlog context.
    html.find('.chat-message').each(async (index, element) => {
        element = $(element);
        const id = element.data('messageId');
        const message = game.messages?.get(id);
        if (!message) return;

        await chatMessageListeners(message, element);
    });
}

export const chatMessageListeners = async (message, html) => {
    if (!html.find('a.apply-status')) return;

    html.find('a.apply-status').on('click', event => onApplyStatus(event));
};

export async function onApplyStatus(event) {
    let statusId = event.currentTarget.dataset.status;
    let target = getCurrentCharacter();

    applyStatusEffectToActor(target.uuid, statusId, event.currentTarget.dataset.duration);
}

export async function applyStatusEffectToTargets(statusEffects, duration) {
    let targets = game.user.targets;

    if (targets.size == 0) return;

    targets.forEach(target => {
        let actorUuid = target.actor.uuid;
        statusEffects.forEach(effect => applyStatusEffectToActor(actorUuid, effect.statusEffect, duration));
    });
}

export async function applyStatusEffectToActor(actorUuid, statusEffectId, duration) {
    let actor = fromUuidSync(actorUuid);

    if (!actor) return;

    if (!actor.isOwner) {
        sendToGm(actorUuid, statusEffectId, duration);
        return;
    }

    //only try to apply it when not already present
    if (!actor.appliedEffects.find(effect => effect.statuses.find(status => status == statusEffectId))) {
        await actor.toggleStatusEffect(statusEffectId);

        handleStatusCounterIntegration(actor, statusEffectId, duration);

        if (actor.system.statusEffectImmunities?.find(immunity => immunity == statusEffectId)) {
            //untoggle it so people see it was tried to be applied but failed
            setTimeout(() => {
                actor.toggleStatusEffect(statusEffectId);
            }, 1000);
        }
    }
}

function handleStatusCounterIntegration(target, statusId, duration) {
    if (!game.modules.get('statuscounter')?.active) return;

    if (!duration || duration == 0) return;

    let statusEffect = CONFIG.WITCHER.statusEffects.find(statusEffect => statusEffect.id == statusId);

    let effectCounter = EffectCounter.getAllCounters(target).find(effects => effects.path == statusEffect.img);
    effectCounter.setValue(parseInt(duration));
    effectCounter.changeType('statuscounter.countdown_round', target);
}

function sendToGm(actorUuid, statusEffectId, duration) {
    emitForGM('applyStatusEffectToActor', [actorUuid, statusEffectId, duration]);
}

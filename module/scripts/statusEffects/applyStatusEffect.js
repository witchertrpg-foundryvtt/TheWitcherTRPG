import { getCurrentCharacter } from "../helper.js";

export function addStatusEffectChatListeners(html) {
    // setup chat listener messages for each message as some need the message context instead of chatlog context.
    html.find('.chat-message').each(async (index, element) => {
        element = $(element);
        const id = element.data('messageId');
        const message = game.messages?.get(id);
        if (!message) return;

        await chatMessageListeners(message, element)
    });
}

export const chatMessageListeners = async (message, html) => {
    if (!html.find('a.apply-status'))
        return;

    html.find('a.apply-status').on('click', event => onApplyStatus(event));
}

export async function onApplyStatus(event) {
    let statusId = event.currentTarget.dataset.status
    let target = getCurrentCharacter();

    //only try to apply it when not already present
    if (!target.appliedEffects.find(effect => effect.statuses.find(status => status == statusId))) {
        await target.toggleStatusEffect(statusId)

        handleStatusCounterIntegration(target, statusId, event.currentTarget.dataset.duration)

        if (target.system.statusEffectImmunities?.find(immunity => immunity == statusId)) {
            //untoggle it so people see it was tried to be applied but failed
            setTimeout(() => {
                target.toggleStatusEffect(statusId)
            }, 1000);

        }
    }
}

function handleStatusCounterIntegration(target, statusId, duration) {
    if (!game.modules.get("statuscounter")?.active) return;

    if (!duration || duration == 0) return;

    let statusEffect = CONFIG.WITCHER.statusEffects.find(statusEffect => statusEffect.id == statusId)

    let effectCounter = EffectCounter.getAllCounters(target).find(effects => effects.path == statusEffect.img)
    effectCounter.setValue(duration)
    effectCounter.changeType("statuscounter.countdown_round", target)
}
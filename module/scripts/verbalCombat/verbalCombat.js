import { getInteractActor } from '../helper.js';

export function addVerbalCombatChatListeners(html) {
    // setup chat listener messages for each message as some need the message context instead of chatlog context.
    html.querySelector('.chat-message').each(async (index, element) => {
        element = $(element);
        const id = element.data('messageId');
        const message = game.messages?.get(id);
        if (!message) return;

        await chatMessageListeners(message, element);
    });
}

export function addVerbalCombatMessageContextOptions(html, options) {
    let canApplyVcDamage = li => li.querySelector('.verbalcombat-damage-message')?.length;
    options.push({
        name: `${game.i18n.localize('WITCHER.Context.applyDmg')}`,
        icon: '<i class="fas fa-user-minus"></i>',
        condition: canApplyVcDamage,
        callback: async li => {
            applyVerbalCombatDamage(
                await getInteractActor(),
                li.querySelector('.dice-total')[0].innerText,
                li.dataset.messageId
            );
        }
    });
    return options;
}

export const chatMessageListeners = async (message, html) => {
    if (!html.querySelector('button.vcDamage') && !!html.querySelector('a.apply-status')) return;

    html.querySelector('button.vcDamage')?.addEventListener('click', _ => onDamage(message));
};

function onDamage(message) {
    let verbalCombat = message.getFlag('TheWitcherTRPG', 'verbalCombat');
    let damage = message.getFlag('TheWitcherTRPG', 'damage');
    rollDamage(verbalCombat, damage);
}

export async function rollDamage(verbalCombat, damage) {
    let messageData = {};
    messageData.flavor = `<div class="verbalcombat-damage-message" <h1>${game.i18n.localize('WITCHER.table.Damage')}: ${game.i18n.localize(verbalCombat.name)} </h1>`;

    let message = await (await new Roll(damage.formula).evaluate()).toMessage(messageData);
    message.setFlag('TheWitcherTRPG', 'damage', damage);
}

export async function applyVerbalCombatDamage(targetActor, totalDamage, messageId) {
    let currentResolve = targetActor.system.derivedStats.resolve.value;
    targetActor.update({ 'system.derivedStats.resolve.value': currentResolve - Math.floor(totalDamage) });
}

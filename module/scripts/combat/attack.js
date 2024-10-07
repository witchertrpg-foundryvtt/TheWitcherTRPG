import { getRandomInt } from '../helper.js';

const DialogV2 = foundry.applications.api.DialogV2;

export function addAttackChatListeners(html) {
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
    if (!html.find('button.damage')) return;

    html.find('button.damage').on('click', _ => onDamage(message));
};

function onDamage(message) {
    let item = message.getFlag('TheWitcherTRPG', 'attack').item;
    let damage = message.getFlag('TheWitcherTRPG', 'damage');

    rollDamage(item, damage);
}

export async function rollDamage(item, damage) {
    let messageData = {};
    messageData.flavor = `<div class="damage-message" <h1><img src="${item.img}" class="item-img" />${game.i18n.localize('WITCHER.table.Damage')}: ${item.name} </h1>`;

    if (damage.damageProperties.variableDamage) {
        damage.formula = await createVariableDamageDialog(damage.formula);
    }

    if (damage.formula == '') {
        damage.formula = '0';
        ui.notifications.error(`${game.i18n.localize('WITCHER.NoDamageSpecified')}`);
    }

    if (damage.strike == 'strong') {
        damage.formula = `(${damage.formula})*2`;
        messageData.flavor += `<div>${game.i18n.localize('WITCHER.Dialog.strikeStrong')}</div>`;
    }
    messageData.flavor += `<div><b>${game.i18n.localize('WITCHER.Dialog.attackLocation')}:</b> ${damage.location.alias} = ${damage.location.locationFormula} </div>`;
    let damageTypeloc = damage.type ? 'WITCHER.Armor.' + damage.type : '';
    messageData.flavor += `<div><b>${game.i18n.localize('WITCHER.Dialog.damageType')}:</b> ${game.i18n.localize(damageTypeloc)} </div>`;
    messageData.flavor += `<div>${game.i18n.localize('WITCHER.Damage.RemoveSP')}</div>`;

    if (damage.damageProperties.effects && damage.damageProperties.effects.length > 0) {
        messageData.flavor += `<b>${game.i18n.localize('WITCHER.Item.Effect')}:</b>`;

        damage.damageProperties.effects.forEach((effect, index, effectArray) => {
            messageData.flavor += `<div class="flex gap">`;
            if (effect.name != '') {
                messageData.flavor += `<span>${effect.name}</span>`;
            }
            if (effect.statusEffect) {
                let statusEffect = CONFIG.WITCHER.statusEffects.find(status => status.id == effect.statusEffect);
                messageData.flavor += `<a class='apply-status' data-status='${effect.statusEffect}' ><img class='chat-icon' src='${statusEffect.img}' /> <span>${game.i18n.localize(statusEffect.name)}</span></a>`;
            }
            if (effect.percentage) {
                let rollPercentage = getRandomInt(100);
                messageData.flavor += `<div data-tooltip='${game.i18n.localize('WITCHER.Effect.Rolled')}: ${rollPercentage}'>(${effect.percentage}%) `;
                if (rollPercentage > effect.percentage) {
                    messageData.flavor += `<span class="percentageFailed">${game.i18n.localize('WITCHER.Effect.Failed')}</span>`;
                    effectArray[index].applied = false;
                } else {
                    messageData.flavor += `<span class="percentageSuccess">${game.i18n.localize('WITCHER.Effect.Applied')}</span>`;
                    effectArray[index].applied = true;
                }
                messageData.flavor += '</div>';
            }

            messageData.flavor += `</div>`;
        });
    }

    let message = await (await new Roll(damage.formula).evaluate()).toMessage(messageData);
    message.setFlag('TheWitcherTRPG', 'damage', damage);
}

async function createVariableDamageDialog(damageFormula) {
    const dialogTemplate = await renderTemplate('systems/TheWitcherTRPG/templates/dialog/combat/variableDamage.hbs', {
        currentDamage: damageFormula
    });

    let newDamageFormula = await DialogV2.prompt({
        ok: {
            callback: (event, button, dialog) => button.form.elements.newDamage.value
        },
        title: `${game.i18n.localize('WITCHER.Item.DamageProperties.variableDamage')}`,
        content: dialogTemplate
    });

    return newDamageFormula;
}

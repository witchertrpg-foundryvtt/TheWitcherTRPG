import { getCurrentToken } from "./helper.js";
import { getRandomInt } from "./witcher.js";

export function addAttackChatListeners(html) {

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
    if (!html.find('button.damage') && !!html.find('a.apply-status'))
        return;

    html.find('button.damage').on('click', _ => onDamage(message));
    html.find('a.apply-status').on('click', event => onApplyStatus(event));
}

function onDamage(message) {
    let item = message.getFlag('TheWitcherTRPG', 'attack').item
    let damage = message.getFlag('TheWitcherTRPG', 'damage');

    if (damage.location.name == "randomSpell") {
        let actor = game.actors.get(message.speaker.actor) || game.actors[0];
        damage.location.name = actor.getLocationObject("randomHuman");
    }
    rollDamage(item, damage);
}

export async function rollDamage(item, damage) {
    let messageData = {}
    messageData.flavor = `<div class="damage-message" <h1><img src="${item.img}" class="item-img" />${game.i18n.localize("WITCHER.table.Damage")}: ${item.name} </h1>`;

    if (damage.formula == "") {
        damage.formula = "0"
        ui.notifications.error(`${game.i18n.localize("WITCHER.NoDamageSpecified")}`)
    }

    if (damage.strike == "strong") {
        damage.formula = `(${damage.formula})*2`;
        messageData.flavor += `<div>${game.i18n.localize("WITCHER.Dialog.strikeStrong")}</div>`;
    }
    messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Dialog.attackLocation")}:</b> ${damage.location.alias} = ${damage.location.locationFormula} </div>`;
    let damageTypeloc = damage.type ? "WITCHER.Armor." + damage.type : ""
    messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Dialog.damageType")}:</b> ${game.i18n.localize(damageTypeloc)} </div>`;
    messageData.flavor += `<div>${game.i18n.localize("WITCHER.Damage.RemoveSP")}</div>`;

    if (damage.effects && damage.effects.length > 0) {
        messageData.flavor += `<b>${game.i18n.localize("WITCHER.Item.Effect")}:</b>`;

        damage.effects.forEach(effect => {
            messageData.flavor += `<div class="flex gap">`;
            if (effect.name != '') {
                messageData.flavor += `<span>${effect.name}</span>`;
            }
            if (effect.statusEffect) {
                let statusEffect = CONFIG.WITCHER.statusEffects.find(status => status.id == effect.statusEffect);
                messageData.flavor += `<a class='apply-status' data-status='${effect.statusEffect}' ><img class='chat-icon' src='${statusEffect.icon}' /> <span>${game.i18n.localize(statusEffect.label)}</span></a>`;
            }
            if (effect.percentage) {
                let rollPercentage = getRandomInt(100);
                messageData.flavor += `<div data-tooltip='${game.i18n.localize("WITCHER.Effect.Rolled")}: ${rollPercentage}'>(${effect.percentage}%) `;
                if (rollPercentage > effect.percentage) {
                    messageData.flavor += `<span class="percentageFailed">${game.i18n.localize("WITCHER.Effect.Failed")}</span>`
                }
                else {
                    messageData.flavor += `<span class="percentageSuccess">${game.i18n.localize("WITCHER.Effect.Applied")}</span>`;
                }
                messageData.flavor += '</div>'
            }

            messageData.flavor += `</div>`;
        });
    }

    let message = await (await new Roll(damage.formula).evaluate()).toMessage(messageData)
    message.setFlag('TheWitcherTRPG', 'damage', damage);
}

async function onApplyStatus(event) {
    let statusId = event.currentTarget.dataset.status
    let target = getCurrentToken();

    //only try to apply it when not already present
    if (!target.actor.appliedEffects.find(effect => effect.statuses.find(status => status == statusId))) {
        await target?.toggleEffect(CONFIG.WITCHER.statusEffects.find(effect => effect.id == statusId))

        if (target?.actor.system.statusEffectImmunities?.find(immunity => immunity == statusId)) {
            //untoggle it so people see it was tried to be applied but failed
            setTimeout(() => {
                target?.toggleEffect(CONFIG.WITCHER.statusEffects.find(effect => effect.id == statusId))
            }, 1000);

        }
    }
}
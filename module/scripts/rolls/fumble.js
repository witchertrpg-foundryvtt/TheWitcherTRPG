import { getInteractActor } from "../helper.js";

export function addFumbleContextOptions(html, options) {
    let isFumble = li => game.messages.get(li[0].dataset.messageId).rolls[0].options.fumble
    options.push(
        {
            name: `${game.i18n.localize("WITCHER.Context.fumble")}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: isFumble,
            callback: async li => {
                applyFumble(
                    await getInteractActor(),
                    game.messages.get(li[0].dataset.messageId)
                )
            }
        }
    );
    return options;
}

function applyFumble(actor, message) {
    console.log(actor, message)

    checkAndHandleAttackFumble(message)
    checkAndHandleDefenseFumble(message)
}

function checkAndHandleAttackFumble(message) {
    const attack = message.getFlag('TheWitcherTRPG', 'attack')
    if (attack) {
        attackFumble(message)
    }
}

function attackFumble(message) {
    const fumbleAmount = message.rolls[0].options.fumbleAmount
    const attack = message.getFlag('TheWitcherTRPG', 'attack')
    const actor = fromUuidSync(attack.origin.uuid)

    let fumbleResult;

    if (CONFIG.WITCHER.meleeSkills.includes(attack.attackSkill)) {
        if (attack.attackSkill == "brawling") {
            unarmedAttackDefense(fumbleAmount)
        }
        else {
            if (fumbleAmount < 6) {
                fumbleResult = "nothing"
            }
            else if (fumbleAmount < 10) {
                fumbleResult = "meleeAttack." + fumbleAmount

            }
            else {
                fumbleResult = "meleeAttack.>9"
            }
        }

    }

    if (CONFIG.WITCHER.rangedSkills.includes(attack.attackSkill)) {
        if (fumbleAmount < 6) {
            fumbleResult = "nothing"
        }
        else if (fumbleAmount < 7) {
            fumbleResult = "rangedAttack.6-7"
        }
        else if (fumbleAmount < 9) {
            fumbleResult = "rangedAttack.8-9"
        }
        else {
            fumbleResult = "rangedAttack.>9"
        }
    }

    //magical fumble
    if (attack.spell) {
        if (fumbleAmount < 7) {
            fumbleResult = "magic.1-6"
        }
        else if (fumbleAmount < 10) {
            fumbleResult = "magic.7-9"
        }
        else {
            fumbleResult = "magic.>9"
        }
    }

    createResultMessage(actor, fumbleResult)
}

function checkAndHandleDefenseFumble(message) {
    const defense = message.getFlag('TheWitcherTRPG', 'defenseSkill')
    if (defense) {
        defenseFumble(message)
    }
}

function defenseFumble(message) {
    const actor = fromUuidSync(message.getFlag('TheWitcherTRPG', 'origin').uuid)
    const fumbleAmount = message.rolls[0].options.fumbleAmount
    if (fumbleAmount < 6) {
        createResultMessage(actor, "nothing")
        return;
    }

    const defense = message.getFlag('TheWitcherTRPG', 'defenseSkill')

    if (CONFIG.WITCHER.meleeSkills.includes(defense.name) && defense.name != "brawling") {
        if (fumbleAmount < 9) {
            createResultMessage(actor, "armedDefense." + fumbleAmount)
            return
        }

        createResultMessage(actor, "armedDefense.>9")
    }
    else {
        unarmedAttackDefense(actor, fumbleAmount)
    }

}

function unarmedAttackDefense(actor, fumbleAmount) {
    if (fumbleAmount < 9) {
        createResultMessage(actor, "unarmed." + fumbleAmount)
    }

    if (fumbleAmount > 9) {
        createResultMessage(actor, "unarmed.>9")
    }
}

async function createResultMessage(actor, result) {
    const content = `<div>${game.i18n.localize("WITCHER.fumbleResults.name")}: ${game.i18n.localize("WITCHER.fumbleResults." + result)}</div>`

    const chatData = {
        user: game.user.id,
        content: content,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        type: CONST.CHAT_MESSAGE_STYLES.OTHER,
    }

    ChatMessage.create(chatData)
}

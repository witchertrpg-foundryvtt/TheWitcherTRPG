import { getInteractActor } from '../helper.js';

export function addAttackChatListeners(html) {
    // setup chat listener messages for each message as some need the message context instead of chatlog context.
    html.find('.chat-message').each(async (index, element) => {
        element = $(element);
        const id = element.data('messageId');
        const message = game.messages?.get(id);
        if (!message) return;

        await attackChatMessageListeners(message, element);
    });
}

export const attackChatMessageListeners = async (message, html) => {
    html.querySelector('button.damage')?.addEventListener('click', _ => onDamage(message));
};

function onDamage(message) {
    let item = fromUuidSync(message.system.attack.itemUuid);
    let damage = message.system.damage;

    item.rollDamage(damage);
}

export const defenseChatMessageListeners = async (message, html) => {
    html.querySelectorAll('button.stun').forEach(button =>
        button.addEventListener('click', async _ => {
            console.log(message);
            (await getInteractActor()).stunSave(message.system.attackWeaponProperties.stun);
        })
    );

    html.querySelectorAll('button.crit-stun').forEach(button =>
        button.addEventListener('click', async _ => {
            (await getInteractActor()).stunSave();
        })
    );
};

export function addDefenseOptionsContextMenu(html, options) {
    let canDefend = li => game.messages.get(li.dataset.messageId).system.defenseOptions;
    options.push({
        name: `${game.i18n.localize('WITCHER.Context.Defense')}`,
        icon: '<i class="fas fa-shield-alt"></i>',
        condition: canDefend,
        callback: async li => {
            executeDefense(await getInteractActor(), li.dataset.messageId);
        }
    });
    return options;
}

async function executeDefense(actor, messageId) {
    if (!actor) return;

    let message = game.messages.get(messageId);

    actor.prepareAndExecuteDefense(
        message.system.attack,
        message.system.defenseOptions,
        message.system.damage,
        message.system.attackRoll,
        message.system.attacker
    );
}

export function addCritMessageContextOptions(html, options) {
    let wasCritted = li => li.querySelector('.crit-taken');
    options.push(
        {
            name: `${game.i18n.localize('WITCHER.Context.applyCritDmg')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: wasCritted,
            callback: async li => {
                (await getInteractActor()).applyCritDamage(
                    game.messages.get(li.dataset.messageId).getFlag('TheWitcherTRPG', 'crit')
                );
            }
        },
        {
            name: `${game.i18n.localize('WITCHER.Context.applyBonusCritDmg')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: wasCritted,
            callback: async li => {
                (await getInteractActor()).applyBonusCritDamage(
                    game.messages.get(li.dataset.messageId).getFlag('TheWitcherTRPG', 'crit')
                );
            }
        },
        {
            name: `${game.i18n.localize('WITCHER.Context.applyCritWound')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: wasCritted,
            callback: async li => {
                (await getInteractActor()).applyCritWound(
                    game.messages.get(li.dataset.messageId).getFlag('TheWitcherTRPG', 'crit')
                );
            }
        }
    );
    return options;
}

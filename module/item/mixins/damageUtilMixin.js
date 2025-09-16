import WitcherActor from '../../actor/witcherActor.js';
import ChatMessageData from '../../chatMessage/chatMessageData.js';
import { getRandomInt } from '../../scripts/helper.js';

const DialogV2 = foundry.applications.api.DialogV2;

export let damageUtilMixin = {
    createBaseDamageObject() {
        return {
            properties: foundry.utils.deepClone(this.system.damageProperties),
            item: this,
            itemUuid: this.uuid,
            crit: {
                critLocationModifier: this.parent.system.attackStats.critLocationModifier,
                critEffectModifier: this.parent.system.attackStats.critEffectModifier
            },
            defenseOptions: foundry.utils.deepClone(this.system.defenseOptions)
        };
    },

    async rollDamage(damage) {
        let messageData = new ChatMessageData(this.parent);
        messageData.flavor = `<div class="damage-message" <h1><img src="${this.img}" class="item-img" />${game.i18n.localize('WITCHER.table.Damage')}: ${this.name} </h1>`;

        if (damage.properties.variableDamage) {
            damage.formula = await this.createVariableDamageDialog(damage.formula);
        }

        if (damage.formula == '') {
            damage.formula = '0';
            ui.notifications.error(`${game.i18n.localize('WITCHER.NoDamageSpecified')}`);
        }

        if (CONFIG.WITCHER.weapon.attacks[damage.strike]?.dmgMulti) {
            damage.formula = `(${damage.formula})${CONFIG.WITCHER.weapon.attacks[damage.strike].dmgMulti}`;
            messageData.flavor += `<div>${game.i18n.localize(CONFIG.WITCHER.weapon.attacks[damage.strike].label)}</div>`;
        }

        damage.location = WitcherActor.getLocationObject(damage.location.name);

        messageData.flavor += `<div><b>${game.i18n.localize('WITCHER.Dialog.attackLocation')}:</b> ${damage.location.alias} = ${damage.location.locationFormula} </div>`;
        let damageTypeloc = damage.type ? 'WITCHER.DamageType.' + damage.type : '';
        messageData.flavor += `<div><b>${game.i18n.localize('WITCHER.Dialog.damageType')}:</b> ${game.i18n.localize(damageTypeloc)} </div>`;
        messageData.flavor += `<div>${game.i18n.localize('WITCHER.Damage.RemoveSP')}</div>`;

        if (damage.properties.effects && damage.properties.effects.length > 0) {
            messageData.flavor += `<b>${game.i18n.localize('WITCHER.Item.Effect')}:</b>`;

            damage.properties.effects.forEach((effect, index, effectArray) => {
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
    },

    async createVariableDamageDialog(damageFormula) {
        const dialogTemplate = await renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/combat/variableDamage.hbs',
            {
                currentDamage: damageFormula
            }
        );

        let newDamageFormula = await DialogV2.prompt({
            ok: {
                callback: (event, button, dialog) => button.form.elements.newDamage.value
            },
            title: `${game.i18n.localize('WITCHER.Item.properties.variableDamage')}`,
            content: dialogTemplate,
            rejectClose: true
        });

        return newDamageFormula;
    }
};

import ChatMessageData from '../../chatMessage/chatMessageData.js';
import { addPart } from '../../scripts/helper.js';
import { RollConfig } from '../../scripts/rollConfig.js';
import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';

const DialogV2 = foundry.applications.api.DialogV2;

export let verbalCombatMixin = {
    async verbalCombat() {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');
        const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/verbal-combat.hbs',
            {
                verbalCombat: CONFIG.WITCHER.verbalCombat
            }
        );
        let { group, verbal, customModifier } = await DialogV2.prompt({
            window: { title: game.i18n.localize('WITCHER.verbalCombat.DialogTitle') },
            content: dialogTemplate,
            ok: {
                callback: (event, button, dialog) => {
                    let checkedBox = document.querySelector('input[name="verbalCombat"]:checked');
                    let group = checkedBox.dataset.group;
                    let verbal = checkedBox.value;

                    let customModifier = button.form.elements.customModifiers.value;

                    return {
                        group,
                        verbal,
                        customModifier
                    };
                }
            },
            rejectClose: true
        });

        let verbalCombat = CONFIG.WITCHER.verbalCombat[group][verbal];
        let vcName = verbalCombat.name;

        let vcStatName = verbalCombat.skill?.attribute.label ?? 'WITCHER.Context.unavailable';
        let vcStat = verbalCombat.skill ? this.system.stats[verbalCombat.skill.attribute.name]?.value : 0;

        let vcSkillName = verbalCombat.skill?.label ?? 'WITCHER.Context.unavailable';
        let vcSkill = verbalCombat.skill
            ? this.system.skills[verbalCombat.skill.attribute.name][verbalCombat.skill.name]?.value
            : 0;

        let vcDmg = verbalCombat.baseDmg
            ? `${verbalCombat.baseDmg}+${this.system.stats[verbalCombat.dmgStat.name].value}[${game.i18n.localize(verbalCombat.dmgStat?.label)}]`
            : game.i18n.localize('WITCHER.verbalCombat.None');
        if (verbal == 'Counterargue') {
            vcDmg = `${game.i18n.localize('WITCHER.verbalCombat.CounterargueDmg')}`;
        }

        let effect = verbalCombat.effect;

        let rollFormula = `1d10`;

        if (verbalCombat.skill) {
            rollFormula += (addPart(vcStat, vcStatName));
            rollFormula += (addPart(vcSkill, vcSkillName));

            rollFormula += (this.addActiveEffects(verbalCombat.skill.name));
        }

        rollFormula += (addPart(customModifier, 'WITCHER.Settings.Custom', 'hide'));

        let flavor = `
                            <div class="verbal-combat-attack-message">
                              <h2>${game.i18n.localize('WITCHER.verbalCombat.Title')}: ${game.i18n.localize(vcName)}</h2>
                              <b>${game.i18n.localize('WITCHER.Weapon.Damage')}</b>: ${vcDmg} <br />
                              ${game.i18n.localize(effect)}
                              <hr />
                              </div>`;
        flavor += vcDmg.includes('d')
            ? `<button class="vcDamage" > ${game.i18n.localize('WITCHER.table.Damage')}</button>`
            : '';

        let messageData = new ChatMessageData(this, flavor, 'damage', { vcDamage: vcDmg });

        let config = new RollConfig();
        config.showCrit = true;
        extendedRoll(rollFormula, messageData, config, this.createVerbalCombatFlags(verbalCombat, vcDmg));
    },

    createVerbalCombatFlags(verbalCombat, vcDamage) {
        return [
            {
                key: 'verbalCombat',
                value: verbalCombat
            },
            {
                key: 'damage',
                value: {
                    formula: vcDamage
                }
            }
        ];
    }
};

import ChatMessageData from '../../chatMessage/chatMessageData.js';
import { RollConfig } from '../../scripts/rollConfig.js';
import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';

export let verbalCombatMixin = {
    async verbalCombat() {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');
        const dialogTemplate = await renderTemplate('systems/TheWitcherTRPG/templates/dialog/verbal-combat.hbs', {
            verbalCombat: CONFIG.WITCHER.verbalCombat
        });
        new Dialog({
            title: game.i18n.localize('WITCHER.verbalCombat.DialogTitle'),
            content: dialogTemplate,
            buttons: {
                t1: {
                    label: `${game.i18n.localize('WITCHER.Dialog.ButtonRoll')}`,
                    callback: async html => {
                        let checkedBox = document.querySelector('input[name="verbalCombat"]:checked');
                        let group = checkedBox.dataset.group;
                        let verbal = checkedBox.value;

                        let verbalCombat = CONFIG.WITCHER.verbalCombat[group][verbal];
                        let vcName = verbalCombat.name;

                        let vcStatName = verbalCombat.skill?.attribute.label ?? 'WITCHER.Context.unavailable';
                        let vcStat = verbalCombat.skill
                            ? this.system.stats[verbalCombat.skill.attribute.name]?.current
                            : 0;

                        let vcSkillName = verbalCombat.skill?.label ?? 'WITCHER.Context.unavailable';
                        let vcSkill = verbalCombat.skill
                            ? this.system.skills[verbalCombat.skill.attribute.name][verbalCombat.skill.name]?.value
                            : 0;

                        let vcDmg = verbalCombat.baseDmg
                            ? `${verbalCombat.baseDmg}+${this.system.stats[verbalCombat.dmgStat.name].current}[${game.i18n.localize(verbalCombat.dmgStat?.label)}]`
                            : game.i18n.localize('WITCHER.verbalCombat.None');
                        if (verbal == 'Counterargue') {
                            vcDmg = `${game.i18n.localize('WITCHER.verbalCombat.CounterargueDmg')}`;
                        }

                        let effect = verbalCombat.effect;

                        let rollFormula = `1d10`;

                        if (verbalCombat.skill) {
                            rollFormula += !displayRollDetails
                                ? ` +${vcStat} +${vcSkill}`
                                : ` +${vcStat}[${game.i18n.localize(vcStatName)}] +${vcSkill}[${game.i18n.localize(vcSkillName)}]`;
                            rollFormula += this.addAllModifiers(verbalCombat.skill.name);
                        }

                        let customAtt = html.find('[name=customModifiers]')[0].value;
                        if (customAtt < 0) {
                            rollFormula += !displayRollDetails
                                ? `${customAtt}`
                                : `${customAtt}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                        }
                        if (customAtt > 0) {
                            rollFormula += !displayRollDetails
                                ? `+${customAtt}`
                                : `+${customAtt}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                        }

                        let messageData = new ChatMessageData(this);
                        messageData.flavor = `
            <div class="verbal-combat-attack-message">
              <h2>${game.i18n.localize('WITCHER.verbalCombat.Title')}: ${game.i18n.localize(vcName)}</h2>
              <b>${game.i18n.localize('WITCHER.Weapon.Damage')}</b>: ${vcDmg} <br />
              ${game.i18n.localize(effect)}
              <hr />
              </div>`;
                        messageData.flavor += vcDmg.includes('d')
                            ? `<button class="vcDamage" > ${game.i18n.localize('WITCHER.table.Damage')}</button>`
                            : '';

                        let config = new RollConfig();
                        config.showCrit = true;
                        await extendedRoll(
                            rollFormula,
                            messageData,
                            config,
                            this.createVerbalCombatFlags(verbalCombat, vcDmg)
                        );
                    }
                },
                t2: {
                    label: `${game.i18n.localize('WITCHER.Button.Cancel')}`
                }
            }
        }).render(true);
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

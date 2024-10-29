const DialogV2 = foundry.applications.api.DialogV2;

export class WitcherActiveEffectConfig extends ActiveEffectConfig {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['witcher', 'sheet', 'active-effect-sheet'],
            template: 'systems/TheWitcherTRPG/templates/sheets/activeEffect/active-effect-config.hbs'
        });
    }

    async _onEffectControl(event) {
        event.preventDefault();
        const button = event.currentTarget;

        if (button.dataset.action == 'wizard') {
            const dialogTemplate = await renderTemplate(
                'systems/TheWitcherTRPG/templates/dialog/activeEffects/wizard.hbs',
                { selects: this.getActiveEffectsPaths() }
            );

            DialogV2.prompt({
                content: dialogTemplate,
                modal: true,
                ok: {
                    callback: (event, button, dialog) => {
                        let paths = button.form.elements.path.value.split(',');
                        let newChanges = this.object.changes;
                        paths.forEach(path => {
                            newChanges.push({
                                key: path
                            });
                        });

                        this.object.update({
                            changes: newChanges
                        });
                    }
                }
            });
        } else {
            super._onEffectControl(event);
        }
    }

    getActiveEffectsPaths() {
        return {
            ...this.getStatSuggestions(),
            ...this.getSkillGroupSuggestions(),
            ...this.getSkillSuggestions(),
            ...this.getOtherSuggestions()
        };
    }

    getStatSuggestions() {
        return Object.keys(CONFIG.WITCHER.statMap)
            .map(key => {
                let stat = CONFIG.WITCHER.statMap[key];
                if (!stat.origin) return;
                return {
                    label: stat.label ?? stat.labelShort,
                    value: 'system.' + stat.origin + '.' + key + '.totalModifiers',
                    group: game.i18n.localize('WITCHER.Stats.' + stat.origin + '.Name')
                };
            })
            .reduce((stats, stat) => {
                if (!stat?.label) return stats;
                stats[stat.label] = stat;
                return stats;
            }, {});
    }

    getSkillGroupSuggestions() {
        return Object.keys(CONFIG.WITCHER.skillGroups)
            .map(key => {
                let skillGroup = CONFIG.WITCHER.skillGroups[key];
                let paths = [];

                if (!CONFIG.WITCHER[skillGroup.name]) return;

                CONFIG.WITCHER[skillGroup.name].forEach(skillName => {
                    let skill = CONFIG.WITCHER.skillMap[skillName];
                    paths.push('system.' + skill.attribute.name + '.' + skillName + '.activeEffectModifiers');
                });

                return {
                    label: skillGroup.label,
                    value: paths,
                    group: game.i18n.localize('WITCHER.Skills.SkillGroups.name')
                };
            })
            .reduce((skillGroups, skillGroup) => {
                if (!skillGroup?.label) return skillGroups;
                skillGroups[skillGroup.label] = skillGroup;
                return skillGroups;
            }, {});
    }

    getSkillSuggestions() {
        return Object.keys(CONFIG.WITCHER.skillMap)
            .map(key => {
                let skill = CONFIG.WITCHER.skillMap[key];
                return {
                    label: skill.label,
                    value: 'system.' + skill.attribute.name + '.' + key + '.activeEffectModifiers',
                    group: game.i18n.localize('WITCHER.Skills.Name')
                };
            })
            .reduce((skills, skill) => {
                skills[skill.label] = skill;
                return skills;
            }, {});
    }

    getOtherSuggestions() {
        return {
            meleeBonus: {
                group: game.i18n.localize('WITCHER.Effect.wizard.other'),
                label: 'WITCHER.Dialog.attackMeleeBonus',
                value: 'system.attackStats.meleeBonus'
            },
            critLocationModifier: {
                group: game.i18n.localize('WITCHER.Effect.wizard.other'),
                label: 'WITCHER.Actor.attackStats.critLocationModifier',
                value: 'system.attackStats.critLocationModifier'
            }
        };
    }
}

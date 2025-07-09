export let modifierMixin = {
    getAllModifiers(checkedStat) {
        let woundModifiers = this.getWoundModifier(this.system.critWounds, checkedStat);

        return {
            totalModifiers: woundModifiers.totalModifiers,
            totalDivider: woundModifiers.totalDivider
        };
    },

    getWoundModifier(wounds, checkedStat) {
        let totalModifiers = 0;
        let totalDivider = 1;

        wounds
            .filter(wound => wound.configEntry != '')
            .map(wound => CONFIG.WITCHER.Crit[wound.configEntry]?.effect[wound.mod])
            .forEach(wound => {
                wound.stats?.forEach(stat => {
                    if (stat.stat == checkedStat) {
                        if (stat.modifier?.toString().includes('/')) {
                            totalDivider = Number(stat.modifier.replace('/', ''));
                        } else {
                            totalModifiers += Number(stat.modifier ?? 0);
                        }
                    }
                });

                wound.derived?.forEach(derived => {
                    if (derived.derivedStat == checkedStat) {
                        if (derived.modifier?.toString().includes('/')) {
                            totalDivider = Number(derived.modifier.replace('/', ''));
                        } else {
                            totalModifiers += Number(derived.modifier ?? 0);
                        }
                    }
                });
            });

        return {
            totalModifiers,
            totalDivider
        };
    },

    addAllModifiers(skillName) {
        let modifierFormula = '';
        modifierFormula += this.addSkillModifiers(skillName);
        if (game.settings.get('TheWitcherTRPG', 'woundsAffectSkillBase')) {
            modifierFormula += ')';
        }
        modifierFormula += this.addWoundsModifier(skillName);
        return modifierFormula;
    },

    addSkillModifiers(skillName) {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');
        let skill = CONFIG.WITCHER.skillMap[skillName];

        let formula = '';

        if (!skill) return formula;

        this.system.skills[skill.attribute.name][skill.name].modifiers?.forEach(mod => {
            if (mod.value < 0) {
                formula += !displayRollDetails ? ` ${mod.value}` : ` ${mod.value}[${mod.name}]`;
            }
            if (mod.value > 0) {
                formula += !displayRollDetails ? ` +${mod.value}` : ` +${mod.value}[${mod.name}]`;
            }
        });

        if (this.system.skills[skill.attribute.name][skill.name].activeEffectModifiers != 0) {
            let effects = this.appliedEffects
                .filter(e =>
                    e.changes.some(
                        c => c.key === `system.skills.${skill.attribute.name}.${skill.name}.activeEffectModifiers`
                    )
                )
                .map(effect => effect.name)
                .join(' & ');
            formula += !displayRollDetails
                ? ` +${this.system.skills[skill.attribute.name][skill.name].activeEffectModifiers}`
                : ` +${this.system.skills[skill.attribute.name][skill.name].activeEffectModifiers}[${effects}]`;
        }

        if (this.system.skillGroupModifiers) {
            Object.values(this.system.skillGroupModifiers).forEach(modifier => {
                if (
                    modifier.group === 'allSkills' ||
                    CONFIG.WITCHER[modifier.group].some(groupSkill => groupSkill === skill.name)
                ) {
                    if (modifier.value < 0) {
                        formula += ` ${modifier.value}[${game.i18n.localize(modifier.name)}]`;
                    }
                    if (modifier.value > 0) {
                        formula += ` +${modifier.value}[${game.i18n.localize(modifier.name)}]`;
                    }
                } else {
                }
            });
        }

        return formula;
    },

    addWoundsModifier(skillName) {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');
        let wounds = this.system.critWounds;

        let formula = '';
        wounds
            .filter(wound => wound.configEntry != '')
            .map(wound => CONFIG.WITCHER.Crit[wound.configEntry].effect[wound.mod])
            .forEach(wound => {
                wound.skills?.forEach(skill => {
                    if (
                        skill.skill == skillName ||
                        CONFIG.WITCHER[skill.skillgroup]?.includes(skillName) ||
                        skill.skill == 'all'
                    ) {
                        if (skill.modifier?.toString().includes('/')) {
                            formula += !displayRollDetails
                                ? ` /${Number(skill.modifier.replace('/', ''))}`
                                : ` /${Number(skill.modifier.replace('/', ''))}[${game.i18n.localize('WITCHER.CritWound.Header')}]`;
                        } else {
                            formula += !displayRollDetails
                                ? ` ${Number(skill.modifier)}`
                                : ` ${Number(skill.modifier)}[${game.i18n.localize('WITCHER.CritWound.Header')}]`;
                        }
                    }
                });
            });
        return formula;
    },

    addAttackModifiers() {
        let modifiers = '';
        Object.values(this.system.combatEffects.attackModifier).forEach(mod => {
            modifiers += mod.value !== 0 ? ` ${mod.value}[${game.i18n.localize(mod.name)}]` : '';
        });
        return modifiers;
    },

    addDefenseModifiers() {
        let modifiers = '';
        Object.values(this.system.combatEffects.defenseModifier).forEach(mod => {
            modifiers += mod.value !== 0 ? ` ${mod.value}[${game.i18n.localize(mod.name)}]` : '';
        });
        return modifiers;
    }
};

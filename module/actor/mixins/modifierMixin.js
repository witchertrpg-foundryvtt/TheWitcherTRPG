export let modifierMixin = {

    getAllModifiers(checkedStat) {
        let globalModifiers = this.getGlobalModifier(this.getList("globalModifier").filter(e => e.system.isActive), checkedStat)
        let woundModifiers = this.getWoundModifier(this.system.critWounds, checkedStat)

        return {
            totalModifiers: globalModifiers.totalModifiers + woundModifiers.totalModifiers,
            totalDivider: globalModifiers.totalDivider * woundModifiers.totalDivider,
        }
    },

    getGlobalModifier(globalModifier, checkedStat) {
        let totalModifiers = 0;
        let totalDivider = 1;
        globalModifier?.forEach(item => {
            item.system.stats?.forEach(stat => {
                if (stat.stat == checkedStat) {
                    if (stat.modifier?.toString().includes("/")) {
                        totalDivider = Number(stat.modifier.replace("/", ''));
                    }
                    else {
                        totalModifiers += Number(stat.modifier ?? 0)
                    }
                }
            })

            item.system.derived?.forEach(derived => {
                if (derived.derivedStat == checkedStat) {
                    if (derived.modifier?.toString().includes("/")) {
                        totalDivider = Number(derived.modifier.replace("/", ''));
                    }
                    else {
                        totalModifiers += Number(derived.modifier ?? 0)
                    }
                }
            })
        });

        return {
            totalModifiers,
            totalDivider
        }
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
                        if (stat.modifier?.toString().includes("/")) {
                            totalDivider = Number(stat.modifier.replace("/", ''));
                        }
                        else {
                            totalModifiers += Number(stat.modifier ?? 0)
                        }
                    }
                })

                wound.derived?.forEach(derived => {
                    if (derived.derivedStat == checkedStat) {
                        if (derived.modifier?.toString().includes("/")) {
                            totalDivider = Number(derived.modifier.replace("/", ''));
                        }
                        else {
                            totalModifiers += Number(derived.modifier ?? 0)
                        }
                    }
                })
            });

        return {
            totalModifiers,
            totalDivider
        }
    },

    addAllModifiers(skillName) {
        let modifierFormula = ''
        modifierFormula += this.addSkillModifiers(skillName);
        modifierFormula += this.addGlobalModifier(skillName);
        modifierFormula += this.addWoundsModifier(skillName);
        return modifierFormula;
    },

    addSkillModifiers(skillName) {
        let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
        let skill = CONFIG.WITCHER.skillMap[skillName];

        let formula = ''
        this.system.skills[skill.attribute.name][skill.name].modifiers?.forEach(mod => {
            if (mod.value < 0) {
                formula += !displayRollDetails ? ` ${mod.value}` : ` ${mod.value}[${mod.name}]`
            }
            if (mod.value > 0) {
                formula += !displayRollDetails ? ` +${mod.value}` : ` +${mod.value}[${mod.name}]`
            }
        });
        return formula;
    },

    addGlobalModifier(skillName) {
        let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
        let globalModifier = this.getList("effect").concat(this.getList("globalModifier")).filter(e => e.system.isActive);

        let formula = ''
        globalModifier.forEach(modifier => {
            modifier.system.skills?.forEach(modifierSkill => {
                if (skillName == modifierSkill.skill || modifierSkill.skill == "allSkills" || CONFIG.WITCHER[modifierSkill.skill]?.includes(skillName)) {
                    if (modifierSkill.modifier.includes("/")) {
                        formula += !displayRollDetails ? ` /${Number(modifierSkill.modifier.replace("/", ''))}` : ` /${Number(modifierSkill.modifier.replace("/", ''))}[${modifier.name}]`
                    }
                    else {
                        formula += !displayRollDetails ? ` +${modifierSkill.modifier}` : ` +${modifierSkill.modifier}[${modifier.name}]`
                    }
                }
            })
        });

        return formula;
    },

    addWoundsModifier(skillName) {
        let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
        let wounds = this.system.critWounds

        let formula = ''
        wounds
            .filter(wound => wound.configEntry != '')
            .map(wound => CONFIG.WITCHER.Crit[wound.configEntry].effect[wound.mod])
            .forEach(wound => {
                wound.skills?.forEach(skill => {
                    if (skill.skill == skillName || CONFIG.WITCHER[skill.skillgroup]?.includes(skillName) || skill.skill == "all") {
                        if (skill.modifier?.toString().includes("/")) {
                            formula += !displayRollDetails ? ` /${Number(skill.modifier.replace("/", ''))}` : ` /${Number(skill.modifier.replace("/", ''))}[${game.i18n.localize("WITCHER.CritWound.Header")}]`
                        }
                        else {
                            formula += !displayRollDetails ? ` ${Number(skill.modifier)}` : ` ${Number(skill.modifier)}[${game.i18n.localize("WITCHER.CritWound.Header")}]`
                        }
                    }
                })
            });
        return formula
    },

    async _activateGlobalModifier(name) {
        let toActivate = this.items.find(item => item.type == "globalModifier" && item.name == name)

        if (!toActivate) {
            let compendium = game.packs.get(game.settings.get("TheWitcherTRPG", "globalModifierLookupCompendium"))
            let newGlobalModifier = await compendium?.getDocuments({ name: name })
            if (newGlobalModifier) {
                toActivate = (await Item.create(newGlobalModifier, { parent: this })).shift();
            }
        }

        if (!toActivate || toActivate.system.isActive) return;

        toActivate.update({
            'system.isActive': true
        });
    }
}
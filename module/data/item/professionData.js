import CommonItemData from './commonItemData.js';
import professionPath from './templates/professionPathData.js';
import professionSkill from './templates/professionSkillData.js';

const fields = foundry.data.fields;

export default class ProfessionData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();
        return {
            // Using destructuring to effectively append our additional data here
            ...commonData,
            notes: new fields.StringField({ initial: '' }),
            definingSkill: new fields.SchemaField(professionSkill()),
            skillPath1: new fields.SchemaField(professionPath()),
            skillPath2: new fields.SchemaField(professionPath()),
            skillPath3: new fields.SchemaField(professionPath())
        };
    }

    isApplicableDefense(attack) {
        return (
            this.isApplicableDefenseInPath(attack, 'skillPath1') ||
            this.isApplicableDefenseInPath(attack, 'skillPath2') ||
            this.isApplicableDefenseInPath(attack, 'skillPath3')
        );
    }

    isApplicableDefenseInPath(attack, path) {
        return (
            this[path].skill1.skillDefense.defenseProperties.isApplicableDefense(attack) ||
            this[path].skill2.skillDefense.defenseProperties.isApplicableDefense(attack) ||
            this[path].skill3.skillDefense.defenseProperties.isApplicableDefense(attack)
        );
    }

    findDefensePathData(attack, path) {
        if (this[path].skill1.skillDefense.defenseProperties.isApplicableDefense(attack)) {
            return this.findDefenseSkillData(path, 'skill1', attack);
        }

        if (this[path].skill2.skillDefense.defenseProperties.isApplicableDefense(attack)) {
            return this.findDefenseSkillData(path, 'skill2', attack);
        }

        if (this[path].skill3.skillDefense.defenseProperties.isApplicableDefense(attack)) {
            return this.findDefenseSkillData(path, 'skill3', attack);
        }
    }

    findDefenseSkillData(path, skill, attack) {
        return {
            label: this[path][skill].skillName,
            value: this[path][skill].skillName,
            ...this[path][skill].skillDefense.defenseProperties.createDefenseOption(attack),

            skillOverride: {
                skillMapEntry: {
                    label: this[path][skill].skillName,
                    attribute: {
                        name: this[path][skill].stat,
                        labelShort:
                            'WITCHER.Actor.Stat.' +
                            String(this[path][skill].stat).charAt(0).toUpperCase() +
                            String(this[path][skill].stat).slice(1)
                    }
                },
                skill: {
                    label: this[path][skill].skillName,
                    value: this[path][skill].level
                }
            }
        };
    }

    createDefenseOption(attack) {
        if (this.isApplicableDefenseInPath(attack, 'skillPath1')) {
            return this.findDefensePathData(attack, 'skillPath1');
        }
        if (this.isApplicableDefenseInPath(attack, 'skillPath2')) {
            return this.findDefensePathData(attack, 'skillPath2');
        }
        if (this.isApplicableDefenseInPath(attack, 'skillPath3')) {
            return this.findDefensePathData(attack, 'skillPath3');
        }
    }
}

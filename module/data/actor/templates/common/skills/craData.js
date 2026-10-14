import Skill from './skillData.js';

const fields = foundry.data.fields;

export default class Craft extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            alchemy: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.alchemy.label' }),
            crafting: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.crafting.label' }),
            disguise: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.disguise.label' }),
            firstaid: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.firstaid.label' }),
            forgery: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.forgery.label' }),
            picklock: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.picklock.label' }),
            trapcraft: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.trapcraft.label' })
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        Object.keys(this.defineSchema()).forEach(skillName => {
            if (source[skillName]) {
                source[skillName].label = `WITCHER.skills.${skillName}.label`;
            }
        });

        return super.migrateData(source);
    }
}

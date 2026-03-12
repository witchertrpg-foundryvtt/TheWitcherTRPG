import Skill from './skillData.js';

const fields = foundry.data.fields;

export default class Craft extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            alchemy: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.alchemy.label' }),
            crafting: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.crafting.label' }),
            disguise: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.disguise.label' }),
            firstaid: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.firstAid.label' }),
            forgery: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.forgery.label' }),
            picklock: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.pickLock.label' }),
            trapcraft: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.trapCrafting.label' })
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        source.alchemy.label = 'WITCHER.skills.alchemy.label';
        source.crafting.label = 'WITCHER.skills.crafting.label';
        source.disguise.label = 'WITCHER.skills.disguise.label';
        source.firstaid.label = 'WITCHER.skills.firstAid.label';
        source.forgery.label = 'WITCHER.skills.forgery.label';
        source.picklock.label = 'WITCHER.skills.pickLock.label';
        source.trapcraft.label = 'WITCHER.skills.trapCrafting.label';

        return super.migrateData(source);
    }
}

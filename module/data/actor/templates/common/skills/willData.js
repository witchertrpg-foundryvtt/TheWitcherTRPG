import Skill from './skillData.js';

const fields = foundry.data.fields;

export default class Will extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            courage: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.courage.label' }),
            hexweave: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.hexWeaving.label' }),
            intimidation: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.intimidation.label' }),
            spellcast: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.spellCasting.label' }),
            resistmagic: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.resistMagic.label' }),
            resistcoerc: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.resistCoercion.label' }),
            ritcraft: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.ritualCrafting.label' })
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        source.courage.label = 'WITCHER.skills.courage.label';
        source.hexweave.label = 'WITCHER.skills.hexWeaving.label';
        source.intimidation.label = 'WITCHER.skills.intimidation.label';
        source.spellcast.label = 'WITCHER.skills.spellCasting.label';
        source.resistmagic.label = 'WITCHER.skills.resistMagic.label';
        source.resistcoerc.label = 'WITCHER.skills.resistCoercion.label';
        source.ritcraft.label = 'WITCHER.skills.ritualCrafting.label';

        return super.migrateData(source);
    }
}

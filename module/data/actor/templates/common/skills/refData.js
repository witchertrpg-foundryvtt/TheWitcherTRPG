import Skill from './skillData.js';

const fields = foundry.data.fields;

export default class Reflex extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            brawling: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.brawling.label' }),
            dodge: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.dodgeEscape.label' }),
            melee: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.melee.label' }),
            riding: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.riding.label' }),
            sailing: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.sailing.label' }),
            smallblades: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.smallblades.label' }),
            staffspear: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.staffspear.label' }),
            swordsmanship: new fields.EmbeddedDataField(Skill, { label: 'WITCHER.skills.swordsmanship.label' })
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        source.brawling.label = 'WITCHER.skills.brawling.label';
        source.dodge.label = 'WITCHER.skills.dodgeEscape.label';
        source.melee.label = 'WITCHER.skills.melee.label';
        source.riding.label = 'WITCHER.skills.riding.label';
        source.sailing.label = 'WITCHER.skills.sailing.label';
        source.smallblades.label = 'WITCHER.skills.smallblades.label';
        source.staffspear.label = 'WITCHER.skills.staffspear.label';
        source.swordsmanship.label = 'WITCHER.skills.swordsmanship.label';

        return super.migrateData(source);
    }
}

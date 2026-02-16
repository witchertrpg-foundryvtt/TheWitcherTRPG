import skill from './skillData.js';

const fields = foundry.data.fields;

export default class Intelligence extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            awareness: new fields.SchemaField(skill('WITCHER.skills.awareness.label')),
            business: new fields.SchemaField(skill('WITCHER.skills.business.label')),
            deduction: new fields.SchemaField(skill('WITCHER.skills.deduction.label')),
            education: new fields.SchemaField(skill('WITCHER.skills.education.label')),
            commonsp: new fields.SchemaField(skill('WITCHER.skills.commonSpeech.label')),
            eldersp: new fields.SchemaField(skill('WITCHER.skills.elderSpeech.label')),
            dwarven: new fields.SchemaField(skill('WITCHER.skills.dwarvenSpeech.label')),
            monster: new fields.SchemaField(skill('WITCHER.skills.monsterLore.label')),
            socialetq: new fields.SchemaField(skill('WITCHER.skills.socialEtiquette.label')),
            streetwise: new fields.SchemaField(skill('WITCHER.skills.streetwise.label')),
            tactics: new fields.SchemaField(skill('WITCHER.skills.tactics.label')),
            teaching: new fields.SchemaField(skill('WITCHER.skills.teaching.label')),
            wilderness: new fields.SchemaField(skill('WITCHER.skills.wildernessSurvival.label'))
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        source.awareness.label = 'WITCHER.skills.awareness.label';
        source.business.label = 'WITCHER.skills.business.label';
        source.deduction.label = 'WITCHER.skills.deduction.label';
        source.education.label = 'WITCHER.skills.education.label';
        source.commonsp.label = 'WITCHER.skills.commonSpeech.label';
        source.eldersp.label = 'WITCHER.skills.elderSpeech.label';
        source.dwarven.label = 'WITCHER.skills.dwarvenSpeech.label';
        source.monster.label = 'WITCHER.skills.monsterLore.label';
        source.socialetq.label = 'WITCHER.skills.socialEtiquette.label';
        source.streetwise.label = 'WITCHER.skills.streetwise.label';
        source.tactics.label = 'WITCHER.skills.tactics.label';
        source.teaching.label = 'WITCHER.skills.teaching.label';
        source.wilderness.label = 'WITCHER.skills.wildernessSurvival.label';

        return super.migrateData(source);
    }
}

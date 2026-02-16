import skill from './skillData.js';

const fields = foundry.data.fields;

export default class Empathy extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            charisma: new fields.SchemaField(skill('WITCHER.skills.charisma.label')),
            deceit: new fields.SchemaField(skill('WITCHER.skills.deceit.label')),
            finearts: new fields.SchemaField(skill('WITCHER.skills.fineArts.label')),
            gambling: new fields.SchemaField(skill('WITCHER.skills.gambling.label')),
            grooming: new fields.SchemaField(skill('WITCHER.skills.groomingAndStyle.label')),
            perception: new fields.SchemaField(skill('WITCHER.skills.humanPerception.label')),
            leadership: new fields.SchemaField(skill('WITCHER.skills.leadership.label')),
            persuasion: new fields.SchemaField(skill('WITCHER.skills.persuasion.label')),
            performance: new fields.SchemaField(skill('WITCHER.skills.performance.label')),
            seduction: new fields.SchemaField(skill('WITCHER.skills.seduction.label'))
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        source.charisma.label = 'WITCHER.skills.charisma.label';
        source.deceit.label = 'WITCHER.skills.deceit.label';
        source.finearts.label = 'WITCHER.skills.fineArts.label';
        source.gambling.label = 'WITCHER.skills.gambling.label';
        source.grooming.label = 'WITCHER.skills.groomingAndStyle.label';
        source.perception.label = 'WITCHER.skills.humanPerception.label';
        source.leadership.label = 'WITCHER.skills.leadership.label';
        source.persuasion.label = 'WITCHER.skills.persuasion.label';
        source.performance.label = 'WITCHER.skills.performance.label';
        source.seduction.label = 'WITCHER.skills.seduction.label';

        return super.migrateData(source);
    }
}

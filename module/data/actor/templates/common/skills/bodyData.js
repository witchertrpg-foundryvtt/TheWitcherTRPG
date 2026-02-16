import skill from './skillData.js';

const fields = foundry.data.fields;

export default class Body extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            physique: new fields.SchemaField(skill('WITCHER.skills.physique.label')),
            endurance: new fields.SchemaField(skill('WITCHER.skills.endurance.label'))
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        source.physique.label = "WITCHER.skills.physique.label";
        source.endurance.label = 'WITCHER.skills.endurance.label';

        return super.migrateData(source);
    }
}

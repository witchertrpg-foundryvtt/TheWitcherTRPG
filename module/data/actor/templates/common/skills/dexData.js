import skill from './skillData.js';

const fields = foundry.data.fields;

export default class Dexterity extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            archery: new fields.SchemaField(skill('WITCHER.skills.archery.label')),
            athletics: new fields.SchemaField(skill('WITCHER.skills.athletics.label')),
            crossbow: new fields.SchemaField(skill('WITCHER.skills.crossbow.label')),
            sleight: new fields.SchemaField(skill('WITCHER.skills.sleightOfHand.label')),
            stealth: new fields.SchemaField(skill('WITCHER.skills.stealth.label'))
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        source.archery.label = 'WITCHER.skills.archery.label';
        source.athletics.label = 'WITCHER.skills.athletics.label';
        source.crossbow.label = 'WITCHER.skills.crossbow.label';
        source.sleight.label = 'WITCHER.skills.sleightOfHand.label';
        source.stealth.label = 'WITCHER.skills.stealth.label';

        return super.migrateData(source);
    }
}

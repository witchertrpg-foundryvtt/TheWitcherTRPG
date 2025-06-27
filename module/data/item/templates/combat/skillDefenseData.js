import DefenseProperties from './defensePropertiesData.js';

const fields = foundry.data.fields;

export default function skillDefense() {
    return {
        isDefense: new fields.BooleanField({
            initial: false,
            label: 'WITCHER.profession.skillPath.skill.skillDefense.isDefense'
        }),
        defenseProperties: new fields.EmbeddedDataField(DefenseProperties)
    };
}

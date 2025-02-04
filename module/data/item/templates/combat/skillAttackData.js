import attackOptions from './attackOptionsData.js';
import damageProperties from './damagePropertiesData.js';
import defenseOptions from './defenseOptionsData.js';

const fields = foundry.data.fields;

export default function skillAttack() {
    return {
        isAttack: new fields.BooleanField({
            initial: false,
            label: 'WITCHER.profession.skillPath.skill.skillAttack.isAttack'
        }),
        usesWeapon: new fields.BooleanField({
            initial: false,
            label: 'WITCHER.profession.skillPath.skill.skillAttack.usesWeapon'
        }),
        damageFormulaOverride: new fields.StringField({
            initial: '',
            label: 'WITCHER.profession.skillPath.skill.skillAttack.damageFormulaOverrides'
        }),
        ...attackOptions(),
        damageProperties: new fields.SchemaField(damageProperties()),
        ...defenseOptions()
    };
}

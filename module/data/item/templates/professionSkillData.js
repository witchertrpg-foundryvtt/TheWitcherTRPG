import skillAttack from './combat/skillAttackData.js';

const fields = foundry.data.fields;

export default function professionSkill() {
    return {
        skillName: new fields.StringField({ initial: '' }),
        stat: new fields.StringField({ initial: '' }),
        definition: new fields.StringField({ initial: '' }),
        level: new fields.NumberField({ initial: 0 }),
        skillAttack: new fields.SchemaField(skillAttack())
    };
}

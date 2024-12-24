import damageModification from './damageModificationData.js';

const fields = foundry.data.fields;

export default function damageTypeModification() {
    return {
        slashing: new fields.SchemaField(damageModification()),
        piercing: new fields.SchemaField(damageModification()),
        bludgeoning: new fields.SchemaField(damageModification()),
        elemental: new fields.SchemaField(damageModification()),
        electricity: new fields.SchemaField(damageModification()),
        fire: new fields.SchemaField(damageModification()),
        ice: new fields.SchemaField(damageModification())
    };
}

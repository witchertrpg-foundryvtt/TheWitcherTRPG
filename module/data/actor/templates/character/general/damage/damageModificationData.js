const fields = foundry.data.fields;

export default function damageModification() {
    return {
        flat: new fields.NumberField({ initial: 0 }),
        multiplication: new fields.NumberField({ initial: 1 }),
        applyAP: new fields.BooleanField({ initial: false })
    };
}

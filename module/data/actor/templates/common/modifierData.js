const fields = foundry.data.fields;

export default function modifier() {
    return {
        id: new fields.StringField({ initial: () => foundry.utils.randomID() }),
        value: new fields.NumberField({ initial: 0 }),
        name: new fields.StringField({ initial: '' })
    };
}

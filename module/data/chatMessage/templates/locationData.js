const fields = foundry.data.fields;

export default function locationData() {
    return {
        name: new fields.StringField({ initial: '' }),
        alias: new fields.StringField({ initial: '' }),
        formula: new fields.NumberField({ initial: 1 }),
        modifier: new fields.StringField({ initial: '' })
    };
}

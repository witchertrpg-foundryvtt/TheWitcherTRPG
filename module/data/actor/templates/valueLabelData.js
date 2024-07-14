const fields = foundry.data.fields;

export default function valueLabel(label) {
    return {
        value: new fields.StringField({ initial: '' }),
        label: new fields.StringField({ initial: label })
    };
}
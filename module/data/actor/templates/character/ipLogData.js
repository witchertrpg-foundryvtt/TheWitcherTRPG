const fields = foundry.data.fields;

export default function ipLog() {
    return {
        label: new fields.StringField({ initial: '' }),
        ip: new fields.NumberField({ initial: 0 })
    };
}

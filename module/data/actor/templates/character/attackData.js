
const fields = foundry.data.fields;

export default function attack(label) {
    return {
        label: new fields.StringField({ initial: label}),
        value: new fields.StringField({ initial: ''}),
    }
  }
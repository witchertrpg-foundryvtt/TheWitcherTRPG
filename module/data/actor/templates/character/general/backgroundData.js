
const fields = foundry.data.fields;

export default function background() {
    return {
        value:  new fields.StringField({ initial: ''}),
    }
  }
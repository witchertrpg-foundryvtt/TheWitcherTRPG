
const fields = foundry.data.fields;

export default function note() {
    return {
        title:  new fields.StringField({ initial: ""}),
        details:  new fields.StringField({ initial: ""}),
    }
  }
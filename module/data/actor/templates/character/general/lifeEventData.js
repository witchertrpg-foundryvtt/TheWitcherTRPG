
const fields = foundry.data.fields;

export default function lifeEvent(decade) {
    return {
        decade:  new fields.NumberField({ initial: decade}),
        value:  new fields.StringField({ initial: ''}),
        details:  new fields.StringField({ initial: ''}),
        isOpened:  new fields.BooleanField({ initial: false}),
    }
  }
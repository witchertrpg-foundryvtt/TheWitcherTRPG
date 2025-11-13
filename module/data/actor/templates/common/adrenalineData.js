const fields = foundry.data.fields;

export default function adrenaline() {
    return {
        value: new fields.NumberField({ initial: 0}),
        label: new fields.StringField({ initial: "WITCHER.Actor.Adrenaline"})
    };
  }
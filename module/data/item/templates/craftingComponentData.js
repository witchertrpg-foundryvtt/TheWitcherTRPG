const fields = foundry.data.fields;

export default function craftingComponent() {
    return {
        id: new fields.StringField({ initial: ""}),
        name: new fields.StringField({ initial: ""}),
        quantity: new fields.NumberField({ initial: 0}),
    };
  }
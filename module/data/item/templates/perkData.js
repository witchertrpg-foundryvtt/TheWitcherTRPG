const fields = foundry.data.fields;

export default function perk() {
    return {
        name: new fields.StringField({ initial: ""}),
        description: new fields.StringField({ initial: ""}),
    };
  }
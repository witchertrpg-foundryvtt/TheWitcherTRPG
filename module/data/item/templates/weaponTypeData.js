const fields = foundry.data.fields;

export default function weaponType() {
    return {
        text: new fields.StringField({ initial: ""}),
        slashing: new fields.BooleanField({initial: false}),
        piercing: new fields.BooleanField({initial: false}),
        bludgeoning: new fields.BooleanField({initial: false}),
        elemental: new fields.BooleanField({initial: false}),
    };
  }
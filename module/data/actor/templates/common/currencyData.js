const fields = foundry.data.fields;

export default function currency() {
    return {
        bizant: new fields.NumberField({ initial: 0}),
        ducat: new fields.NumberField({ initial: 0}),
        lintar: new fields.NumberField({ initial: 0}),
        floren: new fields.NumberField({ initial: 0}),
        crown: new fields.NumberField({ initial: 0}),
        oren: new fields.NumberField({ initial: 0}),
        falsecoin: new fields.NumberField({ initial: 0}),
    };
  }
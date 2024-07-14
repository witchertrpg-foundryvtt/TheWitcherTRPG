const fields = foundry.data.fields;

export default function socialStanding() {
    return {
        north: new fields.StringField({ initial: ""}),
        nilfgaard: new fields.StringField({ initial: ""}),
        skellige: new fields.StringField({ initial: ""}),
        dolBlathanna: new fields.StringField({ initial: ""}),
        mahakam: new fields.StringField({ initial: ""}),
    };
  }
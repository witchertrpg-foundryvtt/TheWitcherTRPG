const fields = foundry.data.fields;

export default function effectDerivedStat() {
    return {
        id: new fields.StringField({ initial: ""}),
        modifier: new fields.StringField({ initial: "0"}),
        derivedStat: new fields.StringField({ initial: ""}),
    };
  }
const fields = foundry.data.fields;

export default function modifierStat() {
    return {
        id: new fields.StringField({ initial: "" }),
        modifier: new fields.StringField({ initial: "0" }),
        stat: new fields.StringField({ initial: "" }),
    };
}
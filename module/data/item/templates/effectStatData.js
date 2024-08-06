const fields = foundry.data.fields;

export default function modifierStat() {
    return {
        id: new fields.StringField({ initial: () => foundry.utils.randomID() }),
        modifier: new fields.StringField({ initial: "0" }),
        stat: new fields.StringField({ initial: "" }),
    };
}
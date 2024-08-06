const fields = foundry.data.fields;

export default function effectSkill() {
    return {
        id: new fields.StringField({ initial: () => foundry.utils.randomID() }),
        modifier: new fields.StringField({ initial: "" }),
        skill: new fields.StringField({ initial: "" })
    };
}
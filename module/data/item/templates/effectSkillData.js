const fields = foundry.data.fields;

export default function effectSkill() {
    return {
        id: new fields.StringField({ initial: "" }),
        modifier: new fields.StringField({ initial: "" }),
        skill: new fields.StringField({ initial: "" })
    };
}
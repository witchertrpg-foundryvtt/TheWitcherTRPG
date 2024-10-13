const fields = foundry.data.fields;

export default function specialSkillModifier() {
    return {
        id: new fields.StringField({ initial: () => foundry.utils.randomID() }),
        modifier: new fields.StringField({ initial: '' })
    };
}

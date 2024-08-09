const fields = foundry.data.fields;

export default function itemEffect() {
    return {
        id: new fields.StringField({ initial: () => foundry.utils.randomID() }),
        name: new fields.StringField({ initial: "" }),
        statusEffect: new fields.StringField({ initial: null, nullable: true }),
        percentage: new fields.NumberField({ initial: 0, min: 0, max: 100 }),
        varEffect: new fields.BooleanField({ initial: false }),
    };
}
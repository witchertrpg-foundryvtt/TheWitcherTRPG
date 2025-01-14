const fields = foundry.data.fields;

export default function critWound() {
    return {
        id: new fields.StringField({ initial: () => foundry.utils.randomID() }),

        configEntry: new fields.StringField({ initial: '' }),

        effect: new fields.StringField({ initial: '' }),
        description: new fields.StringField({ initial: '' }),
        mod: new fields.StringField({ initial: 'none' }),
        location: new fields.StringField({ initial: '' }),

        notes: new fields.StringField({ initial: '' }),

        daysHealed: new fields.NumberField({ initial: 0 }),
        healingTime: new fields.NumberField({ initial: 0 }),
        sterilized: new fields.BooleanField({ initial: false })
    };
}

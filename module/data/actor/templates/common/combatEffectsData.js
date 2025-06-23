const fields = foundry.data.fields;

export default function combatEffects() {
    return {
        attackModifier: new fields.TypedObjectField(
            new fields.SchemaField({
                name: new fields.StringField(),
                value: new fields.NumberField({ initial: 0 })
            })
        ),
        defenseModifier: new fields.TypedObjectField(
            new fields.SchemaField({
                name: new fields.StringField(),
                value: new fields.NumberField({ initial: 0 })
            })
        ),
        turnStartEffects: new fields.TypedObjectField(
            new fields.SchemaField({
                name: new fields.StringField(),
                img: new fields.StringField(),
                damage: new fields.SchemaField({
                    amount: new fields.NumberField({ initial: 0 }),
                    modifier: new fields.NumberField({ initial: 0 }),
                    allLocations: new fields.BooleanField({ initial: false }),
                    type: new fields.StringField(),
                    ignoreArmor: new fields.BooleanField({ initial: false }),
                    nonLethal: new fields.BooleanField({ initial: false }),
                    spDamage: new fields.NumberField({ initial: 0 })
                }),
                heal: new fields.SchemaField({
                    amount: new fields.NumberField({ initial: 0 }),
                    modifier: new fields.NumberField({ initial: 0 })
                })
            })
        )
    };
}

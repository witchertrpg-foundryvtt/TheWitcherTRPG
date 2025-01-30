const fields = foundry.data.fields;

export default function critData() {
    return {
        critLocationModifier: new fields.NumberField(),
        critEffectModifier: new fields.NumberField()
    };
}

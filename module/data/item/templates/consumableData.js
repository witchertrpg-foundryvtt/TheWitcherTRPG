import consumeProperties from "./consumePropertiesData.js";

const fields = foundry.data.fields;

export default function consumable() {
    return {
        isConsumable: new fields.BooleanField({ initial: false }),
        consumeProperties: new fields.SchemaField(consumeProperties()),
    };
}
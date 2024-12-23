const fields = foundry.data.fields;

export default function component() {
    return {
        uuid: new fields.DocumentUUIDField(),
        quantity: new fields.NumberField({ initial: 0 })
    };
}

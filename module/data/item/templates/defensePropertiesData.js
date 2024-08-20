const fields = foundry.data.fields;

export default function defenseProperties() {
    return {
        parrying: new fields.BooleanField({ initial: false }),
    };
}
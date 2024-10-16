const fields = foundry.data.fields;

export default function regionProperties() {
    return {
        createRegionFromTemplate: new fields.BooleanField({ initial: false })
    };
}

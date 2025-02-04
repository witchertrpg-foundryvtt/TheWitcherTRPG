import regionBehaviours from './regionBehavioursData.js';

const fields = foundry.data.fields;

export default function regionProperties() {
    return {
        createRegionFromTemplate: new fields.BooleanField({
            initial: false,
            label: 'WITCHER.Item.RegionProperties.createRegionFromTemplate'
        }),
        behaviours: new fields.SchemaField(regionBehaviours())
    };
}

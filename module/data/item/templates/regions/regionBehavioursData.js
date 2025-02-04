const fields = foundry.data.fields;

export default function regionBehaviours() {
    return {
        tokenEnter: new fields.DocumentUUIDField({
            type: 'Macro',
            required: false,
            label: 'WITCHER.Item.RegionProperties.tokenEnter'
        }),
        tokenTurnStart: new fields.DocumentUUIDField({
            type: 'Macro',
            required: false,
            label: 'WITCHER.Item.RegionProperties.tokenTurnStart'
        }),
        tokenPreMove: new fields.DocumentUUIDField({
            type: 'Macro',
            required: false,
            label: 'WITCHER.Item.RegionProperties.tokenPreMove'
        }),
        tokenExit: new fields.DocumentUUIDField({
            type: 'Macro',
            required: false,
            label: 'WITCHER.Item.RegionProperties.tokenExit'
        })
    };
}

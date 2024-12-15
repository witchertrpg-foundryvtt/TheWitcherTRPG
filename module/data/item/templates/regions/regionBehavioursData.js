const fields = foundry.data.fields;

export default function regionBehaviours() {
    return {
        tokenEnter: new fields.DocumentUUIDField({ blank: true}),
        tokenTurnStart: new fields.DocumentUUIDField({ blank: true }),
        tokenPreMove: new fields.DocumentUUIDField({ blank: true }),
        tokenExit: new fields.DocumentUUIDField({ blank: true })
    };
}

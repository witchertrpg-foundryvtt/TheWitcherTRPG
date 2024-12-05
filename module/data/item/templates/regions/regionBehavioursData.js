const fields = foundry.data.fields;

export default function regionBehaviours() {
    return {
        tokenEnter: new fields.StringField({ initial: '' }),
        tokenTurnStart: new fields.StringField({ initial: '' }),
        tokenExit: new fields.StringField({ initial: '' })
    };
}

const fields = foundry.data.fields;

export default function attackData() {
    return {
        attackOption: new fields.StringField(),
        skill: new fields.StringField(),
        alias: new fields.StringField(),
        itemUuid: new fields.DocumentUUIDField()
    };
}

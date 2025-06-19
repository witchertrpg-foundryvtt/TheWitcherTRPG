const fields = foundry.data.fields;

export default function defenseOptions() {
    return {
        defenseOptions: new fields.SetField(new fields.StringField({ required: true, blank: false }), {
            initial: () => CONFIG.WITCHER.defenseOptions.map(obj => obj.value),
            label: 'WITCHER.Item.Settings.attacks.defendWith.label',
            hint: 'WITCHER.Item.Settings.attacks.defendWith.hint'
        })
    };
}

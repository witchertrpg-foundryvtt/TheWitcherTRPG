export const registerSettings = function () {
    game.settings.register('TheWitcherTRPG', 'criticalWoundsPack', {
        name: 'WITCHER.Settings.criticalWoundsPack',
        hint: 'WITCHER.Settings.criticalWoundsPackDetails',
        scope: 'world',
        config: true,
        type: new foundry.data.fields.StringField({
            initial: 'TheWitcherTRPG.criticalWounds',
            blank: false,
            nullable: false,
            choices: getAllCompendia
        }),
        default: 'TheWitcherTRPG.criticalWounds'
    });

    //optional rules
    game.settings.register('TheWitcherTRPG', 'useOptionalAdrenaline', {
        name: 'WITCHER.Settings.Adrenaline',
        hint: 'WITCHER.Settings.AdrenalineDetails',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });
    game.settings.register('TheWitcherTRPG', 'useOptionalVerbalCombat', {
        name: 'WITCHER.Settings.useVerbalCombatRule',
        hint: 'WITCHER.Settings.useVerbalCombatRuleHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });

    //rules interpretation
    game.settings.register('TheWitcherTRPG', 'woundsAffectSkillBase', {
        name: 'WITCHER.Settings.WoundsAffectSkillBase',
        hint: 'WITCHER.Settings.WoundsAffectSkillBaseDetails',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });

    //sage rulings
    game.settings.register('TheWitcherTRPG', 'silverTrait', {
        name: 'WITCHER.Settings.silverTrait',
        hint: 'WITCHER.Settings.silverTraitHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register('TheWitcherTRPG', 'displayRollsDetails', {
        name: 'WITCHER.Settings.displayRollDetails',
        hint: 'WITCHER.Settings.displayRollDetailsHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });
    game.settings.register('TheWitcherTRPG', 'useWitcherFont', {
        name: 'WITCHER.Settings.specialFont',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });
    game.settings.register('TheWitcherTRPG', 'displayRep', {
        name: 'WITCHER.Settings.displayReputation',
        hint: 'WITCHER.Settings.displayReputationHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });
    game.settings.register('TheWitcherTRPG', 'clickableImageItemTypes', {
        name: 'WITCHER.Settings.clickableImageItemTypes',
        hint: 'WITCHER.Settings.clickableImageItemTypesHint',
        scope: 'world',
        config: true,
        type: String,
        default: 'valuable'
    });
    game.settings.register('TheWitcherTRPG', 'clickableImageCheckboxForGMOnly', {
        name: 'WITCHER.Settings.clickableImageCheckboxForGMOnly',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });
};

const getAllCompendia = () => {
    const itemPacks = game.packs.filter(p => p.documentName === 'Item');

    const packRecord = itemPacks.reduce((record, p) => {
        // two getters that fetch metadata.id and metadata.label respectively
        record[p.collection] = p.title;
        return record;
    }, {});

    return packRecord;
};


import WitcherSpellConfigurationSheet from "./configurations/WitcherSpellConfigurationSheet.js";
import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherSpellSheet extends WitcherItemSheet {
    configuration = new WitcherSpellConfigurationSheet({ document: this.item });

    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/spell-sheet.hbs`,
            scrollable: ['']
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.selects = this.createSelects();

        return context;
    }

    createSelects() {
        return {
            class: {
                Spells: 'WITCHER.Spell.Spells',
                Invocations: 'WITCHER.Spell.Invocations',
                Witcher: 'WITCHER.Spell.Witcher',
                MagicalGift: 'WITCHER.Spell.MagicalGift'
            },
            levelSpell: {
                novice: 'WITCHER.Spell.novice',
                journeyman: 'WITCHER.Spell.journeyman',
                master: 'WITCHER.Spell.master'
            },
            levelMagicalGift: {
                'minor gift': 'WITCHER.Spell.MinorGift',
                'major gift': 'WITCHER.Spell.MajorGift'
            },
            sourceElements: {
                mixedElements: 'WITCHER.Spell.mixedElements',
                earth: 'WITCHER.Spell.earth',
                air: 'WITCHER.Spell.air',
                fire: 'WITCHER.Spell.fire',
                Water: 'WITCHER.Spell.water'
            },
            sourceClass: {
                'druid': 'WITCHER.Spell.druid',
                'preacher': 'WITCHER.Spell.preacher',
                'arch priest': 'WITCHER.Spell.archpriest'
            },
            domain: {
                basic: 'WITCHER.Spell.Basic',
                alternate: 'WITCHER.Spell.Alt'
            },
            templateType: {
                rect: 'WITCHER.Spell.Square',
                circle: 'WITCHER.Spell.Circle',
                cone: 'WITCHER.Spell.Cone',
                ray: 'WITCHER.Spell.Ray'
            }
        };
    }
}

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
                novice: 'WITCHER.Spell.Novice',
                journeyman: 'WITCHER.Spell.Journeyman',
                master: 'WITCHER.Spell.Master'
            },
            levelMagicalGift: {
                'minor gift': 'WITCHER.Spell.MinorGift',
                'major gift': 'WITCHER.Spell.MajorGift'
            },
            sourceElements: {
                mixedElements: 'WITCHER.Spell.Mixed',
                earth: 'WITCHER.Spell.Earth',
                air: 'WITCHER.Spell.Air',
                fire: 'WITCHER.Spell.Fire',
                Water: 'WITCHER.Spell.Water'
            },
            sourceClass: {
                'druid': 'WITCHER.Spell.Druid',
                'preacher': 'WITCHER.Spell.Preacher',
                'arch priest': 'WITCHER.Spell.Archpriest'
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
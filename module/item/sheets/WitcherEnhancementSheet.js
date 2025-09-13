import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherEnhancementSheet extends WitcherItemSheet {
    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/enhancement-sheet.hbs`,
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
            enhancementTypes: {
                weapon: 'WITCHER.Diagram.Weapon',
                rune: 'WITCHER.Enhancement.Rune',
                armor: 'WITCHER.Enhancement.Armor',
                glyph: 'WITCHER.Enhancement.Glyph'
            }
        };
    }
}

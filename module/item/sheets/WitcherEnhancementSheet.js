import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherEnhancementSheet extends WitcherItemSheet {
    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/enhancement-sheet.hbs`;
    }

    /** @override */
    getData() {
        const data = super.getData();

        data.selects = this.createSelects();

        return data;
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

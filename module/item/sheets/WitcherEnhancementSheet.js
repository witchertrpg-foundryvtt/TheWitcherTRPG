import WitcherItemSheetV1 from './WitcherItemSheetV1.js';

export default class WitcherEnhancementSheet extends WitcherItemSheetV1 {
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

import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherHexSheet extends WitcherItemSheet {
    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/hex-sheet.hbs`,
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
            danger: {
                Low: 'WITCHER.Spell.DangerLow',
                Medium: 'WITCHER.Spell.DangerMedium',
                High: 'WITCHER.Spell.DangerHigh'
            }
        };
    }
}

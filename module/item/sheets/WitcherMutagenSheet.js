import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherMutagenSheet extends WitcherItemSheet {
    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/mutagen-sheet.hbs`,
            scrollable: ['']
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.config.Availability.WITCHER = 'WITCHER.Item.AvailabilityWitcher';
        context.config.type = this.getTypes();

        return context;
    }

    getTypes() {
        return {
            red: 'WITCHER.Mutagen.Red',
            green: 'WITCHER.Mutagen.Green',
            blue: 'WITCHER.Mutagen.Blue'
        };
    }
}

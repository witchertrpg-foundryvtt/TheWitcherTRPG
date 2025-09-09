import WitcherItemSheet from './WitcherItemSheet.js';
import WitcherConsumableConfigurationSheet from './configurations/WitcherConsumableConfigurationSheet.js';

export default class WitcherMutagenSheet extends WitcherItemSheet {
    configuration = new WitcherConsumableConfigurationSheet({ document: this.document });

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

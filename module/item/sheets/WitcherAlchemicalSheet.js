import WitcherItemSheet from './WitcherItemSheet.js';
import WitcherConsumableConfigurationSheet from './configurations/WitcherConsumableConfigurationSheet.js';

export default class WitcherAlchemicalSheet extends WitcherItemSheet {

    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/alchemical-sheet.hbs`,
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
            alchemical: 'WITCHER.Alchemy.Alchemical',
            potion: 'WITCHER.Alchemy.Potion',
            decoction: 'WITCHER.Alchemy.Decoction',
            oil: 'WITCHER.Alchemy.Oil'
        };
    }
}

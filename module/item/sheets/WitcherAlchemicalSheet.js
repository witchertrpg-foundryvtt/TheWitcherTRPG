import WitcherItemSheetV1 from './WitcherItemSheetV1.js';
import WitcherConsumableConfigurationSheet from './configurations/WitcherConsumableConfigurationSheet.js';

export default class WitcherAlchemicalSheet extends WitcherItemSheetV1 {
    configuration = new WitcherConsumableConfigurationSheet({ document: this.item });

    /** @override */
    getData() {
        const data = super.getData();

        data.config.Availability.WITCHER = 'WITCHER.Item.AvailabilityWitcher';
        data.config.type = this.getTypes();

        return data;
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

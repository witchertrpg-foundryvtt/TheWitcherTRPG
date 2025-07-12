import WitcherItemSheetV1 from './WitcherItemSheetV1.js';
import WitcherConsumableConfigurationSheet from './configurations/WitcherConsumableConfigurationSheet.js';

export default class WitcherMutagenSheet extends WitcherItemSheetV1 {
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
            red: 'WITCHER.Mutagen.Red',
            green: 'WITCHER.Mutagen.Green',
            blue: 'WITCHER.Mutagen.Blue'
        };
    }
}

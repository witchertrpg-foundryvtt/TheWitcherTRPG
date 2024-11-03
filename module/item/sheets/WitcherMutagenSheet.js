import WitcherItemSheet from './WitcherItemSheet.js';
import WitcherConsumableConfigurationSheet from './configurations/WitcherConsumableConfigurationSheet.js';

export default class WitcherMutagenSheet extends WitcherItemSheet {
    configuration = new WitcherConsumableConfigurationSheet(this.item);

    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/mutagen-sheet.hbs`;
    }

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

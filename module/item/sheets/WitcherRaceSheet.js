import WitcherItemSheet from './WitcherItemSheet.js';
import WitcherConfigurationSheet from './configurations/WitcherConfigurationSheet.js';

export default class WitcherRaceSheet extends WitcherItemSheet {
    configuration = new WitcherConfigurationSheet(this.item);
}

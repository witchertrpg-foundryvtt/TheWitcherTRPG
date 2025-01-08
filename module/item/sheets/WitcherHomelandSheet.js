import WitcherItemSheet from './WitcherItemSheet.js';
import WitcherConfigurationSheet from './configurations/WitcherConfigurationSheet.js';

export default class WitcherHomelandSheet extends WitcherItemSheet {
    configuration = new WitcherConfigurationSheet(this.item);
}

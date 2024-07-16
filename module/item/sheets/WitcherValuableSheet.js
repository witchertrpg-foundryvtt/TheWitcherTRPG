
import WitcherItemSheet from "./WitcherItemSheet.js";
import WitcherConsumableConfigurationSheet from "./configurations/WitcherConsumableConfigurationSheet.js";

export default class WitcherValuableSheet extends WitcherItemSheet {

  configuration = new WitcherConsumableConfigurationSheet(this.item);

  async _renderConfigureDialog() {
    this.configuration._render(true)
  }

}
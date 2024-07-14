
import WitcherItemSheet from "./WitcherItemSheet.js";
import WitcherAlchemicalConfigurationSheet from "./configurations/WitcherAlchemicalConfigurationSheet.js";

export default class WitcherAlchemicalSheet extends WitcherItemSheet {

  configuration = new WitcherAlchemicalConfigurationSheet(this.item);

  get template() {
    return `systems/TheWitcherTRPG/templates/sheets/alchemical-sheet.hbs`;
  }

  /** @override */
  getData() {
    const data = super.getData();

    data.config.Availability.WITCHER = "WITCHER.Item.AvailabilityWitcher";
    data.config.type = this.getTypes();

    return data;
  }

  getTypes() {
    return {
      alchemical: "WITCHER.Alchemy.Alchemical",
      potion: "WITCHER.Alchemy.Potion",
      decoction: "WITCHER.Alchemy.Decoction",
      oil: "WITCHER.Alchemy.Oil",
    }
  }

  async _renderConfigureDialog() {
    this.configuration._render(true)
  }

}
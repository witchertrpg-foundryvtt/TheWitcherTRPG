
export default class WitcherConfigurationSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["witcher", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body" }],
      dragDrop: [{
        dragSelector: ".items-list .item",
        dropSelector: null
      }],
    });
  }

  get template() {
    return `systems/TheWitcherTRPG/templates/sheets/item/configuration/${this.object.type}Configuration.hbs`;
  }

  /** @override */
  getData() {
    const data = super.getData();
    data.config = CONFIG.WITCHER;

    this.options.classes.push(`item-${this.item.type}`)
    data.data = data.item?.system
    return data;
  }

}
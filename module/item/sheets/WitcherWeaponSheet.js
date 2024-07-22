
import WitcherDamagePropertiesConfigurationSheet from "./configurations/WitcherDamagePropertiesConfigurationSheet.js";
import WitcherItemSheet from "./WitcherItemSheet.js";

export default class WitcherWeaponSheet extends WitcherItemSheet {

  configuration = new WitcherDamagePropertiesConfigurationSheet(this.item);

  get template() {
    return `systems/TheWitcherTRPG/templates/sheets/weapon-sheet.hbs`;
  }

  /** @override */
  getData() {
    const data = super.getData();

    data.config.attackSkills = [...new Set(CONFIG.WITCHER.meleeSkills.concat(CONFIG.WITCHER.rangedSkills).map(skill => CONFIG.WITCHER.skillMap[skill]))]

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".damage-type").on("change", this._onDamageTypeEdit.bind(this));
  }

  _onDamageTypeEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let newval = Object.assign({}, this.item.system.type)
    newval[element.id] = !newval[element.id]
    let types = []
    if (newval.slashing) types.push(game.i18n.localize("WITCHER.Armor.slashing"))
    if (newval.piercing) types.push(game.i18n.localize("WITCHER.Armor.piercing"))
    if (newval.bludgeoning) types.push(game.i18n.localize("WITCHER.Armor.bludgeoning"))
    if (newval.elemental) types.push(game.i18n.localize("WITCHER.Armor.elemental"))
    newval.text = types.join(", ")
    this.item.update({ 'system.type': newval });
  }

}

import WitcherItemSheet from "./WitcherItemSheet.js";
import { WITCHER } from "../../setup/config.js";

export default class WitcherEffectSheet extends WitcherItemSheet {

  get template() {
    return `systems/TheWitcherTRPG/templates/sheets/effect-sheet.hbs`;
  }

  /** @override */
  getData() {
    const data = super.getData();

    data.globalModifierConfig = {
      stats: Object.keys(WITCHER.statMap).filter(stat => WITCHER.statMap[stat].origin == "stats").map(stat => WITCHER.statMap[stat]),
      derivedStats: Object.keys(WITCHER.statMap).filter(stat => WITCHER.statMap[stat].origin == "derivedStats" || WITCHER.statMap[stat].origin == "coreStats").map(stat => WITCHER.statMap[stat])
    }

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".add-modifier-stat").on("click", this._onAddModifierStat.bind(this));
    html.find(".add-modifier-skill").on("click", this._onAddModifierSkill.bind(this));
    html.find(".add-modifier-derived").on("click", this._onAddModifierDerived.bind(this));

    html.find(".remove-modifier-stat").on("click", this._onRemoveModifierStat.bind(this));
    html.find(".remove-modifier-skill").on("click", this._onRemoveModifierSkill.bind(this));
    html.find(".remove-modifier-derived").on("click", this._onRemoveModifierDerived.bind(this));

    html.find(".modifiers-edit").on("change", this._onModifierEdit.bind(this));
    html.find(".modifiers-edit-skills").on("change", this._onModifierSkillsEdit.bind(this));
    html.find(".modifiers-edit-derived").on("change", this._onModifierDerivedEdit.bind(this));
  }

  _onAddModifierStat(event) {
    event.preventDefault();
    let newModifierList = []
    if (this.item.system.stats) {
      newModifierList = this.item.system.stats
    }
    newModifierList.push({ stat: "none", modifier: 0 })
    this.item.update({ 'system.stats': newModifierList });
  }

  _onModifierEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;
    let field = element.dataset.field;
    let value = element.value
    let modifiers = this.item.system.stats
    let objIndex = modifiers.findIndex((obj => obj.id == itemId));
    modifiers[objIndex][field] = value
    this.item.update({ 'system.stats': modifiers });
  }

  _onRemoveModifierStat(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;
    let newModifierList = this.item.system.stats.filter(item => item.id !== itemId)
    this.item.update({ 'system.stats': newModifierList });
  }

  _onAddModifierSkill(event) {
    event.preventDefault();
    let newModifierList = []
    if (this.item.system.skills) {
      newModifierList = this.item.system.skills
    }
    newModifierList.push({ skill: "none", modifier: 0 })
    this.item.update({ 'system.skills': newModifierList });
  }

  _onModifierSkillsEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;

    let field = element.dataset.field;
    let value = element.value
    let effects = this.item.system.skills
    let objIndex = effects.findIndex((obj => obj.id == itemId));
    effects[objIndex][field] = value
    this.item.update({ 'system.skills': effects });
  }

  _onRemoveModifierSkill(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;
    let newModifierList = this.item.system.skills.filter(item => item.id !== itemId)
    this.item.update({ 'system.skills': newModifierList });
  }

  _onAddModifierDerived(event) {
    event.preventDefault();
    let newModifierList = []
    if (this.item.system.derived) {
      newModifierList = this.item.system.derived
    }
    newModifierList.push({ derivedStat: "none", modifier: 0 })
    this.item.update({ 'system.derived': newModifierList });
  }

  _onModifierDerivedEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;

    let field = element.dataset.field;
    let value = element.value
    let effects = this.item.system.derived
    let objIndex = effects.findIndex((obj => obj.id == itemId));
    effects[objIndex][field] = value
    this.item.update({ 'system.derived': effects });
  }


  _onRemoveModifierDerived(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;
    let newModifierList = this.item.system.derived.filter(item => item.id !== itemId)
    this.item.update({ 'system.derived': newModifierList });
  }
}
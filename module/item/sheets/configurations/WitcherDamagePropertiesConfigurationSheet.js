
import { genId } from "../../../scripts/witcher.js";
import WitcherConfigurationSheet from "./WitcherConfigurationSheet.js";

export default class WitcherDamagePropertiesConfigurationSheet extends WitcherConfigurationSheet {


  activateListeners(html) {
    super.activateListeners(html);
    html.find(".add-effect").on("click", this._onAddEffect.bind(this));
    html.find(".edit-effect").on("blur", this._onEditEffect.bind(this));
    html.find(".remove-effect").on("click", this._oRemoveEffect.bind(this));

    html.find(".add-global-modifier").on("click", this._onAddGlobalModifier.bind(this));
    html.find(".edit-global-modifier").on("blur", this._onEditGlobalModifier.bind(this));
    html.find(".remove-global-modifier").on("click", this._oRemoveGlobalModifier.bind(this));
  }

  _onAddEffect(event) {
    event.preventDefault();
    let newList = this.item.system.damageProperties.effects ?? []
    newList.push({ id: genId(), percentage: 0 })
    this.item.update({ 'system.damageProperties.effects': newList });
  }

  _onEditEffect(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;

    let field = element.dataset.field;
    let value = element.value

    if (value == "on") {
      value = element.checked;
    }

    let effects = this.item.system.damageProperties.effects
    let objIndex = effects.findIndex((obj => obj.id == itemId));
    effects[objIndex][field] = value

    this.item.update({ 'system.damageProperties.effects': effects });

  }

  _oRemoveEffect(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;
    let newList = this.item.system.damageProperties.effects.filter(item => item.id !== itemId)
    this.item.update({ 'system.damageProperties.effects': newList });
  }


  _onAddGlobalModifier(event) {
    event.preventDefault();
    let target = event.currentTarget.dataset.target;

    let newList = this.getPathedObject(this.item.system, target) ?? []
    newList.push("global modifier")
    this.item.update({ [`system.${target}`]: newList });
  }

  _onEditGlobalModifier(event) {
    event.preventDefault();
    let element = event.currentTarget;

    let target = element.closest(".list-item").dataset.target;

    let value = element.value
    let oldValue = element.defaultValue

    let modifiers = this.getPathedObject(this.item.system, target)

    modifiers[modifiers.indexOf(oldValue)] = value;

    this.item.update({ [`system.${target}`]: modifiers });

  }

  _oRemoveGlobalModifier(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;
    let target = element.closest(".list-item").dataset.target;

    let newList = this.getPathedObject(this.item.system, target).filter(modifier => modifier !== itemId)
    this.item.update({ [`system.${target}`]: newList });
  }

  getPathedObject(object, path) {
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    path = path.replace(/^\./, '');           // strip a leading dot
    var a = path.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in object) {
        object = object[k];
      } else {
        return;
      }
    }
    return object;
  }
}

import WitcherConfigurationSheet from "./WitcherConfigurationSheet.js";

export default class WitcherConsumableConfigurationSheet extends WitcherConfigurationSheet {


  activateListeners(html) {
    super.activateListeners(html);

    html.find(".add-global-modifier").on("click", this._onAddGlobalModifier.bind(this));
    html.find(".edit-global-modifier").on("blur", this._onEditGlobalModifier.bind(this));
    html.find(".remove-global-modifier").on("click", this._oRemoveGlobalModifier.bind(this));

    html.find(".add-effect").on("click", this._onAddEffect.bind(this));
    html.find(".edit-effect").on("blur", this._onEditEffect.bind(this));
    html.find(".remove-effect").on("click", this._oRemoveEffect.bind(this));

  }

  _onAddGlobalModifier(event) {
    event.preventDefault();
    let newList = []
    if (this.item.system.globalModifiers) {
      newList = this.item.system.consumeProperties.consumeGlobalModifiers
    }
    newList.push("global modifier")
    this.item.update({ 'system.consumeProperties.consumeGlobalModifiers': newList });
  }

  _onEditGlobalModifier(event) {
    event.preventDefault();
    let element = event.currentTarget;

    let value = element.value
    let oldValue = element.defaultValue

    let modifiers = this.item.system.consumeProperties.consumeGlobalModifiers

    modifiers[modifiers.indexOf(oldValue)] = value;

    this.item.update({ 'system.consumeProperties.consumeGlobalModifiers': modifiers });

  }

  _oRemoveGlobalModifier(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;
    let newList = this.item.system.consumeProperties.consumeGlobalModifiers.filter(modifier => modifier !== itemId)
    this.item.update({ 'system.consumeProperties.consumeGlobalModifiers': newList });
  }

  _onAddEffect(event) {
    event.preventDefault();
    let newList = this.item.system.consumeProperties.effects ?? []
    newList.push({ percentage: 100 })
    this.item.update({ 'system.consumeProperties.effects': newList });
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

    let effects = this.item.system.consumeProperties.effects
    let objIndex = effects.findIndex((obj => obj.id == itemId));
    effects[objIndex][field] = value

    this.item.update({ 'system.consumeProperties.effects': effects });

  }

  _oRemoveEffect(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;
    let newList = this.item.system.consumeProperties.effects.filter(item => item.id !== itemId)
    this.item.update({ 'system.consumeProperties.effects': newList });
  }

}
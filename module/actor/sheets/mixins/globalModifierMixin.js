export let globalModifierMixin = {

  async _onAddGlobalModifier() {
    let itemData = {
      name: `new global modifier`,
      type: "globalModifier"
    }
    await Item.create(itemData, { parent: this.actor })
  },

  globalModifierListener(html) {
    html.find(".add-global-modifier").on("click", this._onAddGlobalModifier.bind(this));
  }

}
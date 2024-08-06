
import WitcherItemSheet from "./WitcherItemSheet.js";

export default class WitcherDiagramSheet extends WitcherItemSheet {

  get template() {
    return `systems/TheWitcherTRPG/templates/sheets/diagrams-sheet.hbs`;
  }

  /** @inheritdoc */
  _canDragStart(selector) {
    return true;
  }

  /** @inheritdoc */
  _canDragDrop(selector) {
    return true;
  }

  /** @override */
  getData() {
    const data = super.getData();

    data.selects = this.createSelects();

    return data;
  }

  createSelects() {
    return {
      formulaTypes: {
        alchemical: "WITCHER.Alchemy.Alchemical",
        potion: "WITCHER.Alchemy.Potion",
        decoction: "WITCHER.Alchemy.Decoction",
        oil: "WITCHER.Alchemy.Oil",
      },
      diagramTypes: {
        "ingredients": "WITCHER.Diagram.Ingredient",
        "weapon": "WITCHER.Diagram.Weapon",
        "armor": "WITCHER.Diagram.Armor",
        "armor-enhancement": "WITCHER.Diagram.ArmorEnhancement",
        "elderfolk-weapon": "WITCHER.Diagram.ElderFolkWeapon",
        "elderfolk-armor": "WITCHER.Diagram.ElderFolkArmor",
        "ammunition": "WITCHER.Diagram.Ammunition",
        "bomb": "WITCHER.Diagram.Bomb",
        "traps": "WITCHER.Diagram.Traps",
      }
    }
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".add-component").on("click", this._onAddComponent.bind(this));
    html.find(".edit-component").on("blur", this._onEditComponent.bind(this));
    html.find(".remove-component").on("click", this._onRemoveComponent.bind(this));

    html.find(".add-associated-item").on("click", this._onAddAssociatedItem.bind(this))
    html.find(".remove-associated-item").on("click", this._onRemoveAssociatedItem.bind(this))
  }

  async _onDrop(event) {
    let dragEventData = TextEditor.getDragEventData(event)
    let item = await fromUuid(dragEventData.uuid)

    if (item) {
      if (event.target.offsetParent.dataset.type == "associatedItem") {
        this.item.update({ 'system.associatedItemUuid': item.uuid });
      } else {
        let newComponentList = this.item.system.craftingComponents ?? []
        newComponentList.push({ name: item.name, quantity: 1 })
        this.item.update({ 'system.craftingComponents': newComponentList });
      }
    }
  }

  _onEditComponent(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;

    let field = element.dataset.field;
    let value = element.value

    let components = this.item.system.craftingComponents
    let objIndex = components.findIndex((obj => obj.id == itemId));
    components[objIndex][field] = value
    this.item.update({ 'system.craftingComponents': components });
  }

  _onAddComponent(event) {
    event.preventDefault();
    let newComponentList = this.item.system.craftingComponents ?? []
    newComponentList.push({ name: "component", quantity: "" })
    this.item.update({ 'system.craftingComponents': newComponentList });
  }

  _onRemoveComponent(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".list-item").dataset.id;
    let newComponentList = this.item.system.craftingComponents.filter(item => item.id !== itemId)
    this.item.update({ 'system.craftingComponents': newComponentList });
  }

  async _onAddAssociatedItem(event) {
    //todo implement
  }

  async _onRemoveAssociatedItem(event) {
    event.preventDefault();
    this.item.update({ 'system.associatedItemUuid': '' });
  }

}
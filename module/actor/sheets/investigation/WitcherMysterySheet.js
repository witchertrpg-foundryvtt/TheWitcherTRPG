import { rollClue } from "../../../scripts/investigation/rollClue.js";

export default class WitcherMysterySheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["witcher", "sheet", "actor"],
      width: 1120,
      height: 600,
      template: "systems/TheWitcherTRPG/templates/sheets/investigation/mystery-sheet.hbs",
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
    });
  }

  getData() {
    let context = super.getData();

    const actorData = this.actor.toObject(false);
    context.system = actorData.system;

    context.clues = context.actor.getList("clue");
    context.obstacles = context.actor.getList("obstacle");

    context.isGM = game.user.isGM
    context.skills = CONFIG.WITCHER.skillMap

    return context;
  }


  activateListeners(html) {
    super.activateListeners(html);

    html.find(".add-item").on("click", this._onItemAdd.bind(this));
    html.find(".item-edit").on("click", this._onItemEdit.bind(this));
    html.find(".item-delete").on("click", this._onItemDelete.bind(this));
    html.find(".item-hide").on("click", this._onItemHide.bind(this));

    html.find(".inline-edit").change(this._onInlineEdit.bind(this));

    //automation
    html.find(".roll-clue").on("click", this._onRollClue.bind(this));
  }

  async _onItemAdd(event) {
    let element = event.currentTarget
    let itemData = {
      name: `new ${element.dataset.itemtype}`,
      type: element.dataset.itemtype
    }

    await Item.create(itemData, { parent: this.actor })
  }


  _onItemEdit(event) {
    event.preventDefault();
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    item.sheet.render(true)
  }

  async _onItemDelete(event) {
    event.preventDefault();
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    return await this.actor.items.get(itemId).delete();
  }

  _onItemHide(event) {
    event.preventDefault();
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    item.update({ "system.isHidden": !item.system.isHidden })
  }

  _onInlineEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    let field = element.dataset.field;
    // Edit checkbox values
    let value = element.value
    if (value == "false") {
      value = true
    }
    if (value == "true" || value == "checked") {
      value = false
    }

    return item.update({ [field]: value });
  }

  _onRollClue(event) {
    let clueId = event.currentTarget.closest(".item").dataset.itemId;
    let clue = this.actor.items.get(clueId);

    rollClue(clue);
  }
}
import { buttonDialog } from "../../scripts/chat.js";

export default class WitcherMonsterSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["witcher", "sheet", "actor"],
      width: 1120,
      height: 600,
      template: "systems/TheWitcherTRPG/templates/sheets/actor/actor-sheet.hbs",
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
    });
  }

  getData() {
    let context = super.getData();
    context.system = context.actor.system;
    context.weapons = context.actor.getList("weapon");
    context.armors = context.actor.getList("armor");

    context.valuables = context.actor.getList("valuable");
    context.allComponents = context.actor.getList("component");
    context.enhancements = context.items?.filter(i => i.type == "enhancement" && !i.system.applied);
    context.loot = context.actor.getList("mount").concat(context.actor.getList("mutagens")).concat(context.actor.getList("container")).concat(context.actor.getList("alchemical")).concat(context.actor.getList("diagrams"));

    context.totalWeight = context.actor.getTotalWeight();
    context.totalCost = context.items.cost();

    context.isGM = game.user.isGM

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".inline-edit").change(this._onInlineEdit.bind(this));
    html.find(".item-edit").on("click", this._onItemEdit.bind(this));
    html.find(".item-show").on("click", this._onItemShow.bind(this));
    html.find(".item-weapon-display").on("click", this._onItemDisplayInfo.bind(this));
    html.find(".item-armor-display").on("click", this._onItemDisplayInfo.bind(this));
    html.find(".item-valuable-display").on("click", this._onItemDisplayInfo.bind(this));
    html.find(".item-delete").on("click", this._onItemDelete.bind(this));
    html.find(".item-buy").on("click", this._onItemBuy.bind(this));
    html.find(".item-hide").on("click", this._onItemHide.bind(this));
    html.find(".add-item").on("click", this._onItemAdd.bind(this));

    html.find("input").focusin(ev => this._onFocusIn(ev));

    html.find(".dragable").on("dragstart", (ev) => {
      let itemId = ev.target.dataset.id
      let item = this.actor.items.get(itemId);
      ev.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          item: item,
          actor: this.actor,
          type: "itemDrop",
        }),
      )
    });

    const newDragDrop = new DragDrop({
      dragSelector: `.dragable`,
      dropSelector: `.window-content`,
      permissions: { dragstart: this._canDragStart.bind(this), drop: this._canDragDrop.bind(this) },
      callbacks: { dragstart: this._onDragStart.bind(this), drop: this._onDrop.bind(this) }
    })
    this._dragDrop.push(newDragDrop);
  }

  async _onItemAdd(event) {
    let element = event.currentTarget
    let itemData = {
      name: `new ${element.dataset.itemtype}`,
      type: element.dataset.itemtype
    }

    if (element.dataset.itemtype == "component") {
      if (element.dataset.subtype == "alchemical") {
        itemData.system = { type: element.dataset.subtype }
      } else if (element.dataset.subtype) {
        itemData.system = { type: "substances", substanceType: element.dataset.subtype }
      } else {
        itemData.system = { type: "component", substanceType: element.dataset.subtype }
      }
    }

    if (element.dataset.itemtype == "valuable") {
      itemData.system = { type: "general" };
    }

    if (element.dataset.itemtype == "diagram") {
      itemData.system = { type: "alchemical", level: "novice", isFormulae: true };
    }

    await Item.create(itemData, { parent: this.actor })
  }

  async _addItem(actor, Additem, numberOfItem, forcecreate = false) {
    let foundItem = (actor.items).find(item => item.name == Additem.name);
    if (foundItem && !forcecreate) {
      await foundItem.update({ 'system.quantity': Number(foundItem.system.quantity) + Number(numberOfItem) })
    }
    else {
      let newItem = { ...Additem };

      if (numberOfItem) {
        newItem.system.quantity = Number(numberOfItem)
      }
      await actor.createEmbeddedDocuments("Item", [newItem]);
    }
  }

  async _removeItem(actor, itemId, quantityToRemove) {
    actor.removeItem(itemId, quantityToRemove)
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

  _onFocusIn(event) {
    event.currentTarget.select();
  }

  _onItemEdit(event) {
    event.preventDefault();
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    item.sheet.render(true)
  }

  async _onItemShow(event) {
    event.preventDefault;
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    new Dialog({
      title: item.name,
      content: `<img src="${item.img}" alt="${item.img}" width="100%" />`,
      buttons: {}
    }, {
      width: 520,
      resizable: true
    }).render(true);
  }

  async _onItemDelete(event) {
    event.preventDefault();
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    return await this.actor.items.get(itemId).delete();
  }

  async _onItemBuy(event) {
    event.preventDefault();
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    let coinOptions = `
      <option value="crown" selected> ${game.i18n.localize("WITCHER.Currency.crown")} </option>
      <option value="bizant"> ${game.i18n.localize("WITCHER.Currency.bizant")} </option>
      <option value="ducat"> ${game.i18n.localize("WITCHER.Currency.ducat")} </option>
      <option value="lintar"> ${game.i18n.localize("WITCHER.Currency.lintar")} </option>
      <option value="floren"> ${game.i18n.localize("WITCHER.Currency.floren")} </option>
      <option value="oren"> ${game.i18n.localize("WITCHER.Currency.oren")} </option>
      `;
    let percentOptions = `
      <option value="50">50%</option>
      <option value="100"selected>100%</option>
      <option value="125">125%</option>
      <option value="150">150%</option>
      <option value="175">175%</option>
      <option value="200">200%</option>
      `;

    let content = `
      <script>
        function calcTotalCost() {
          var qtyInput = document.getElementById("itemQty");
          var ItemCostInput = document.getElementById("customCost");
          var costTotalInput = document.getElementById("costTotal");
          costTotalInput.value = ItemCostInput.value * qtyInput.value
        }
        function applyPercentage() {
          var qtyInput = document.getElementById("itemQty");
          var percentage = document.getElementById("percent");
          var ItemCostInput = document.getElementById("customCost");
          ItemCostInput.value = Math.ceil(${item.system.cost} * (percentage.value / 100))

          var costTotalInput = document.getElementById("costTotal");
          costTotalInput.value = ItemCostInput.value * qtyInput.value
        }
      </script>

      <label>${game.i18n.localize("WITCHER.Loot.InitialCost")}: ${item.system.cost}</label><br />
      <label>${game.i18n.localize("WITCHER.Loot.HowMany")}: <input id="itemQty" onChange="calcTotalCost()" type="number" class="small" name="itemQty" value=1> /${item.system.quantity}</label> <br />
      <label>${game.i18n.localize("WITCHER.Loot.ItemCost")}</label> <input id="customCost" onChange="calcTotalCost()" type="number" name="costPerItemValue" value=${item.system.cost}>${game.i18n.localize("WITCHER.Loot.Percent")}<select id="percent" onChange="applyPercentage()" name="percentage">${percentOptions}</select><br /><br />
      <label>${game.i18n.localize("WITCHER.Loot.TotalCost")}</label> <input id="costTotal" type="number" class="small" name="costTotalValue" value=${item.system.cost}> <select name="coinType">${coinOptions}</select><br />
      `
    let Characteroptions = `<option value="">other</option>`
    for (let actor of game.actors) {
      if (actor.testUserPermission(game.user, "OWNER")) {
        if (actor == game.user.character) {
          Characteroptions += `<option value="${actor._id}" selected>${actor.name}</option>`
        } else {
          Characteroptions += `<option value="${actor._id}">${actor.name}</option>`
        }
      };
    }
    content += `To Character : <select name="character">${Characteroptions}</select>`
    let cancel = true
    let numberOfItem = 0;
    let totalCost = 0;
    let characterId = "";
    let coinType = "";

    let dialogData = {
      buttons: [
        [`${game.i18n.localize("WITCHER.Button.Continue")}`, (html) => {
          numberOfItem = html.find("[name=itemQty]")[0].value;
          totalCost = html.find("[name=costTotalValue]")[0].value;
          coinType = html.find("[name=coinType]")[0].value;
          characterId = html.find("[name=character]")[0].value;
          cancel = false
        }]],
      title: game.i18n.localize("WITCHER.Loot.BuyTitle"),
      content: content
    }
    await buttonDialog(dialogData)
    if (cancel) {
      return
    }

    let buyerActor = game.actors.get(characterId)
    let token = buyerActor.token ?? buyerActor.getActiveTokens()[0]
    if (token) {
      buyerActor = token.actor
    }
    let hasEnoughMoney = true
    if (buyerActor) {
      hasEnoughMoney = buyerActor.system.currency[coinType] >= totalCost
    }

    if (!hasEnoughMoney) {
      ui.notifications.error("Not Enough Coins");
    } else {
      this._removeItem(this.actor, itemId, numberOfItem)
      if (buyerActor) {
        this._addItem(buyerActor, item, numberOfItem)
      }

      if (buyerActor) {
        buyerActor.update({ [`system.currency.${coinType}`]: buyerActor.system.currency[coinType] - totalCost })
      }
      this.actor.update({ [`system.currency.${coinType}`]: Number(this.actor.system.currency[coinType]) + Number(totalCost) })
    }
  }

  _onItemHide(event) {
    event.preventDefault();
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    item.update({ "system.isHidden": !item.system.isHidden })
  }

  _onItemDisplayInfo(event) {
    event.preventDefault();
    let section = event.currentTarget.closest(".item");
    let editor = $(section).find(".item-info")
    editor.toggleClass("invisible");
  }
}
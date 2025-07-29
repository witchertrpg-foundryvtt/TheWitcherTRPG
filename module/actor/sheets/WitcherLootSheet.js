import { itemContextMenu } from './interactions/itemContextMenu.js';
import { itemMixin } from './mixins/itemMixin.js';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;
const DialogV2 = foundry.applications.api.DialogV2;

export default class WitcherLootSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        position: {
            width: 1120,
            height: 600
        },
        classes: ['witcher', 'sheet', 'actor'],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            buyItem: WitcherLootSheet._onItemBuy,
            hideItem: WitcherLootSheet._onItemHide
        }
    };

    static PARTS = {
        header: {
            template: 'systems/TheWitcherTRPG/templates/sheets/actor/actor-sheet.hbs'
        }
    };

    static TABS = {};

    uniqueTypes = ['profession', 'race', 'homeland'];

    /** @inheritdoc */
    _canDragStart(selector) {
        return true;
    }

    /** @inheritdoc */
    _canDragDrop(selector) {
        return true;
    }

    /** @override */
    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        context.actor = this.document;

        context.system = context.actor.system;
        context.weapons = context.actor.getList('weapon');
        context.armors = context.actor.getList('armor');

        context.valuables = context.actor.getList('valuable');
        context.allComponents = context.actor.getList('component');
        context.enhancements = context.items?.filter(i => i.type == 'enhancement' && !i.system.applied);
        context.loot = context.actor
            .getList('mount')
            .concat(context.actor.getList('mutagens'))
            .concat(context.actor.getList('container'))
            .concat(context.actor.getList('alchemical'))
            .concat(context.actor.getList('diagrams'));

        context.totalWeight = context.actor.getTotalWeight();
        // context.totalCost = context.actor.items.cost();

        context.isGM = game.user.isGM;

        return context;
    }

    _onRender(context, options) {
        super._onRender(context, options);

        this.itemListener(this.element);
        this.itemContextMenu(this.element);
    }

    static async _onItemBuy(event, element) {
        event.preventDefault();
        let itemId = element.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        let coinOptions = `
      <option value="crown" selected> ${game.i18n.localize('WITCHER.Currency.crown')} </option>
      <option value="bizant"> ${game.i18n.localize('WITCHER.Currency.bizant')} </option>
      <option value="ducat"> ${game.i18n.localize('WITCHER.Currency.ducat')} </option>
      <option value="lintar"> ${game.i18n.localize('WITCHER.Currency.lintar')} </option>
      <option value="floren"> ${game.i18n.localize('WITCHER.Currency.floren')} </option>
      <option value="oren"> ${game.i18n.localize('WITCHER.Currency.oren')} </option>
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

      <label>${game.i18n.localize('WITCHER.Loot.InitialCost')}: ${item.system.cost}</label><br />
      <label>${game.i18n.localize('WITCHER.Loot.HowMany')}: <input id="itemQty" onChange="calcTotalCost()" type="number" class="small" name="itemQty" value=1> /${item.system.quantity}</label> <br />
      <label>${game.i18n.localize('WITCHER.Loot.ItemCost')}</label> <input id="customCost" onChange="calcTotalCost()" type="number" name="costPerItemValue" value=${item.system.cost}>${game.i18n.localize('WITCHER.Loot.Percent')}<select id="percent" onChange="applyPercentage()" name="percentage">${percentOptions}</select><br /><br />
      <label>${game.i18n.localize('WITCHER.Loot.TotalCost')}</label> <input id="costTotal" type="number" class="small" name="costTotalValue" value=${item.system.cost}> <select name="coinType">${coinOptions}</select><br />
      `;
        let Characteroptions = '';
        for (let actor of game.actors) {
            if (actor.testUserPermission(game.user, 'OWNER')) {
                if (actor == game.user.character) {
                    Characteroptions += `<option value="${actor._id}" selected>${actor.name}</option>`;
                } else {
                    Characteroptions += `<option value="${actor._id}">${actor.name}</option>`;
                }
            }
        }
        content += `To Character : <select name="character">${Characteroptions}</select>`;

        let { numberOfItem, totalCost, characterId, coinType } = await DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.Loot.BuyTitle')}` },
            content: content,
            modal: true,
            ok: {
                callback: (event, button, dialog) => {
                    return {
                        numberOfItem: button.form.elements.itemQty.value,
                        totalCost: button.form.elements.costTotalValue.value,
                        coinType: button.form.elements.coinType.value,
                        characterId: button.form.elements.character.value
                    };
                }
            }
        });

        let buyerActor = game.actors.get(characterId);
        let hasEnoughMoney = buyerActor.system.currency[coinType] >= totalCost;

        if (!hasEnoughMoney) {
            ui.notifications.error('Not Enough Coins');
        } else {
            this.actor.removeItem(itemId, numberOfItem);
            buyerActor.addItem(item, numberOfItem);
            buyerActor.update({
                [`system.currency.${coinType}`]: Number(buyerActor.system.currency[coinType]) - Number(totalCost)
            });
            this.actor.update({
                [`system.currency.${coinType}`]: Number(this.actor.system.currency[coinType]) + Number(totalCost)
            });
        }
    }

    static async _onItemHide(event, element) {
        event.preventDefault();
        let itemId = element.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        item.update({ 'system.isHidden': !item.system.isHidden });
    }
}

Object.assign(WitcherLootSheet.prototype, itemMixin);
Object.assign(WitcherLootSheet.prototype, itemContextMenu);

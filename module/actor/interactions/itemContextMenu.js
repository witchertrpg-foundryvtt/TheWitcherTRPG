
export let itemContextMenu = {

    itemContextMenu(html) {
        ContextMenu.create(this, html, '.item', [
            this.consumableItem()
        ]);
    },

    consumableItem() {
        return {
            name: "WITCHER.Item.ContextMenu.Consume",
            icon: '<i class="fa-solid fa-cookie-bite"></i>',
            callback: this.consumeItem.bind(this),
            condition: this.isItemConsumable.bind(this)
        }
    },

    isItemConsumable(itemHtml) {
        let item = this.actor.items.get(itemHtml[0].dataset.itemId);

        return item.system.isConsumable
    },

    consumeItem(itemHtml) {
        let item = this.actor.items.get(itemHtml[0].dataset.itemId);

        if (!item.system.isConsumable) {
            return ui.notifications.error(`${game.i18n.localize("WITCHER.Item.ContextMenu.NotConsumable")}`)
        }

        item.consume();
        this._removeItem(this.actor, item.id, 1)
    }
}
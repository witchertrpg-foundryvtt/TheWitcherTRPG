
export let itemContextMenu = {

    itemContextMenu(html) {
        ContextMenu.create(this, html, '.item', [
            this.consumableItem(),
            this.removableEnhancement()
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
        this.actor.removeItem(item.id, 1)
    },

    removableEnhancement() {
        return {
            name: "WITCHER.Item.ContextMenu.RemoveEnhancement",
            icon: '<i class="fa-solid fa-square-minus"></i>',
            callback: this.removeEnhancement.bind(this),
            condition: this.isEnhancementRemovable.bind(this)
        }
    },

    isEnhancementRemovable(itemHtml) {
        let choosenEnhancement = this.actor.items.get(itemHtml[0].dataset.itemId);

        return choosenEnhancement.system.applied
    },

    removeEnhancement(itemHtml) {
        let choosenEnhancement = this.actor.items.get(itemHtml[0].dataset.itemId);

        var parentData = itemHtml.parent()[0].closest(".item").dataset;

        choosenEnhancement.update({
            "system.applied": false,
            "name": choosenEnhancement.name.replace("(Applied)", ""),
        })

        let parent = this.actor.items.get(parentData.itemId)

        parent.update({ 'system.enhancementItemIds': parent.system.enhancementItemIds.filter(id => id != choosenEnhancement.id) })

        if (parentData.type == "armor") {
            parent.update({
                "system.headStopping": parent.system.headStopping - choosenEnhancement.system.stopping,
                "system.headMaxStopping": parent.system.headMaxStopping - choosenEnhancement.system.stopping,
                "system.torsoStopping": parent.system.torsoStopping - choosenEnhancement.system.stopping,
                "system.torsoMaxStopping": parent.system.torsoMaxStopping - choosenEnhancement.system.stopping,
                "system.leftArmStopping": parent.system.leftArmStopping - choosenEnhancement.system.stopping,
                "system.leftArmMaxStopping": parent.system.leftArmMaxStopping - choosenEnhancement.system.stopping,
                "system.rightArmStopping": parent.system.rightArmStopping - choosenEnhancement.system.stopping,
                "system.rightArmMaxStopping": parent.system.rightArmMaxStopping - choosenEnhancement.system.stopping,
                "system.leftLegStopping": parent.system.leftLegStopping - choosenEnhancement.system.stopping,
                "system.leftLegMaxStopping": parent.system.leftLegMaxStopping - choosenEnhancement.system.stopping,
                "system.rightLegStopping": parent.system.rightLegStopping - choosenEnhancement.system.stopping,
                "system.rightLegMaxStopping": parent.system.rightLegMaxStopping - choosenEnhancement.system.stopping,
                'system.bludgeoning': choosenEnhancement.system.bludgeoning ? false : parent.system.bludgeoning,
                'system.slashing': choosenEnhancement.system.slashing ? false : parent.system.slashing,
                'system.piercing': choosenEnhancement.system.piercing ? false : parent.system.piercing,
                'system.effects': parent.system.effects.filter(effect => !choosenEnhancement.system.effects.some(enhEffect => enhEffect.id == effect.id))
            })
        }

    }
}
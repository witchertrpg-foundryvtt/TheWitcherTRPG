import { emitForGM } from '../../../scripts/socket/socketMessage.js';

const DialogV2 = foundry.applications.api.DialogV2;

export let itemContextMenu = {
    itemContextMenu(html) {
        new foundry.applications.ux.ContextMenu(html, '.item', [
            this.editItem(),
            this.consumableItem(),
            this.removableEnhancement(),
            this.giftableItem(),
            this.dismantableItem(),
            this.deleteItem()
        ]);
    },

    editItem() {
        return {
            name: 'WITCHER.Item.ContextMenu.edit',
            icon: '<i class="fas fa-edit"></i>',
            callback: event => {
                const item = this.actor.items.get(event[0].dataset.itemId);
                item.sheet.render(true);
            }
        };
    },

    consumableItem() {
        return {
            name: 'WITCHER.Item.ContextMenu.Consume',
            icon: '<i class="fa-solid fa-cookie-bite"></i>',
            callback: this.consumeItem.bind(this),
            condition: this.isItemConsumable.bind(this)
        };
    },

    isItemConsumable(itemHtml) {
        let item = this.actor.items.get(itemHtml[0].dataset.itemId);

        return item.system.isConsumable;
    },

    consumeItem(itemHtml) {
        let item = this.actor.items.get(itemHtml[0].dataset.itemId);

        if (!item.system.isConsumable) {
            return ui.notifications.error(`${game.i18n.localize('WITCHER.Item.ContextMenu.NotConsumable')}`);
        }

        item.consume();
        this.actor.removeItem(item.id, 1);
    },

    removableEnhancement() {
        return {
            name: 'WITCHER.Item.ContextMenu.RemoveEnhancement',
            icon: '<i class="fa-solid fa-square-minus"></i>',
            callback: this.removeEnhancement.bind(this),
            condition: this.isEnhancementRemovable.bind(this)
        };
    },

    isEnhancementRemovable(itemHtml) {
        let choosenEnhancement = this.actor.items.get(itemHtml[0].dataset.itemId);

        return choosenEnhancement.system.applied;
    },

    removeEnhancement(itemHtml) {
        let choosenEnhancement = this.actor.items.get(itemHtml[0].dataset.itemId);

        var parentData = itemHtml.parent()[0].closest('.item').dataset;

        choosenEnhancement.update({
            'system.applied': false,
            'name': choosenEnhancement.name.replace('(Applied)', '')
        });

        let parent = this.actor.items.get(parentData.itemId);

        parent.update({
            'system.enhancementItemIds': parent.system.enhancementItemIds.filter(id => id != choosenEnhancement.id)
        });

        if (parentData.type == 'armor') {
            parent.update({
                'system.headStopping': parent.system.headStopping - choosenEnhancement.system.stopping,
                'system.headMaxStopping': parent.system.headMaxStopping - choosenEnhancement.system.stopping,
                'system.torsoStopping': parent.system.torsoStopping - choosenEnhancement.system.stopping,
                'system.torsoMaxStopping': parent.system.torsoMaxStopping - choosenEnhancement.system.stopping,
                'system.leftArmStopping': parent.system.leftArmStopping - choosenEnhancement.system.stopping,
                'system.leftArmMaxStopping': parent.system.leftArmMaxStopping - choosenEnhancement.system.stopping,
                'system.rightArmStopping': parent.system.rightArmStopping - choosenEnhancement.system.stopping,
                'system.rightArmMaxStopping': parent.system.rightArmMaxStopping - choosenEnhancement.system.stopping,
                'system.leftLegStopping': parent.system.leftLegStopping - choosenEnhancement.system.stopping,
                'system.leftLegMaxStopping': parent.system.leftLegMaxStopping - choosenEnhancement.system.stopping,
                'system.rightLegStopping': parent.system.rightLegStopping - choosenEnhancement.system.stopping,
                'system.rightLegMaxStopping': parent.system.rightLegMaxStopping - choosenEnhancement.system.stopping,
                'system.bludgeoning': choosenEnhancement.system.bludgeoning ? false : parent.system.bludgeoning,
                'system.slashing': choosenEnhancement.system.slashing ? false : parent.system.slashing,
                'system.piercing': choosenEnhancement.system.piercing ? false : parent.system.piercing,
                'system.effects': parent.system.effects.filter(
                    effect => !choosenEnhancement.system.effects.some(enhEffect => enhEffect.id == effect.id)
                )
            });
        }
    },

    giftableItem() {
        return {
            name: 'WITCHER.Item.ContextMenu.Gift',
            icon: '<i class="fa-solid fa-gift"></i>',
            callback: this.giftItem.bind(this),
            condition: this.isItemGiftable.bind(this)
        };
    },

    isItemGiftable(itemHtml) {
        let giftableTypes = [
            'alchemical',
            'armor',
            'component',
            'diagrams',
            'enhancement',
            'mount',
            'mutagen',
            'valuable',
            'weapon'
        ];
        let item = this.actor.items.get(itemHtml[0].dataset.itemId);

        return giftableTypes.includes(item.type);
    },

    async giftItem(itemHtml) {
        let item = this.actor.items.get(itemHtml[0].dataset.itemId);

        let allActors = '';
        game.actors
            ?.filter(e => e.hasPlayerOwner)
            .forEach(t => {
                allActors = allActors.concat(`
                            <option value="${t.uuid}">${t.name}</option>`);
            });
        const dialog_content = `
                <select name ="actor">
                ${allActors}
                </select>`;

        let receiver = await DialogV2.prompt({
            content: dialog_content,
            ok: {
                callback: (event, button, dialog) => {
                    return button.form.elements.actor?.value;
                }
            }
        });

        if (game.user.isGM) {
            let receiverActor = fromUuidSync(receiver);
            receiverActor.addItem(item, 1);
        } else {
            emitForGM('addItem', [receiver, item, 1]);
        }

        this.actor.removeItem(item.id, 1);
    },

    dismantableItem() {
        return {
            name: 'WITCHER.Item.ContextMenu.dismantle',
            icon: '<i class="fa-solid fa-recycle"></i>',
            callback: this.dismantleItem.bind(this),
            condition: this.isItemDismantable.bind(this)
        };
    },

    isItemDismantable(itemHtml) {
        let item = this.actor.items.get(itemHtml[0].dataset.itemId);

        return item.canBeDismantled();
    },

    async dismantleItem(itemHtml) {
        let item = this.actor.items.get(itemHtml[0].dataset.itemId);

        item.dismantle();
    },

    deleteItem() {
        return {
            name: 'WITCHER.Item.ContextMenu.delete',
            icon: '<i class="fa-solid fa-trash"></i>',
            callback: event => {
                const item = this.actor.items.get(event[0].dataset.itemId);
                item.delete();
            }
        };
    }
};

import { WITCHER } from '../../../setup/config.js';

export let itemMixin = {
    async _onDropItem(event, data) {
        if (!this.actor.isOwner) return false;
        const item = await Item.implementation.fromDropData(data);
        const itemData = item.toObject();

        // Handle item sorting within the same Actor
        if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

        if (this._isUniqueItem(itemData)) {
            await this.actor.removeItemsOfType(itemData.type);
        }

        if (data && data.type === 'Item') {
            if (item) {
                if (item.type === 'weapon' && this.actor.type === 'monster') {
                    item.system.equipped = true;
                }
                this.actor.addItem(item, 1);
            }
        } else {
            super._onDrop(event, data);
        }
    },

    _isUniqueItem(itemData) {
        return this.uniqueTypes.includes(itemData.type);
    },

    async _onItemAdd(event) {
        let element = event.currentTarget;
        let itemData = {
            name: `new ${element.dataset.itemtype}`,
            type: element.dataset.itemtype
        };

        switch (element.dataset.spelltype) {
            case 'spellNovice':
                itemData.system = { class: 'Spells', level: 'novice' };
                break;
            case 'spellJourneyman':
                itemData.system = { class: 'Spells', level: 'journeyman' };
                break;
            case 'spellMaster':
                itemData.system = { class: 'Spells', level: 'master' };
                break;
            case 'magicalgift':
                itemData.system = { class: 'MagicalGift' };
                break;
        }

        if (element.dataset.itemtype == 'component') {
            if (element.dataset.subtype == 'alchemical') {
                itemData.system = { type: element.dataset.subtype };
            } else if (element.dataset.subtype) {
                itemData.system = { type: 'substances', substanceType: element.dataset.subtype };
            } else {
                itemData.system = { type: 'component', substanceType: element.dataset.subtype };
            }
        }

        if (element.dataset.itemtype == 'valuable') {
            itemData.system = { type: 'general' };
        }

        if (element.dataset.itemtype == 'diagram') {
            itemData.system = { type: 'alchemical', level: 'novice', isFormulae: true };
        }

        await Item.create(itemData, { parent: this.actor });
    },

    async _onItemEquip(event) {
        event.preventDefault();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);

        await item.update({ 'system.equipped': !item.system.equipped });
    },

    async _onItemCarried(event) {
        event.preventDefault();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);

        await item.update({ 'system.isCarried': !item.system.isCarried });
    },

    async _onItemLearned(event) {
        event.preventDefault();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);

        await item.update({ 'system.learned': !item.system.learned });
    },

    _onItemInlineEdit(event) {
        event.preventDefault();
        event.stopPropagation();
        let element = event.currentTarget;
        let itemId = element.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        let field = element.dataset.field;
        // Edit checkbox values
        let value = element.value;
        if (value == 'false') {
            value = true;
        }
        if (value == 'true' || value == 'checked') {
            value = false;
        }

        return item.update({ [field]: value });
    },

    _onItemEdit(event) {
        event.preventDefault();
        event.stopPropagation();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);

        item.sheet.render(true);
    },

    async _onItemShow(event) {
        event.preventDefault;
        event.stopPropagation();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);

        new Dialog(
            {
                title: item.name,
                content: `<img src="${item.img}" alt="${item.img}" width="100%" />`,
                buttons: {}
            },
            {
                width: 520,
                resizable: true
            }
        ).render(true);
    },

    async _onItemDelete(event) {
        event.preventDefault();
        event.stopPropagation();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        this.actor.items.get(itemId).delete();
    },

    async _chooseEnhancement(event) {
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        let type = event.currentTarget.closest('.item').dataset.type;

        let content = '';
        let enhancements = this.actor.getList('enhancement');
        if (type == 'weapon') {
            enhancements = enhancements.filter(
                e => e.system.applied == false && (e.system.type == 'rune' || e.system.type == 'weapon')
            );
        } else {
            enhancements = enhancements.filter(
                e => e.system.applied == false && (e.system.type == 'armor' || e.system.type == 'glyph')
            );
        }

        let quantity = enhancements.sum('quantity');
        if (quantity == 0) {
            content += `<div class="error-display">${game.i18n.localize('WITCHER.Enhancement.NoEnhancement')}</div>`;
        } else {
            let enhancementsOption = ``;
            enhancements.forEach(element => {
                enhancementsOption += `<option value="${element._id}"> ${element.name}(${element.system.quantity}) </option>`;
            });
            content += `<div><label>${game.i18n.localize('WITCHER.Dialog.Enhancement')}: <select name="enhancement">${enhancementsOption}</select></label></div>`;
        }

        new Dialog({
            title: `${game.i18n.localize('WITCHER.Enhancement.ChooseTitle')}`,
            content,
            buttons: {
                Cancel: {
                    label: `${game.i18n.localize('WITCHER.Button.Cancel')}`,
                    callback: () => {}
                },
                Apply: {
                    label: `${game.i18n.localize('WITCHER.Dialog.Apply')}`,
                    callback: async html => {
                        let enhancementId = undefined;
                        if (html.find('[name=enhancement]')[0]) {
                            enhancementId = html.find('[name=enhancement]')[0].value;
                        }
                        if (enhancementId) {
                            let newEnhancementList = item.system.enhancementItemIds;
                            newEnhancementList.push(enhancementId);
                            await item.update({ 'system.enhancementItemIds': newEnhancementList });

                            let choosenEnhancement = this.actor.items.get(enhancementId);
                            if (
                                choosenEnhancement.system.type == 'armor' ||
                                choosenEnhancement.system.type == 'glyph'
                            ) {
                                await item.update({
                                    'system.headStopping':
                                        item.system.headStopping + choosenEnhancement.system.stopping,
                                    'system.headMaxStopping':
                                        item.system.headMaxStopping + choosenEnhancement.system.stopping,
                                    'system.torsoStopping':
                                        item.system.torsoStopping + choosenEnhancement.system.stopping,
                                    'system.torsoMaxStopping':
                                        item.system.torsoMaxStopping + choosenEnhancement.system.stopping,
                                    'system.leftArmStopping':
                                        item.system.leftArmStopping + choosenEnhancement.system.stopping,
                                    'system.leftArmMaxStopping':
                                        item.system.leftArmMaxStopping + choosenEnhancement.system.stopping,
                                    'system.rightArmStopping':
                                        item.system.rightArmStopping + choosenEnhancement.system.stopping,
                                    'system.rightArmMaxStopping':
                                        item.system.rightArmMaxStopping + choosenEnhancement.system.stopping,
                                    'system.leftLegStopping':
                                        item.system.leftLegStopping + choosenEnhancement.system.stopping,
                                    'system.leftLegMaxStopping':
                                        item.system.leftLegMaxStopping + choosenEnhancement.system.stopping,
                                    'system.rightLegStopping':
                                        item.system.rightLegStopping + choosenEnhancement.system.stopping,
                                    'system.rightLegMaxStopping':
                                        item.system.rightLegMaxStopping + choosenEnhancement.system.stopping,
                                    'system.bludgeoning': choosenEnhancement.system.bludgeoning,
                                    'system.slashing': choosenEnhancement.system.slashing,
                                    'system.piercing': choosenEnhancement.system.piercing,
                                    'system.effects': item.system.effects.concat(choosenEnhancement.system.effects)
                                });
                            }

                            let newName = choosenEnhancement.name + '(Applied)';
                            let newQuantity = choosenEnhancement.system.quantity;
                            await choosenEnhancement.update({
                                'name': newName,
                                'system.applied': true,
                                'system.quantity': 1
                            });
                            if (newQuantity > 1) {
                                newQuantity -= 1;
                                await this.actor.addItem(choosenEnhancement, newQuantity, true);
                            }
                        }
                    }
                }
            }
        }).render(true);
    },

    _onItemDisplayInfo(event) {
        event.preventDefault();
        event.stopPropagation();
        let section = event.currentTarget.closest('.item');
        let editor = $(section).find('.item-info');
        editor.toggleClass('invisible');
    },

    _onDisplayList(event) {
        event.preventDefault();
        event.stopPropagation();

        let section = event.currentTarget.closest('.weapon-section');
        let editor = section.querySelector('.weapon-list');
        editor.classList.toggle('invisible');

        let icon = event.currentTarget.querySelector('.fa-chevron-up');
        icon.classList.toggle('rotate-180');
    },

    _onEnhancementInfo(event) {
        event.preventDefault();
        event.stopPropagation();
        let section = event.currentTarget.closest('.weapon-enhancement');
        let editor = $(section).find('.enhancement-info');
        editor.toggleClass('invisible');
    },

    async _onItemRoll(event) {
        this.actor.useItem(event.currentTarget.closest('.item').dataset.itemId, {
            alt: event?.altKey,
            ctrl: event?.ctrlKey,
            shift: event?.shiftKey
        });
    },

    _onSpellDisplay(event) {
        event.preventDefault();
        let section = event.currentTarget.closest('.spell');
        this.actor.update({
            [`system.pannels.${section.dataset.spelltype}IsOpen`]:
                !this.actor.system.pannels[section.dataset.spelltype + 'IsOpen']
        });
    },

    _onSubstanceDisplay(event) {
        event.preventDefault();
        let section = event.currentTarget.closest('.substance');
        this.actor.update({
            [`system.pannels.${section.dataset.subtype}IsOpen`]:
                !this.actor.system.pannels[section.dataset.subtype + 'IsOpen']
        });
    },

    async _onItemMessage(event) {
        let itemId = event.currentTarget.closest('.list-item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        const dialogData = {
            item: item,
            type: item.type,
            config: WITCHER
        };

        ChatMessage.create({
            content: await renderTemplate(
                'systems/TheWitcherTRPG/templates/chat/item/item-description.hbs',
                dialogData
            ),
            speaker: ChatMessage.getSpeaker({ actor: this.actor.name }),
            type: CONST.CHAT_MESSAGE_TYPES.IC
        });
    },

    itemListener(html) {
        html.find('.add-item').on('click', this._onItemAdd.bind(this));
        html.find('.item-equip').on('click', this._onItemEquip.bind(this));
        html.find('.item-carried').on('click', this._onItemCarried.bind(this));
        html.find('.item-learned').on('click', this._onItemLearned.bind(this));
        html.find('.item-edit').on('click', this._onItemEdit.bind(this));
        html.find('.item-show').on('click', this._onItemShow.bind(this));
        html.find('.item-delete').on('click', this._onItemDelete.bind(this));
        html.find('.inline-edit').change(this._onItemInlineEdit.bind(this));
        html.find('.inline-edit').on('click', e => e.stopPropagation());

        html.find('.enhancement-weapon-slot').on('click', this._chooseEnhancement.bind(this));
        html.find('.enhancement-armor-slot').on('click', this._chooseEnhancement.bind(this));

        html.find('.weapon-list-display').on('click', this._onDisplayList.bind(this));

        html.find('.item-weapon-display').on('click', this._onItemDisplayInfo.bind(this));
        html.find('.item-armor-display').on('click', this._onItemDisplayInfo.bind(this));
        html.find('.item-display-info').on('click', this._onItemDisplayInfo.bind(this));
        html.find('.item-valuable-display').on('click', this._onItemDisplayInfo.bind(this));
        html.find('.item-spell-display').on('click', this._onItemDisplayInfo.bind(this));
        html.find('.item-substance-display').on('click', this._onSubstanceDisplay.bind(this));

        html.find('.enhancement-label').on('click', this._onEnhancementInfo.bind(this));

        html.find('.spell-display').on('click', this._onSpellDisplay.bind(this));

        html.find('.item-roll').on('click', this._onItemRoll.bind(this));
        html.find('.spell-roll').on('click', this._onItemRoll.bind(this));
        html.find('.item-chat').on('click', this._onItemMessage.bind(this));
    }
};

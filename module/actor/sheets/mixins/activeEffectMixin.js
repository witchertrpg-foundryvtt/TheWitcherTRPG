export let activeEffectMixin = {
    /**
     * Prepare the data structure for Active Effects which are currently embedded in an Actor or Item.
     * @param {ActiveEffect[]} effects    A collection or generator of Active Effect documents to prepare sheet data for
     * @returns {object}                   Data for rendering
     */
    prepareActiveEffectCategories(effects) {
        // Define effect header categories
        const categories = {
            temporary: {
                type: 'temporary',
                label: game.i18n.localize('WITCHER.activeEffect.temporary'),
                effects: []
            },
            passive: {
                type: 'passive',
                label: game.i18n.localize('WITCHER.activeEffect.passive'),
                effects: []
            },
            inactive: {
                type: 'inactive',
                label: game.i18n.localize('WITCHER.activeEffect.inactive'),
                effects: []
            }
        };

        // Iterate over active effects, classifying them into categories
        for (let e of effects) {
            if (e.isDisabled) categories.inactive.effects.push(e);
            else if (e.isTemporary) categories.temporary.effects.push(e);
            else categories.passive.effects.push(e);
        }
        return categories;
    },

    /**
     * Manage Active Effect instances through an Actor or Item Sheet via effect control buttons.
     * @param {MouseEvent} event      The left-click event on the effect control
     * @param {Actor|Item} caller      The owning document which manages this effect
     * @returns {object}              effect function
     */
    onManageActiveEffect(event, caller) {
        event.preventDefault();
        const a = event.currentTarget;
        const li = a.closest('li');
        const parentUuid = li?.dataset.parentUuid;
        const effect = li.dataset.effectId ? fromUuidSync(parentUuid).effects.get(li.dataset.effectId) : null;
        switch (a.dataset.action) {
            case 'create':
                return caller.createEmbeddedDocuments('ActiveEffect', [
                    {
                        name: game.i18n.format('DOCUMENT.New', {
                            type: game.i18n.localize('DOCUMENT.ActiveEffect')
                        }),
                        icon: 'icons/svg/aura.svg',
                        origin: caller.uuid,
                        disabled: li.dataset.effectType === 'inactive'
                    }
                ]);
            case 'edit':
                return effect.sheet.render(true);
            case 'delete':
                return parentUuid == caller.uuid
                    ? effect.delete()
                    : ui.notifications.error(`${game.i18n.localize('WITCHER.Effect.Error.belongsToItem')}`);
            case 'toggle':
                return effect.update({ disabled: !effect.disabled });
        }
    },

    async _onActiveEffectDisplayInfo(event) {
        event.preventDefault();
        event.stopPropagation();
        let section = event.currentTarget.closest('.effect-row');
        let editor = $(section).find('.effect-description');
        editor.toggleClass('invisible');
    },

    activeEffectListener(html) {
        // Active Effect management
        html.on('click', '.effect-control', ev => this.onManageActiveEffect(ev, this.actor));
        html.find('.effect-display').on('click', this._onActiveEffectDisplayInfo.bind(this));
    }
};

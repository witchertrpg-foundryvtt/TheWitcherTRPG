import WitcherItemSheet from './WitcherItemSheet.js';
import { WITCHER } from '../../setup/config.js';

export default class WitcherGlobalModifierSheet extends WitcherItemSheet {
    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/globalModifier-sheet.hbs`;
    }

    /** @override */
    getData() {
        const data = super.getData();

        data.globalModifierConfig = {
            stats: Object.keys(WITCHER.statMap)
                .filter(stat => WITCHER.statMap[stat].origin == 'stats')
                .map(stat => WITCHER.statMap[stat]),
            derivedStats: Object.keys(WITCHER.statMap)
                .filter(
                    stat =>
                        WITCHER.statMap[stat].origin == 'derivedStats' || WITCHER.statMap[stat].origin == 'coreStats'
                )
                .map(stat => WITCHER.statMap[stat]),
            special: WITCHER.specialModifier
        };
        // Prepare active effects for easier access
        data.effects = this.prepareActiveEffectCategories(this.item.effects);

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.add-modifier-stat').on('click', this._onAddModifier.bind(this, 'stats'));
        html.find('.add-modifier-skill').on('click', this._onAddModifier.bind(this, 'skills'));
        html.find('.add-modifier-derived').on('click', this._onAddModifier.bind(this, 'derived'));
        html.find('.add-modifier-special').on('click', this._onAddModifier.bind(this, 'special'));

        html.find('.remove-modifier-stat').on('click', this._onRemoveModifier.bind(this, 'stats'));
        html.find('.remove-modifier-skill').on('click', this._onRemoveModifier.bind(this, 'skills'));
        html.find('.remove-modifier-derived').on('click', this._onRemoveModifier.bind(this, 'derived'));
        html.find('.remove-modifier-special').on('click', this._onRemoveModifier.bind(this, 'special'));

        html.find('.modifiers-edit').on('change', this._onEditModifier.bind(this, 'stats'));
        html.find('.modifiers-edit-skills').on('change', this._onEditModifier.bind(this, 'skills'));
        html.find('.modifiers-edit-derived').on('change', this._onEditModifier.bind(this, 'derived'));
        html.find('.modifiers-edit-special').on('change', this._onEditModifier.bind(this, 'special'));

        // Active Effect management
        html.on('click', '.effect-control', ev => this.onManageActiveEffect(ev, this.item));
    }

    _onAddModifier(type, event) {
        event.preventDefault();
        let newModifierList = this.item.system[type] ?? [];
        newModifierList.push({ id: foundry.utils.randomID() });
        this.item.update({ [`system.${type}`]: newModifierList });
    }

    _onEditModifier(type, event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.id;
        let field = element.dataset.field;
        let value = element.value;
        let modifiers = this.item.system[type];
        let objIndex = modifiers.findIndex(obj => obj.id == itemId);
        modifiers[objIndex][field] = value;
        this.item.update({ [`system.${type}`]: modifiers });
    }

    _onRemoveModifier(type, event) {
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.id;
        let newModifierList = this.item.system[type].filter(item => item.id !== itemId);
        this.item.update({ [`system.${type}`]: newModifierList });
    }

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
            if (e.disabled) categories.inactive.effects.push(e);
            else if (e.isTemporary) categories.temporary.effects.push(e);
            else categories.passive.effects.push(e);
        }
        return categories;
    }

    /**
     * Manage Active Effect instances through an Actor or Item Sheet via effect control buttons.
     * @param {MouseEvent} event      The left-click event on the effect control
     * @param {Actor|Item} owner      The owning document which manages this effect
     * @returns {object}              effect function
     */
    onManageActiveEffect(event, owner) {
        event.preventDefault();
        const a = event.currentTarget;
        const li = a.closest('li');
        const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
        switch (a.dataset.action) {
            case 'create':
                return owner.createEmbeddedDocuments('ActiveEffect', [
                    {
                        'name': owner.name,
                        'icon': owner.img,
                        'origin': owner.uuid,
                        'duration.rounds': li.dataset.effectType === 'temporary' ? 1 : undefined,
                        'disabled': li.dataset.effectType === 'inactive'
                    }
                ]);
            case 'edit':
                return effect.sheet.render(true);
            case 'delete':
                return effect.delete();
            case 'toggle':
                return effect.update({ disabled: !effect.disabled });
        }
    }
}

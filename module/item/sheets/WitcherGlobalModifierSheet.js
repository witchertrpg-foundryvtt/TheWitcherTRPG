import WitcherItemSheet from './WitcherItemSheet.js';
import { WITCHER } from '../../setup/config.js';

export default class WitcherGlobalModifierSheet extends WitcherItemSheet {
    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/item/globalModifier-sheet.hbs`;
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

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.remove-modifier-stat').on('click', this._onRemoveModifier.bind(this, 'stats'));
        html.find('.remove-modifier-skill').on('click', this._onRemoveModifier.bind(this, 'skills'));
        html.find('.remove-modifier-derived').on('click', this._onRemoveModifier.bind(this, 'derived'));
        html.find('.remove-modifier-special').on('click', this._onRemoveModifier.bind(this, 'special'));

        html.find('.modifiers-edit').on('change', this._onEditModifier.bind(this, 'stats'));
        html.find('.modifiers-edit-skills').on('change', this._onEditModifier.bind(this, 'skills'));
        html.find('.modifiers-edit-derived').on('change', this._onEditModifier.bind(this, 'derived'));
        html.find('.modifiers-edit-special').on('change', this._onEditModifier.bind(this, 'special'));
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
}

import WitcherConfigurationSheet from './WitcherConfigurationSheet.js';

export default class WitcherConsumableConfigurationSheet extends WitcherConfigurationSheet {
    /** @override */
    static DEFAULT_OPTIONS = {
        position: {
            width: 520,
            height: 480
        },
        classes: ['witcher', 'sheet', 'item'],
        actions: {
            addEffect: WitcherConsumableConfigurationSheet._onAddEffect,
            removeEffect: WitcherConsumableConfigurationSheet._oRemoveEffect
        }
    };

    static PARTS = {
        ...super.PARTS,
        consumableProperties: {
            template:
                'systems/TheWitcherTRPG/templates/sheets/item/configuration/tabs/consumablePropertiesConfiguration.hbs',
            scrollable: ['']
        }
    };

    static TABS = {
        ...super.TABS,
        primary: {
            ...super.TABS.primary,
            tabs: [{ id: 'general' }, { id: 'consumableProperties' }, { id: 'activeEffects' }]
        }
    };

    _onRender(context, options) {
        super._onRender(context, options);

        this.element
            .querySelectorAll('input[data-action=editEffect]')
            .forEach(input => input.addEventListener('focusout', this._onEditEffect.bind(this)));
        this.element
            .querySelectorAll('select[data-action=editEffect]')
            .forEach(input => input.addEventListener('input', this._onEditEffect.bind(this)));
    }

    static async _onAddEffect(event, element) {
        event.preventDefault();
        let target = element.dataset.target;

        let newList = this.item.system.consumeProperties[target] ?? [];
        newList.push({ percentage: 100 });
        this.item.update({ [`system.consumeProperties.${target}`]: newList });
    }

    async _onEditEffect(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.id;

        let target = element.closest('.list-item').dataset.target;

        let field = element.dataset.field;
        let value = element.value;

        if (value == 'on') {
            value = element.checked;
        }

        let effects = this.item.system.consumeProperties[target];
        let objIndex = effects.findIndex(obj => obj.id == itemId);
        effects[objIndex][field] = value;

        this.item.update({ [`system.consumeProperties.${target}`]: effects });
    }

    static async _oRemoveEffect(event, element) {
        event.preventDefault();
        let itemId = element.closest('.list-item').dataset.id;

        let target = element.closest('.list-item').dataset.target;

        let newList = this.item.system.consumeProperties[target].filter(item => item.id !== itemId);
        this.item.update({ [`system.consumeProperties.${target}`]: newList });
    }
}

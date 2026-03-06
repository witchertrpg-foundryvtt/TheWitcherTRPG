import WitcherConfigurationSheet from './WitcherConfigurationSheet.js';

export default class WitcherPropertiesConfigurationSheet extends WitcherConfigurationSheet {
    /** @override */
    static DEFAULT_OPTIONS = {
        actions: {
            addEffect: WitcherPropertiesConfigurationSheet._onAddEffect,
            removeEffect: WitcherPropertiesConfigurationSheet._oRemoveEffect
        }
    };

    static PARTS = {
        ...super.PARTS,
        damageProperties: {
            template:
                'systems/TheWitcherTRPG/templates/sheets/item/configuration/tabs/damagePropertiesConfiguration.hbs',
            scrollable: ['']
        },
        defenseProperties: {
            template:
                'systems/TheWitcherTRPG/templates/sheets/item/configuration/tabs/defensePropertiesConfiguration.hbs',
            scrollable: ['']
        },
        regionProperties: {
            template:
                'systems/TheWitcherTRPG/templates/sheets/item/configuration/tabs/regionPropertiesConfiguration.hbs',
            scrollable: ['']
        }
    };

    static TABS = {
        ...super.TABS,
        primary: {
            ...super.TABS.primary,
            tabs: [
                { id: 'general' },
                { id: 'damageProperties' },
                { id: 'defenseProperties' },
                { id: 'regionProperties' },
                { id: 'activeEffects' }
            ]
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.settings = {
            silverTrait: game.settings.get('TheWitcherTRPG', 'silverTrait')
        };

        return context;
    }

    /** @inheritdoc */
    _prepareTabs(group) {
        const tabs = super._prepareTabs(group);
        if (group === 'primary') {
            const system = this.item.system;
            if (!system.damageProperties) delete tabs.damageProperties;
            if (!system.defenseProperties) delete tabs.defenseProperties;
            if (!system.regionProperties) delete tabs.regionProperties;
        }

        return tabs;
    }

    /** @inheritdoc */
    _configureRenderParts(options) {
        const parts = super._configureRenderParts(options);

        //only add existing parts
        const system = this.item.system;
        if (!system.damageProperties && !system.causeDamages) delete parts.damageProperties;
        if (!system.defenseProperties) delete parts.defenseProperties;
        if (!system.createTemplate) delete parts.regionProperties;

        return parts;
    }

    _onChangeForm(formConfig, event) {
        super._onChangeForm(formConfig, event);
        if (event.target.dataset.action === 'editEffect') {
            this._onEditEffect(event, event.target);
        }
    }

    static async _onAddEffect(event, element) {
        event.preventDefault();
        let target = element.dataset.target;
        let id = foundry.utils.randomID();
        this.item.update({ [`${target}.${id}`]: { percentage: 0 } });
    }

    async _onEditEffect(event, element) {
        event.preventDefault();
        let id = element.closest('.list-item').dataset.id;
        let target = element.dataset.target;
        let field = element.dataset.field;
        let value = element.value;

        if (value == 'on') {
            value = element.checked;
        }

        this.item.update({ [`${target}.${id}.${field}`]: value });
    }

    static async _oRemoveEffect(event, element) {
        event.preventDefault();
        let target = element.dataset.target;
        let id = element.closest('.list-item').dataset.id;
        this.item.update({ [`${target}.-=${id}`]: null });
        //v14
        // this.item.update({ [`${target}.${id}`]: _del });
    }
}

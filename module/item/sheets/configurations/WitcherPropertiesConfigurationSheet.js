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
        let newList = this.getPathedObject(this.item, target) ?? [];
        newList.push({ percentage: 0 });
        this.item.update({ [target]: newList });
    }

    async _onEditEffect(event, element) {
        event.preventDefault();
        let itemId = element.closest('.list-item').dataset.id;
        let target = element.dataset.target;
        let field = element.dataset.field;
        let value = element.value;

        if (value == 'on') {
            value = element.checked;
        }

        let effects = this.getPathedObject(this.item, target);
        let objIndex = effects.findIndex(obj => obj.id == itemId);
        effects[objIndex][field] = value;
        this.item.update({ [target]: effects });
    }

    static async _oRemoveEffect(event, element) {
        event.preventDefault();
        let target = element.dataset.target;
        let itemId = element.closest('.list-item').dataset.id;
        let newList = this.getPathedObject(this.item, target).filter(item => item.id !== itemId);
        this.item.update({ [target]: newList });
    }

    getPathedObject(object, path) {
        path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        path = path.replace(/^\./, ''); // strip a leading dot
        var a = path.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in object) {
                object = object[k];
            } else {
                return;
            }
        }
        return object;
    }
}

import WitcherDamagePropertiesConfigurationSheet from './WitcherDamagePropertiesConfigurationSheet.js';

export default class WitcherSpellConfigurationSheet extends WitcherDamagePropertiesConfigurationSheet {
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.add-effect-self').on('click', this._onAddEffectToArray.bind(this, 'selfEffects'));
        html.find('.edit-effect-self').on('blur', this._onEditEffectOfArray.bind(this, 'selfEffects'));
        html.find('.remove-effect-self').on('click', this._oRemoveEffectFromArray.bind(this, 'selfEffects'));

        html.find('.add-effect-cast').on('click', this._onAddEffectToArray.bind(this, 'onCastEffects'));
        html.find('.edit-effect-cast').on('blur', this._onEditEffectOfArray.bind(this, 'onCastEffects'));
        html.find('.remove-effect-cast').on('click', this._oRemoveEffectFromArray.bind(this, 'onCastEffects'));
    }

    _onAddEffectToArray(array, event) {
        event.preventDefault();
        let newList = this.item.system[array] ?? [];
        newList.push({ percentage: 100 });
        this.item.update({ ['system.' + array]: newList });
    }

    _onEditEffectOfArray(array, event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.id;

        let field = element.dataset.field;
        let value = element.value;

        if (value == 'on') {
            value = element.checked;
        }

        let effects = this.item.system[array];
        let objIndex = effects.findIndex(obj => obj.id == itemId);
        effects[objIndex][field] = value;

        this.item.update({ ['system.' + array]: effects });
    }

    _oRemoveEffectFromArray(array, event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.id;
        let newList = this.item.system[array].filter(item => item.id !== itemId);
        this.item.update({ ['system.' + array]: newList });
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

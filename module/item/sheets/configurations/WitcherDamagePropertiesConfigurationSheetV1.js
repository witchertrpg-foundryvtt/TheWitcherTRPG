
import WitcherConfigurationSheetV1 from "./WitcherConfigurationSheetV1.js";

export default class WitcherDamagePropertiesConfigurationSheetV1 extends WitcherConfigurationSheetV1 {

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".add-effect-damageProperties").on("click", this._onAddEffectDamageProperties.bind(this));
        html.find(".edit-effect-damageProperties").on("blur", this._onEditEffectDamageProperties.bind(this));
        html.find(".remove-effect-damageProperties").on("click", this._oRemoveEffectDamageProperties.bind(this));
    }

    _onAddEffectDamageProperties(event) {
        event.preventDefault();
        let newList = this.item.system.damageProperties.effects ?? []
        newList.push({ percentage: 0 })
        this.item.update({ 'system.damageProperties.effects': newList });
    }

    _onEditEffectDamageProperties(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".list-item").dataset.id;

        let field = element.dataset.field;
        let value = element.value

        if (value == "on") {
            value = element.checked;
        }

        let effects = this.item.system.damageProperties.effects
        let objIndex = effects.findIndex((obj => obj.id == itemId));
        effects[objIndex][field] = value

        this.item.update({ 'system.damageProperties.effects': effects });

    }

    _oRemoveEffectDamageProperties(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".list-item").dataset.id;
        let newList = this.item.system.damageProperties.effects.filter(item => item.id !== itemId)
        this.item.update({ 'system.damageProperties.effects': newList });
    }

    getPathedObject(object, path) {
        path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        path = path.replace(/^\./, '');           // strip a leading dot
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
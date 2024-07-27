
import { genId } from "../../../scripts/helper.js";
import WitcherDamagePropertiesConfigurationSheet from "./WitcherDamagePropertiesConfigurationSheet.js";

export default class WitcherSpellConfigurationSheet extends WitcherDamagePropertiesConfigurationSheet {


    activateListeners(html) {
        super.activateListeners(html);
        html.find(".add-effect-self").on("click", this._onAddEffectSelf.bind(this));
        html.find(".edit-effect-self").on("blur", this._onEditEffectSelf.bind(this));
        html.find(".remove-effect-self").on("click", this._oRemoveEffectSelf.bind(this));
    }

    _onAddEffectSelf(event) {
        event.preventDefault();
        let newList = this.item.system.selfEffects ?? []
        newList.push({ id: genId(), percentage: 100 })
        this.item.update({ 'system.selfEffects': newList });
    }

    _onEditEffectSelf(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".list-item").dataset.id;

        let field = element.dataset.field;
        let value = element.value

        if (value == "on") {
            value = element.checked;
        }

        let effects = this.item.system.selfEffects
        let objIndex = effects.findIndex((obj => obj.id == itemId));
        effects[objIndex][field] = value

        this.item.update({ 'system.selfEffects': effects });

    }

    _oRemoveEffectSelf(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".list-item").dataset.id;
        let newList = this.item.system.selfEffects.filter(item => item.id !== itemId)
        this.item.update({ 'system.selfEffects': newList });
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
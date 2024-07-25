
import { genId } from "../../scripts/helper.js";
import WitcherItemSheet from "./WitcherItemSheet.js";

export default class WitcherArmorSheet extends WitcherItemSheet {


    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/armor-sheet.hbs`;
    }

    /** @override */
    getData() {
        const data = super.getData();

        data.config.Availability.WITCHER = "WITCHER.Item.AvailabilityWitcher";
        data.config.type = this.getTypes();
        data.config.armorLocations = this.getArmorLocations();

        return data;
    }

    getTypes() {
        return {
            Light: "WITCHER.Armor.Light",
            Medium: "WITCHER.Armor.Medium",
            Heavy: "WITCHER.Armor.Heavy",
            Natural: "WITCHER.Armor.Natural",
        }
    }

    getArmorLocations() {
        return {
            Head: "WITCHER.Armor.LocationHead",
            Torso: "WITCHER.Armor.LocationTorso",
            Leg: "WITCHER.Armor.LocationLeg",
            FullCover: "WITCHER.Armor.LocationFull",
            Shield: "WITCHER.Armor.LocationShield",
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".add-effect").on("click", this._onAddEffect.bind(this));
        html.find(".edit-effect").on("blur", this._onEditEffect.bind(this));
        html.find(".remove-effect").on("click", this._oRemoveEffect.bind(this));

    }

    _onAddEffect(event) {
        event.preventDefault();
        let newList = this.item.system.effects ?? []
        newList.push({ id: genId(), percentage: 100 })
        this.item.update({ 'system.effects': newList });
    }

    _onEditEffect(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".list-item").dataset.id;

        let field = element.dataset.field;
        let value = element.value

        if (value == "on") {
            value = element.checked;
        }

        let effects = this.item.system.effects
        let objIndex = effects.findIndex((obj => obj.id == itemId));
        effects[objIndex][field] = value

        this.item.update({ 'system.effects': effects });

    }

    _oRemoveEffect(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".list-item").dataset.id;
        let newList = this.item.system.effects.filter(item => item.id !== itemId)
        this.item.update({ 'system.effects': newList });
    }
}
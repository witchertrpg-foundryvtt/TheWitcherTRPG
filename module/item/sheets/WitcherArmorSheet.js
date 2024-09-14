
import WitcheActiveEffectConfigurationSheet from "./configurations/WitcherActiveEffectConfigurationSheet.js";
import WitcherItemSheet from "./WitcherItemSheet.js";

export default class WitcherArmorSheet extends WitcherItemSheet {

    configuration = new WitcheActiveEffectConfigurationSheet(this.item);


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
}
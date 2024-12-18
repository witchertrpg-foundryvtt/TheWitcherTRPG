
import WitcherConfigurationSheet from "./configurations/WitcherConfigurationSheet.js";
import WitcherItemSheet from "./WitcherItemSheet.js";

export default class WitcherRitualSheet extends WitcherItemSheet {

    configuration = new WitcherConfigurationSheet(this.item);

    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/ritual-sheet.hbs`;
    }

    /** @override */
    getData() {
        const data = super.getData();

        data.selects = this.createSelects();

        return data;
    }

    createSelects() {
        return {
            levelSpell: {
                novice: "WITCHER.Spell.Novice",
                journeyman: "WITCHER.Spell.Journeyman",
                master: "WITCHER.Spell.Master"
            },
            templateType: {
                rect: "WITCHER.Spell.Square",
                circle: "WITCHER.Spell.Circle",
                cone: "WITCHER.Spell.Cone",
                ray: "WITCHER.Spell.Ray",
            }
        }
    }
}
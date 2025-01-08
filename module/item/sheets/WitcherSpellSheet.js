
import WitcherSpellConfigurationSheet from "./configurations/WitcherSpellConfigurationSheet.js";
import WitcherItemSheet from "./WitcherItemSheet.js";

export default class WitcherSpellSheet extends WitcherItemSheet {

    configuration = new WitcherSpellConfigurationSheet(this.item);


    /** @inheritdoc */
    _canDragDrop(selector) {
        return true;
    }

    /** @override */
    getData() {
        const data = super.getData();

        data.selects = this.createSelects();

        return data;
    }

    createSelects() {
        return {
            class: {
                Spells: "WITCHER.Spell.Spells",
                Invocations: "WITCHER.Spell.Invocations",
                Witcher: "WITCHER.Spell.Witcher",
                MagicalGift: "WITCHER.Spell.MagicalGift",
            },
            levelSpell: {
                novice: "WITCHER.Spell.Novice",
                journeyman: "WITCHER.Spell.Journeyman",
                master: "WITCHER.Spell.Master"
            },
            levelMagicalGift: {
                "minor gift": "WITCHER.Spell.MinorGift",
                "major gift": "WITCHER.Spell.MajorGift"
            },
            sourceElements: {
                mixedElements: "WITCHER.Spell.Mixed",
                earth: "WITCHER.Spell.Earth",
                air: "WITCHER.Spell.Air",
                fire: "WITCHER.Spell.Fire",
                Water: "WITCHER.Spell.Water",
            },
            sourceClass: {
                druid: "WITCHER.Spell.Druid",
                preacher: "WITCHER.Spell.Preacher",
                "arch priest": "WITCHER.Spell.Archpriest",
            },
            domain: {
                basic: "WITCHER.Spell.Basic",
                alternate: "WITCHER.Spell.Alt",
            },
            templateType: {
                rect: "WITCHER.Spell.Square",
                circle: "WITCHER.Spell.Circle",
                cone: "WITCHER.Spell.Cone",
                ray: "WITCHER.Spell.Ray",
            }
        }
    }

    async _onDrop(event) {
        const data = TextEditor.getDragEventData(event);
        // Handle different data types
        switch (data.type) {
            case "Item":
                return this._onDropItem(event, data);
        }
    }

    async _onDropItem(event, data) {

        let item = fromUuidSync(data.uuid)

        if (item.type != "globalModifier") return;

        let globalModifiers = this.item.system.globalModifiers
        globalModifiers.push(item.name)

        this.item.update({ 'system.globalModifiers': globalModifiers })

    }
}
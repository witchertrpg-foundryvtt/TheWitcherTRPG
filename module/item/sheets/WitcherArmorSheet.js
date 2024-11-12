import WitcherConfigurationSheet from './configurations/WitcherConfigurationSheet.js';
import WitcherItemSheet from './WitcherItemSheet.js';
import { associatedDiagramMixin } from '../../actor/sheets/mixins/associatedDiagramMixin.js';

export default class WitcherArmorSheet extends WitcherItemSheet {
    configuration = new WitcherConfigurationSheet(this.item);

    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/armor-sheet.hbs`;
    }

    /** @inheritdoc */
    _canDragStart(selector) {
        return true
    }

    /** @inheritdoc */
    _canDragDrop(selector) {
        return true
    }

    activateListeners(html) {
        this._addAssociatedDiagramListeners(html)
    }

    /** @override */
    getData() {
        const data = super.getData();

        data.config.Availability.WITCHER = 'WITCHER.Item.AvailabilityWitcher';
        data.config.type = this.getTypes();
        data.config.armorLocations = this.getArmorLocations();

        return data;
    }

    getTypes() {
        return {
            Light: 'WITCHER.Armor.Light',
            Medium: 'WITCHER.Armor.Medium',
            Heavy: 'WITCHER.Armor.Heavy',
            Natural: 'WITCHER.Armor.Natural'
        };
    }

    getArmorLocations() {
        return {
            Head: 'WITCHER.Armor.LocationHead',
            Torso: 'WITCHER.Armor.LocationTorso',
            Leg: 'WITCHER.Armor.LocationLeg',
            FullCover: 'WITCHER.Armor.LocationFull',
            Shield: 'WITCHER.Armor.LocationShield'
        };
    }

    async _onDrop(event) {
        this._onDropDiagram(event, 'armor', 'elderfolk-armor')
    }
}

Object.assign(WitcherArmorSheet.prototype, associatedDiagramMixin)
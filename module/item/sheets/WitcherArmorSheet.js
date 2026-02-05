import WitcherPropertiesConfigurationSheet from './configurations/WitcherPropertiesConfigurationSheet.js';
import WitcherItemSheet from './WitcherItemSheet.js';
import { associatedDiagramMixin } from './mixins/associatedDiagramMixin.js';

export default class WitcherArmorSheet extends WitcherItemSheet {
    configuration = new WitcherPropertiesConfigurationSheet({ document: this.item });

    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/armor-sheet.hbs`,
            scrollable: ['']
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        context.config.Availability.WITCHER = 'WITCHER.Item.AvailabilityWitcher';
        context.config.type = this.getTypes();
        context.config.armorLocations = this.getArmorLocations();

        return context;
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

    activateListeners(html) {
        super.activateListeners(html);
        this._addAssociatedDiagramListeners(html);
    }

    async _onDropItem(event, item) {
        this._onDropDiagram(event, item, 'armor', 'elderfolk-armor');
    }
}

Object.assign(WitcherArmorSheet.prototype, associatedDiagramMixin);

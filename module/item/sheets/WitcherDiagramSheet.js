import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherDiagramSheet extends WitcherItemSheet {
    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/diagrams-sheet.hbs`,
            scrollable: ['']
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        context.knownCraftingComponents = context.item.system.craftingComponents
            .filter(component => component.uuid)
            .map(component => {
                return { id: component.id, ...fromUuidSync(component.uuid), quantity: component.quantity } ?? component;
            });
        context.unknownCraftingComponents = context.item.system.craftingComponents.filter(component => !component.uuid);

        context.selects = this.createSelects();

        return context;
    }

    createSelects() {
        return {
            formulaTypes: {
                alchemical: 'WITCHER.Alchemy.Alchemical',
                potion: 'WITCHER.Alchemy.Potion',
                decoction: 'WITCHER.Alchemy.Decoction',
                oil: 'WITCHER.Alchemy.Oil'
            },
            diagramTypes: {
                'ingredients': 'WITCHER.Diagram.Ingredient',
                'weapon': 'WITCHER.Diagram.Weapon',
                'armor': 'WITCHER.Diagram.Armor',
                'armor-enhancement': 'WITCHER.Diagram.ArmorEnhancement',
                'elderfolk-weapon': 'WITCHER.Diagram.ElderFolkWeapon',
                'elderfolk-armor': 'WITCHER.Diagram.ElderFolkArmor',
                'ammunition': 'WITCHER.Diagram.Ammunition',
                'bomb': 'WITCHER.Diagram.Bomb',
                'traps': 'WITCHER.Diagram.Traps'
            }
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.querySelectorAll('.add-component').forEach(input =>
            input.addEventListener('click', this._onAddComponent.bind(this))
        );
        html.querySelectorAll('.edit-component').forEach(input =>
            input.addEventListener('blur', this._onEditComponent.bind(this))
        );
        html.querySelectorAll('.remove-component').forEach(input =>
            input.addEventListener('click', this._onRemoveComponent.bind(this))
        );
        html.querySelectorAll('.remove-associated-item').forEach(input =>
            input.addEventListener('click', this._onRemoveAssociatedItem.bind(this))
        );
    }

    async _onDropItem(event, item) {
        if (item) {
            if (event.target.offsetParent.dataset.type == 'associatedItem') {
                this.item.update({ 'system.associatedItemUuid': item.uuid });
            } else {
                let newComponentList = this.item.system.craftingComponents ?? [];
                newComponentList.push({ name: item.name, quantity: 1, uuid: item.uuid });
                this.item.update({ 'system.craftingComponents': newComponentList });
            }
        }
    }

    _onEditComponent(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.id;

        let field = element.dataset.field;
        let value = element.value;

        let components = this.item.system.craftingComponents;
        let objIndex = components.findIndex(obj => obj.id == itemId);
        components[objIndex][field] = value;
        this.item.update({ 'system.craftingComponents': components });
    }

    _onAddComponent(event) {
        event.preventDefault();
        let newComponentList = this.item.system.craftingComponents ?? [];
        newComponentList.push({ name: 'component', quantity: '' });
        this.item.update({ 'system.craftingComponents': newComponentList });
    }

    _onRemoveComponent(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.id;
        let newComponentList = this.item.system.craftingComponents.filter(item => item.id !== itemId);
        this.item.update({ 'system.craftingComponents': newComponentList });
    }

    async _onRemoveAssociatedItem(event) {
        event.preventDefault();
        this.item.update({ 'system.associatedItemUuid': '' });
    }
}

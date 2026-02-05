
import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherContainerSheet extends WitcherItemSheet {
    storableItems = [
        'weapon',
        'armor',
        'enhancement',
        'valuable',
        'alchemical',
        'component',
        'diagrams',
        'mutagen',
        'container'
    ];

    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/container-sheet.hbs`,
            scrollable: ['']
        }
    };

    _onRender(context, options) {
        super._onRender(context, options);

        this.element
            .querySelectorAll('.remove-item')
            .forEach(input => input.addEventListener('click', this._onRemoveItem.bind(this)));
    }

    async _onDropItem(event, item) {
        if (item && this.storableItems.includes(item.type) && !this.item.system.content.includes(item.uuid)) {
            this.item.system.content.push(item.uuid);
            this.item.update({ 'system.content': this.item.system.content });
            item.update({ 'system.isStored': true });
        }
    }

    _onRemoveItem(event) {
        event.preventDefault();
        let uuid = event.currentTarget.dataset.uuid;

        const index = this.item.system.content.indexOf(uuid);
        if (index > -1) {
            // only splice array when item is found
            this.item.system.content.splice(index, 1); // 2nd parameter means remove one item only
        }

        let item = fromUuidSync(uuid);
        this.item.update({ 'system.content': this.item.system.content });
        item.update({ 'system.isStored': false });
    }
}
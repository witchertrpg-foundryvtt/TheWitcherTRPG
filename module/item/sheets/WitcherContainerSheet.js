
import WitcherItemSheetV1 from './WitcherItemSheetV1.js';

export default class WitcherContainerSheet extends WitcherItemSheetV1 {
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

    activateListeners(html) {
        super.activateListeners(html);
        html.find('.remove-item').on('click', this._onRemoveItem.bind(this));
    }

    /** @inheritdoc */
    _canDragDrop(selector) {
        return true;
    }

    async _onDrop(event) {
        let dragEventData = TextEditor.getDragEventData(event);
        let item = fromUuidSync(dragEventData.uuid);

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
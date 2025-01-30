import WitcherConfigurationSheet from './configurations/WitcherConfigurationSheet.js';
import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherRitualSheet extends WitcherItemSheet {
    configuration = new WitcherConfigurationSheet(this.item);

    /** @inheritdoc */
    _canDragStart(selector) {
        return true;
    }

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
            levelSpell: {
                novice: 'WITCHER.Spell.Novice',
                journeyman: 'WITCHER.Spell.Journeyman',
                master: 'WITCHER.Spell.Master'
            },
            templateType: {
                rect: 'WITCHER.Spell.Square',
                circle: 'WITCHER.Spell.Circle',
                cone: 'WITCHER.Spell.Cone',
                ray: 'WITCHER.Spell.Ray'
            }
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.edit-component').on('blur', this._onEditComponent.bind(this));
        html.find('.remove-component').on('click', this._onRemoveComponent.bind(this));
    }

    async _onDrop(event) {
        let dragEventData = TextEditor.getDragEventData(event);
        let item = await fromUuid(dragEventData.uuid);

        if (item) {
            if (event.target.closest('.alternateComponents')) {
                let newComponentList = this.item.system.alternateRitualComponentUuids ?? [];
                newComponentList.push({ uuid: item.uuid, quantity: 1 });
                this.item.update({ 'system.alternateRitualComponentUuids': newComponentList });
            } else {
                let newComponentList = this.item.system.ritualComponentUuids ?? [];
                newComponentList.push({ uuid: item.uuid, quantity: 1 });
                this.item.update({ 'system.ritualComponentUuids': newComponentList });
            }
        }
    }

    _onEditComponent(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.uuid;
        let targetField = element.closest('.list-item').dataset.target;

        let field = element.dataset.field;
        let value = element.value;

        let components = this.item.system[targetField];
        let objIndex = components.findIndex(obj => obj.uuid == itemId);
        components[objIndex][field] = value;
        this.item.update({ [`system.${targetField}`]: components });
    }

    _onRemoveComponent(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.uuid;
        let targetField = element.closest('.list-item').dataset.target;
        let newComponentList = this.item.system[targetField].filter(item => item.uuid !== itemId);
        this.item.update({ [`system.${targetField}`]: newComponentList });
    }
}

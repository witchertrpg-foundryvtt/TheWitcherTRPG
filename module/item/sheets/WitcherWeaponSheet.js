import WitcherDamagePropertiesConfigurationSheet from './configurations/WitcherDamagePropertiesConfigurationSheet.js';
import WitcherItemSheet from './WitcherItemSheet.js';
import { associatedDiagramMixin } from './mixins/associatedDiagramMixin.js';

export default class WitcherWeaponSheet extends WitcherItemSheet {
    configuration = new WitcherDamagePropertiesConfigurationSheet(this.item);

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

        data.config.attackSkills = [
            ...new Set(
                CONFIG.WITCHER.meleeSkills
                    .concat(CONFIG.WITCHER.rangedSkills)
                    .map(skill => CONFIG.WITCHER.skillMap[skill])
            )
        ];

        this.createAttackOptions(data);

        return data;
    }

    createAttackOptions(data) {
        data.config.meleeAttackOptions = CONFIG.WITCHER.meleeSkills.map(skill => {
            return {
                value: skill,
                label: CONFIG.WITCHER.skillMap[skill].label
            };
        });

        data.config.rangedAttackOptions = CONFIG.WITCHER.rangedSkills.map(skill => {
            return {
                value: skill,
                label: CONFIG.WITCHER.skillMap[skill].label
            };
        });
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.damage-type').on('change', this._onDamageTypeEdit.bind(this));

        this._addAssociatedDiagramListeners(html);
    }

    _onDamageTypeEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let newval = Object.assign({}, this.item.system.type);
        newval[element.id] = !newval[element.id];
        let types = [];
        if (newval.slashing) types.push(game.i18n.localize('WITCHER.DamageType.slashing'));
        if (newval.piercing) types.push(game.i18n.localize('WITCHER.DamageType.piercing'));
        if (newval.bludgeoning) types.push(game.i18n.localize('WITCHER.DamageType.bludgeoning'));
        if (newval.elemental) types.push(game.i18n.localize('WITCHER.DamageType.elemental'));
        newval.text = types.join(', ');
        this.item.update({ 'system.type': newval });
    }

    async _onDrop(event) {
        this._onDropDiagram(event, 'weapon', 'elderfolk-weapon');
    }
}

Object.assign(WitcherWeaponSheet.prototype, associatedDiagramMixin);

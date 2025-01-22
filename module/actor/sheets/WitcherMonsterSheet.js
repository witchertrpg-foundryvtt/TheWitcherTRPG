import WitcherActorConfigurationSheet from './configurations/WitcherActorConfigurationSheet.js';
import WitcherActorSheet from './WitcherActorSheet.js';

const DialogV2 = foundry.applications.api.DialogV2;

export default class WitcherMonsterSheet extends WitcherActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['witcher', 'sheet', 'actor'],
            width: 1120,
            height: 600,
            template: 'systems/TheWitcherTRPG/templates/sheets/actor/actor-sheet.hbs',
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' }]
        });
    }

    configuration = new WitcherActorConfigurationSheet(this.actor);

    getData() {
        let context = super.getData();
        this._prepareLoot(context);
        this._prepareCharacterData(context);
        return context;
    }

    _prepareCharacterData(context) {
        let actor = context.actor;
        context.profession = actor.getList('profession')[0];
    }

    _prepareLoot(context) {
        let items = context.items;
        context.loots = items.filter(
            i =>
                i.type == 'component' ||
                i.type == 'crafting-material' ||
                i.type == 'container' ||
                i.type == 'enhancement' ||
                i.type == 'valuable' ||
                i.type == 'animal-parts' ||
                i.type == 'diagrams' ||
                i.type == 'alchemical' ||
                i.type == 'enhancement' ||
                i.type == 'mutagen'
        );
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.export-loot').on('click', this.exportLoot.bind(this));
    }

    async getOrCreateFolder() {
        let folderName = `${game.i18n.localize('WITCHER.Loot.Name')}`;
        let type = CONST.FOLDER_DOCUMENT_TYPES[0]; //actor
        let folder = game.folders?.find(folder => folder.type == type && folder.name === folderName);
        if (!folder) {
            folder = await Folder.create({
                name: folderName,
                sorting: 'a',
                content: [],
                type: type,
                parent: null
            });
        }
        return folder ? (folder[0] ? folder[0] : folder) : null;
    }

    async exportLoot() {
        let content = `${game.i18n.localize('WITCHER.Loot.MultipleExport')} <input type="number" class="small" name="multiple" value=1><br />`;

        let multiplier = await DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.Monster.exportLoot')}` },
            content: content,
            modal: true,
            ok: {
                callback: (event, button, dialog) => button.form.elements.multiple.value
            }
        });

        let folder = await this.getOrCreateFolder();
        let newLoot = await Actor.create({
            ...this.actor.toObject(),
            type: 'loot',
            name: this.actor.name + '--' + `${game.i18n.localize('WITCHER.Loot.Name')}`,
            folder: folder?.id
        });

        newLoot.items.forEach(async item => {
            let newQuantity = item.system.quantity;
            if (typeof newQuantity === 'string' && item.system.quantity.includes('d')) {
                let total = 0;
                for (let i = 0; i < multiplier; i++) {
                    let roll = await new Roll(item.system.quantity).evaluate({ async: true });
                    total += Math.ceil(roll.total);
                }
                newQuantity = total;
            } else {
                newQuantity = Number(newQuantity) * multiplier;
            }

            let itemGeneratedFromRollTable = await item.checkIfItemHasRollTable(newQuantity);

            if (!itemGeneratedFromRollTable) {
                item.update({ 'system.quantity': newQuantity });
            }
        });

        await newLoot.sheet.render(true);
    }
}

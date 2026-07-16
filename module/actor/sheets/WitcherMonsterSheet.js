import WitcherMonsterConfigurationSheet from './configurations/WitcherMonsterConfigurationSheet.js';
import WitcherActorSheet from './WitcherActorSheet.js';
import WitcherModifiersConfiguration from '../../actor/sheets/configurations/WitcherModifiersConfiguration.js';

const DialogV2 = foundry.applications.api.DialogV2;

export default class WitcherMonsterSheet extends WitcherActorSheet {
    /** @override */
    static DEFAULT_OPTIONS = {
        position: {
            width: 900,
            height: 800
        },
        classes: ['witcher', 'sheet', 'monster'],
        actions: {
            openModifiers: this.#openModifiers,
            exportLoot: this.#exportLoot,
        }
    };

    static PARTS = {
        sidebar: {
            template: 'systems/TheWitcherTRPG/templates/sheets/actor/partials/monster/sidebar.hbs'
        },
        header: {
            template: 'systems/TheWitcherTRPG/templates/sheets/actor/partials/monster/header.hbs'
        },
        tabs: {
            // Foundry-provided generic template
            template: 'templates/generic/tab-navigation.hbs'
        },
        stats: {
            template: 'systems/TheWitcherTRPG/templates/partials/character/tab-stats.hbs',
            scrollable: ['']
        },
        skills: {
            template: 'systems/TheWitcherTRPG/templates/partials/character/tab-skills.hbs',
            scrollable: ['']
        },
        profession: {
            template: 'systems/TheWitcherTRPG/templates/sheets/actor/partials/monster/tabs/tab-profession.hbs',
            scrollable: ['']
        },
        inventory: {
            template: 'systems/TheWitcherTRPG/templates/sheets/actor/partials/monster/tabs/tab-inventory.hbs',
            scrollable: ['']
        },
        details: {
            template: 'systems/TheWitcherTRPG/templates/sheets/actor/partials/monster/tabs/tab-details.hbs',
            scrollable: ['']
        },
        magic: {
            template: 'systems/TheWitcherTRPG/templates/partials/character/tab-magic.hbs',
            scrollable: ['']
        },
        effects: {
            template: 'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/tab-effects.hbs',
            scrollable: ['']
        }
    }

    static TABS = {
        primary: {
            tabs: [
                { id: 'stats', cssClass: 'stats', label: 'WITCHER.Monster.SkillTab' },
                { id: 'skills', cssClass: 'skills', label: 'WITCHER.Actor.tabs.skills' },
                { id: 'profession', cssClass: 'profession', label: 'WITCHER.Profession' },
                { id: 'inventory', cssClass: 'inventory', label: 'WITCHER.Monster.InventoryTab' },
                { id: 'details', cssClass: 'details', label: 'WITCHER.Monster.DetailsTab' },
                { id: 'magic', cssClass: 'magic', label: 'WITCHER.Monster.SpellsTab' },
                { id: 'effects', cssClass: 'effects', label: 'WITCHER.activeEffect.tab' }
            ],
            initial: 'stats',
        },
        skillTabs: {
            tabs: [
                { id: 'all', cssClass: 'all', label: 'WITCHER.Button.All' },
                { id: 'int', cssClass: 'int', label: 'WITCHER.Actor.Stat.Int' },
                { id: 'ref', cssClass: 'ref', label: 'WITCHER.Actor.Stat.Ref' },
                { id: 'dex', cssClass: 'dex', label: 'WITCHER.Actor.Stat.Dex' },
                { id: 'body', cssClass: 'body', label: 'WITCHER.Actor.Stat.Body' },
                { id: 'emp', cssClass: 'emp', label: 'WITCHER.Actor.Stat.Emp' },
                { id: 'cra', cssClass: 'cra', label: 'WITCHER.Actor.Stat.Cra' },
                { id: 'will', cssClass: 'will', label: 'WITCHER.Actor.Stat.Will' },
                { id: 'ip', cssClass: 'ip', label: 'WITCHER.Actor.rewards.ip' }
            ],
            initial: 'all'
        },
        magicTabs: {
            tabs: [
                { id: 'all', cssClass: 'all', label: 'WITCHER.Button.All' },
                { id: 'magic', cssClass: 'magic', label: 'WITCHER.Actor.tabs.magic' },
                { id: 'rituals', cssClass: 'rituals', label: 'WITCHER.Spell.Rituals' },
                { id: 'hexes', cssClass: 'hexes', label: 'WITCHER.Spell.Hexes' },
                { id: 'magicalGift', cssClass: 'magicalGift', label: 'WITCHER.Spell.MagicalGift' },
                { id: 'focus', cssClass: 'focus', label: 'WITCHER.Actor.focus.name' }
            ],
            initial: 'all'
        },
        detailTabs: {
            tabs: [
                { id: 'notes', cssClass: 'notes', label: 'WITCHER.Notes' },
                { id: 'lore', cssClass: 'lore', label: 'WITCHER.skills.monsterLore.rollLabel' },
            ],
            initial: 'notes'
        }
    };

    configuration = new WitcherMonsterConfigurationSheet({ document: this.actor });

    async _prepareContext(options) {
        let context = await super._prepareContext(options);

        this._prepareCharacterData(context);
        this._prepareLoot(context);

        context.tabs = this._prepareTabs('primary');
        context.skillTabs = this._prepareTabs('skillTabs');
        context.magicTabs = this._prepareTabs('magicTabs');
        context.detailTabs = this._prepareTabs('detailTabs');

        context.systemFields = this.document.system.schema.fields;
        context.enrichedText = {
            ...context.enrichedText,
            ...(await this.document.system.enrichedText())
        };

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

    static async #exportLoot() {
        let content = `${game.i18n.localize('WITCHER.Loot.MultipleExport')} <input type="number" class="small" name="multiple" value=1><br />`;

        let multiplier = await DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.Monster.exportLoot')}` },
            content: content,
            modal: true,
            ok: {
                callback: (event, button, dialog) => button.form.elements.multiple.value
            },
            rejectClose: true
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

    static async #openModifiers(_, target) {
        _.preventDefault();
        const type = target.dataset.type;
        const skillKey = target.dataset.skillKey;

        new WitcherModifiersConfiguration({
            document: this.document,
            skillKey: skillKey,
            type: type
        })?.render(true);
    }
}

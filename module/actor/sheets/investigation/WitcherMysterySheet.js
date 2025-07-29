import { rollClue } from '../../../scripts/investigation/rollClue.js';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export default class WitcherMysterySheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        position: {
            width: 1120,
            height: 600
        },
        classes: ['witcher', 'sheet', 'actor'],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            addItem: WitcherMysterySheet._onItemAdd,
            editItem: WitcherMysterySheet._onItemEdit,
            deleteItem: WitcherMysterySheet._onItemDelete,
            hideItem: WitcherMysterySheet._onItemHide,
            rollClue: WitcherMysterySheet._onRollClue
        }
    };

    static PARTS = {
        header: {
            template: 'systems/TheWitcherTRPG/templates/sheets/investigation/mystery-sheet.hbs'
        }
    };

    static TABS = {};

    /** @override */
    async _prepareContext(options) {
        let context = await super._prepareContext(options);

        const actorData = this.document.toObject(false);
        context.actor = this.document;
        context.system = actorData.system;

        context.clues = context.actor.getList('clue');
        context.obstacles = context.actor.getList('obstacle');

        context.isGM = game.user.isGM;
        context.skills = CONFIG.WITCHER.skillMap;

        return context;
    }

    _onRender(context, options) {
        super._onRender(context, options);

        this.element
            .querySelectorAll('.inline-edit')
            .forEach(input => input.addEventListener('change', this._onInlineEdit.bind(this)));
    }

    static async _onItemAdd(event, element) {
        event.preventDefault();
        let itemData = {
            name: `new ${element.dataset.itemtype}`,
            type: element.dataset.itemtype
        };

        await Item.create(itemData, { parent: this.actor });
    }

    static _onItemEdit(event, element) {
        event.preventDefault();
        let itemId = element.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);

        item.sheet.render(true);
    }

    static async _onItemDelete(event, element) {
        event.preventDefault();
        let itemId = element.closest('.item').dataset.itemId;
        return await this.actor.items.get(itemId).delete();
    }

    static _onItemHide(event, element) {
        event.preventDefault();
        let itemId = element.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        item.update({ 'system.isHidden': !item.system.isHidden });
    }

    _onInlineEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        let field = element.dataset.field;
        // Edit checkbox values
        let value = element.value;
        if (value == 'false') {
            value = true;
        }
        if (value == 'true' || value == 'checked') {
            value = false;
        }

        return item.update({ [field]: value });
    }

    static _onRollClue(event, element) {
        let clueId = element.closest('.item').dataset.itemId;
        let clue = this.actor.items.get(clueId);

        rollClue(clue);
    }
}

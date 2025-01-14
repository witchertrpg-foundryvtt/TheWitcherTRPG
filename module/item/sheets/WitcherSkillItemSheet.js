export default class WitcherSkillItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['witcher', 'sheet', 'item'],
            width: 520,
            height: 480,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'data' }]
        });
    }

    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/item/skill-item-sheet.hbs`;
    }

    /** @override */
    getData() {
        const data = super.getData();

        var filteredStats = Object.keys(CONFIG.WITCHER.statMap).reduce(function (r, index) {
            if (CONFIG.WITCHER.statMap[index].origin === 'stats') {
                r[index] = CONFIG.WITCHER.statMap[index];
            }
            return r;
        }, {});
        data.stats = filteredStats;

        this.options.classes.push(`item-skill`);
        data.system = data.item?.system;

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('input').focusin(ev => this._onFocusIn(ev));
    }

    _onFocusIn(event) {
        event.currentTarget.select();
    }
}

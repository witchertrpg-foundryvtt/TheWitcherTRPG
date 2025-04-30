export default class WitcherActorConfigurationSheet extends foundry.appv1.sheets.ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 520,
            height: 480,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body' }]
        });
    }

    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/actor/configuration/${this.object.type}Configuration.hbs`;
    }

    /** @override */
    getData() {
        const context = super.getData();
        context.config = CONFIG.WITCHER;
        context.config.statLabels = Object.keys(CONFIG.WITCHER.statMap).reduce((obj, stat) => {
            obj[stat] = CONFIG.WITCHER.statMap[stat].label ?? CONFIG.WITCHER.statMap[stat].labelShort;
            return obj;
        }, {});

        context.system = context.actor?.system;

        context.systemFields = this.actor.system.schema.fields;
        context.skillConfig = this._getSkills();

        return context;
    }

    /**
     * Constructs a record of valid skills and their associated field
     * @returns {Record<string, {field: NumberField, value: number}>}
     */
    _getSkills() {
        const data = this.actor;

        let skills = Object.keys(CONFIG.WITCHER.statMap)
            .filter(stat => CONFIG.WITCHER.statMap[stat].origin === 'stats')
            .reduce((attrObj, attr) => {
                attrObj[attr] = Object.keys(CONFIG.WITCHER.skillMap)
                    .filter(skill => CONFIG.WITCHER.skillMap[skill].attribute.name == attr)
                    .reduce((obj, skill) => {
                        let attribute = CONFIG.WITCHER.skillMap[skill].attribute.name;
                        obj[skill] = {
                            isVisible: this.actor.system.schema.getField(['skills', attribute, skill, 'isVisible']),
                            isVisibleValue: foundry.utils.getProperty(
                                data,
                                `system.skills.${attribute}.${skill}.isVisible`
                            )
                        };
                        return obj;
                    }, {});
                return attrObj;
            }, {});

        Object.keys(skills).forEach(skill => Object.keys(skills[skill]).length === 0 && delete skills[skill]);

        return skills;
    }
}

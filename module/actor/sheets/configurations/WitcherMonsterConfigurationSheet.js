const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export default class WitcherMonsterConfigurationSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        position: {
            width: 520,
            height: 480
        },
        classes: ['witcher', 'sheet', 'actor'],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        }
    };

    static PARTS = {
        header: {
            template: `systems/TheWitcherTRPG/templates/sheets/actor/configuration/monster/header.hbs`
        },
        tabs: {
            // Foundry-provided generic template
            template: 'templates/generic/tab-navigation.hbs'
        },
        general: {
            template: `systems/TheWitcherTRPG/templates/sheets/actor/configuration/monster/general.hbs`,
            scrollable: ['']
        },
        skills: {
            template: 'systems/TheWitcherTRPG/templates/sheets/actor/configuration/partials/skillConfiguration.hbs',
            scrollable: ['']
        }
    };

    static TABS = {
        primary: {
            tabs: [{ id: 'general' }, { id: 'skills' }],
            initial: 'general',
            labelPrefix: 'WITCHER.Actor.settings'
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.config = CONFIG.WITCHER;
        context.config.statLabels = Object.keys(CONFIG.WITCHER.statMap).reduce((obj, stat) => {
            obj[stat] = CONFIG.WITCHER.statMap[stat].label ?? CONFIG.WITCHER.statMap[stat].labelShort;
            return obj;
        }, {});

        context.system = this.document.system;

        context.systemFields = this.document.system.schema.fields;
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

import { deathsaveMixin } from './mixins/deathSaveMixin.js';
import { criticalWoundMixin } from './mixins/criticalWoundMixin.js';
import { noteMixin } from './mixins/noteMixin.js';
import { skillModifierMixin } from './mixins/skillModifierMixin.js';
import { skillMixin } from './mixins/skillMixin.js';
import { statMixin } from './mixins/statMixin.js';
import { itemMixin } from './mixins/itemMixin.js';
import { healMixin } from './mixins/healMixin.js';

import { itemContextMenu } from './interactions/itemContextMenu.js';
import { activeEffectMixin } from './mixins/activeEffectMixin.js';
import { customSkillMixin } from './mixins/customSkillMixin.js';
import ChatMessageData from '../../chatMessage/chatMessageData.js';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

Array.prototype.sum = function (prop) {
    var total = 0;
    for (var i = 0; i < this.length; i++) {
        if (this[i].system[prop]) {
            total += Number(this[i].system[prop]);
        } else if (this[i].system?.system[prop]) {
            total += Number(this[i].system?.system[prop]);
        }
    }
    return total;
};

Array.prototype.cost = function () {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
        if (this[i].system.cost && this[i].system.quantity) {
            total += Number(this[i].system.quantity) * Number(this[i].system.cost);
        }
    }
    return Math.ceil(total);
};

export default class WitcherActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    statMap = CONFIG.WITCHER.statMap;
    skillMap = CONFIG.WITCHER.skillMap;

    uniqueTypes = ['profession', 'race', 'homeland'];

    //overwrite in sub-classes
    configuration = undefined;

    /** @override */
    static DEFAULT_OPTIONS = {
        window: {
            resizable: true
        },
        position: {
            width: 800
        },
        classes: ['witcher', 'sheet', 'actor'],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        }
    };

    /** @override */
    async _prepareContext(options) {
        let context = await super._prepareContext(options);

        context.useAdrenaline = game.settings.get('TheWitcherTRPG', 'useOptionalAdrenaline');
        context.displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');
        context.useVerbalCombat = game.settings.get('TheWitcherTRPG', 'useOptionalVerbalCombat');
        context.displayRep = game.settings.get('TheWitcherTRPG', 'displayRep');

        context.config = CONFIG.WITCHER;
        CONFIG.Combat.initiative.formula = '1d10 + @stats.ref.value' + (context.displayRollDetails ? '[REF]' : '');

        context.actor = this.actor;
        context.system = context.actor.system;
        context.systemFields = this.document.system.schema.fields;
        context.items = context.actor.items.filter(i => !i.system.isStored).sort((a, b) => a.sort - b.sort);

        context.system.combatEffects.temporaryEffects.temporaryHpSum =
            context.system.combatEffects.temporaryEffects.temporaryHp.reduce((acc, temp) => acc + temp.value, 0);

        this._prepareGeneralInformation(context);
        this._prepareCustomSkills(context);
        this._prepareWeapons(context);
        this._prepareArmor(context);
        this._prepareSpells(context);
        this._prepareItems(context);
        this._prepareCritWounds(context);

        // Prepare active effects for easier access
        let temporaryItemImprovements = context.items
            .map(item => item.effects.filter(effect => effect.isAppliedTemporaryItemImprovement))
            .flat();

        context.effects = this.prepareActiveEffectCategories(
            Array.from(this.actor.allApplicableEffects()).concat(temporaryItemImprovements)
        );

        context.isGM = game.user.isGM;
        return context;
    }

    async _renderConfigureDialog() {
        this.configuration?.render(true);
    }

    _prepareCustomSkills(context) {
        let customSkills = this.actor.items.filter(item => item.type === 'skill');

        var filteredStats = Object.keys(CONFIG.WITCHER.statMap).reduce(function (stats, index) {
            if (CONFIG.WITCHER.statMap[index].origin === 'stats') {
                stats.push(CONFIG.WITCHER.statMap[index].name);
            }
            return stats;
        }, []);

        context.customSkills = {};
        filteredStats.forEach(stat => {
            context.customSkills[stat] = customSkills.filter(skill => skill.system.attribute === stat);
        });
    }

    _prepareGeneralInformation(context) {
        let actor = context.actor;

        context.oldNotes = actor.getList('note');
        context.notes = actor.system.notes;
    }

    _prepareSpells(context) {
        context.spells = context.actor.getList('spell');

        context.noviceSpells = context.spells.filter(
            s =>
                s.system.level == 'novice' &&
                (s.system.class == 'Spells' || s.system.class == 'Invocations' || s.system.class == 'Witcher')
        );

        context.journeymanSpells = context.spells.filter(
            s =>
                s.system.level == 'journeyman' &&
                (s.system.class == 'Spells' || s.system.class == 'Invocations' || s.system.class == 'Witcher')
        );

        context.masterSpells = context.spells.filter(
            s =>
                s.system.level == 'master' &&
                (s.system.class == 'Spells' || s.system.class == 'Invocations' || s.system.class == 'Witcher')
        );

        context.hexes = context.actor.getList('hex');
        context.rituals = context.actor.getList('ritual');
        context.magicalgift = context.spells.filter(s => s.system.class == 'MagicalGift');
    }

    /**
     * Organize and classify Items for Character sheets.
     */
    _prepareItems(context) {
        let items = context.items;

        context.enhancements = items.filter(i => i.type == 'enhancement' && !i.system.applied);
        context.runeItems = context.enhancements.filter(e => e.system.type == 'rune');
        context.glyphItems = context.enhancements.filter(e => e.system.type == 'glyph');
        context.containers = items.filter(i => i.type == 'container');

        context.totalWeight = context.actor.getTotalWeight();
        context.totalCost = context.items.cost();
    }

    _prepareWeapons(context) {
        context.weapons = context.items.filter(function (item) {
            return (
                item.type == 'weapon' ||
                (item.type == 'enhancement' && item.system.type == 'weapon' && item.system.applied == false)
            );
        });

        context.weapons.forEach(weapon => {
            if (
                weapon.system.enhancements > 0 &&
                weapon.system.enhancements != weapon.system.enhancementItemIds.length
            ) {
                let newEnhancementList = [];
                let enhancementItems = weapon.system.enhancementItems ?? [];
                for (let i = 0; i < weapon.system.enhancements; i++) {
                    let element = enhancementItems[i];
                    if (element) {
                        newEnhancementList.push(element);
                    } else {
                        newEnhancementList.push({});
                    }
                }
                let item = context.actor.items.get(weapon._id);
                item.system.enhancementItems = newEnhancementList;
            }
        });
    }

    _prepareArmor(context) {
        context.armors = context.items.filter(function (item) {
            return (
                item.type == 'armor' ||
                (item.type == 'enhancement' && item.system.type == 'armor' && item.system.applied == false)
            );
        });

        context.armors.forEach(armor => {
            if (armor.system.enhancements > 0 && armor.system.enhancements != armor.system.enhancementItemIds.length) {
                let newEnhancementList = [];
                let enhancementItems = armor.system.enhancementItems ?? [];
                for (let i = 0; i < armor.system.enhancements; i++) {
                    let element = enhancementItems[i];
                    if (element && JSON.stringify(element) != '{}') {
                        newEnhancementList.push(element);
                    } else {
                        newEnhancementList.push({});
                    }
                }
                let item = context.actor.items.get(armor._id);
                item.system.enhancementItems = newEnhancementList;
            }
        });
    }

    _prepareCritWounds(context) {
        let wounds = context.system.critWounds;

        wounds.forEach((wound, index) => {
            wounds[index].description = CONFIG.WITCHER.Crit[wound.configEntry]?.description;
            wounds[index].effect = CONFIG.WITCHER.Crit[wound.configEntry]?.effect[wound.mod];
        });
    }

    async _onRender(context, options) {
        await super._onRender(context, options);

        this.activateListeners(this.element);
    }

    activateListeners(html) {
        let jquery = $(html);
        jquery.find('.life-event-display').on('click', this._onLifeEventDisplay.bind(this));

        jquery.find('.init-roll').on('click', this._onInitRoll.bind(this));
        jquery.find('.crit-roll').on('click', this._onCritRoll.bind(this));
        jquery.find('.recover-sta').on('click', this._onRecoverSta.bind(this));
        jquery.find('.verbal-button').on('click', this._onVerbalCombat.bind(this));

        jquery.find('input').focusin(event => event.currentTarget.select());

        jquery.find('.configure-actor').on('click', this._renderConfigureDialog.bind(this));

        //mixins
        this.statListener(html);
        this.skillListener(html);
        this.skillModifierListener(html);
        this.customSkillListener(html);

        this.itemListener(html);
        this.activeEffectListener(html);

        this.deathSaveListener(html);
        this.criticalWoundListener(html);
        this.noteListener(html);
        this.healListeners(html);

        this.itemContextMenu(html);
    }

    async _onInitRoll(event) {
        this.actor.rollInitiative({ createCombatants: true, rerollInitiative: true });
    }

    async _onCritRoll(event) {
        let rollResult = await new Roll('1d10x10').evaluate({ async: true });
        let messageData = new ChatMessageData(this.actor);
        rollResult.toMessage(messageData);
    }

    async _onRecoverSta(event) {
        const DialogV2 = foundry.applications.api.DialogV2;

        await new DialogV2({
            window: { title: `${game.i18n.localize('WITCHER.Dialog.staDialog')}` },
            modal: true,
            buttons: [
                {
                    action: 'Recovery Action',
                    label: `${game.i18n.localize('WITCHER.Dialog.recoveryAction')}`,
                    callback: async () => {
                        if (this.actor.system.derivedStats.sta.value >= this.actor.system.derivedStats.sta.max) {
                            ui.notifications.info(game.i18n.localize('WITCHER.Dialog.fullStaInfo'));
                            return;
                        }
                        this.actor.update({
                            'system.derivedStats.sta.value':
                                this.actor.system.derivedStats.sta.value + this.actor.system.derivedStats.rec.value
                        });
                    }
                },
                {
                    action: 'Full Recovery',
                    label: `${game.i18n.localize('WITCHER.Dialog.fullRecovery')}`,
                    callback: async () => {
                        if (this.actor.system.derivedStats.sta.value >= this.actor.system.derivedStats.sta.max) {
                            ui.notifications.info(game.i18n.localize('WITCHER.Dialog.fullStaInfo'));
                            return;
                        }
                        this.actor.update({ 'system.derivedStats.sta.value': this.actor.system.derivedStats.sta.max });
                    }
                }
            ]
        }).render({ force: true });
    }

    async _onVerbalCombat() {
        this.actor.verbalCombat();
    }

    _onLifeEventDisplay(event) {
        event.preventDefault();
        let section = event.currentTarget.closest('.life-events-card');
        this.actor.update({
            [`system.general.lifeEvents.${section.dataset.event}.isOpened`]: !this.actor.system.general.lifeEvents.find(
                event => event.key === section.dataset.event
            ).isOpened
        });
    }
}

Object.assign(WitcherActorSheet.prototype, statMixin);
Object.assign(WitcherActorSheet.prototype, skillMixin);
Object.assign(WitcherActorSheet.prototype, skillModifierMixin);
Object.assign(WitcherActorSheet.prototype, customSkillMixin);

Object.assign(WitcherActorSheet.prototype, itemMixin);
Object.assign(WitcherActorSheet.prototype, activeEffectMixin);

Object.assign(WitcherActorSheet.prototype, deathsaveMixin);
Object.assign(WitcherActorSheet.prototype, criticalWoundMixin);
Object.assign(WitcherActorSheet.prototype, noteMixin);
Object.assign(WitcherActorSheet.prototype, healMixin);

Object.assign(WitcherActorSheet.prototype, itemContextMenu);

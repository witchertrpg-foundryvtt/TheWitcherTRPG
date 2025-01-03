import { WITCHER } from './setup/config.js';
import * as Chat from './scripts/chat.js';
import * as Attack from './scripts/combat/attack.js';
import * as VerbalCombat from './scripts/verbalCombat/verbalCombat.js';
import * as VerbalCombatDefense from './scripts/verbalCombat/verbalCombatDefense.js';
import * as Combat from './scripts/combat/combat.js';
import * as ApplyDamage from './scripts/combat/applyDamage.js';
import * as ApplyStatusEffects from './scripts/statusEffects/applyStatusEffect.js';
import * as Fumble from './scripts/rolls/fumble.js';
import { registerSettings } from './setup/settings.js';

import WitcherItem from './item/witcherItem.js';
import WitcherActor from './actor/witcherActor.js';

import { registerDataModels } from './setup/registerDataModels.js';
import { registerSheets } from './setup/registerSheets.js';
import { registerSocketListeners } from './setup/socketHook.js';
import WitcherActiveEffect from './activeEffect/witcherActiveEffect.js';
import { registerHooks } from './setup/hooks.js';
import { deprecationWarnings } from './setup/deprecations.js';
import { applyActiveEffectToActorViaId } from './scripts/activeEffects/applyActiveEffect.js';

async function preloadHandlebarsTemplates() {
    const templatePath = [
        'systems/TheWitcherTRPG/templates/sheets/actor/character-sheet.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/monster-sheet.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/loot-sheet.hbs',

        'systems/TheWitcherTRPG/templates/partials/character-header.hbs',

        'systems/TheWitcherTRPG/templates/partials/character/tab-skills.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/skill-display.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/custom-skill-display.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-profession.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-background.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-inventory.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-inventory-diagrams.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-inventory-valuables.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-inventory-mounts.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-inventory-runes-glyphs.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/substances.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-magic.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/tab-effects.hbs',

        'systems/TheWitcherTRPG/templates/partials/crit-wounds-table.hbs',

        'systems/TheWitcherTRPG/templates/partials/monster/monster-skill-tab.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-inventory-tab.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-details-tab.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-spell-tab.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-skill-display.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-custom-skill-display.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-profession-skill-display.hbs',

        'systems/TheWitcherTRPG/templates/partials/loot/loot-item-display.hbs',

        'systems/TheWitcherTRPG/templates/partials/item-header.hbs',
        'systems/TheWitcherTRPG/templates/partials/spell-header.hbs',
        'systems/TheWitcherTRPG/templates/partials/item-image.hbs',
        'systems/TheWitcherTRPG/templates/partials/associated-item.hbs',
        'systems/TheWitcherTRPG/templates/partials/associated-diagram.hbs',
        'systems/TheWitcherTRPG/templates/partials/effect-part.hbs',

        'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/damagePropertiesConfiguration.hbs',
        'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/defensePropertiesConfiguration.hbs',
        'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/consumablePropertiesConfiguration.hbs',
        'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/regionPropertiesConfiguration.hbs',

        'systems/TheWitcherTRPG/templates/sheets/investigation/mystery-sheet.hbs',
        'systems/TheWitcherTRPG/templates/partials/investigation/clue-display.hbs',
        'systems/TheWitcherTRPG/templates/partials/investigation/obstacle-display.hbs',

        'systems/TheWitcherTRPG/templates/dialog/verbal-combat.hbs',
        'systems/TheWitcherTRPG/templates/dialog/repair-dialog.hbs',

        'systems/TheWitcherTRPG/templates/chat/damage/damageToLocation.hbs',
        'systems/TheWitcherTRPG/templates/chat/item/repair.hbs',

        'systems/TheWitcherTRPG/templates/partials/components-list.hbs'
    ];
    return loadTemplates(templatePath);
}

registerHooks();

Hooks.once('init', function () {
    console.log('TheWitcherTRPG | init system');

    CONFIG.WITCHER = WITCHER;
    CONFIG.statusEffects = CONFIG.WITCHER.statusEffects;
    CONFIG.Item.documentClass = WitcherItem;
    CONFIG.Actor.documentClass = WitcherActor;
    CONFIG.ActiveEffect.documentClass = WitcherActiveEffect;
    CONFIG.ActiveEffect.legacyTransferral = false;

    game.api = {
        applyActiveEffectToActorViaId
    };

    registerDataModels();
    registerSheets();
    preloadHandlebarsTemplates();
    registerSettings();
});

Hooks.on('renderChatLog', (app, html, data) => {
    Chat.addChatListeners(html);
});

Hooks.on('renderChatMessage', (message, html, data) => {
    Attack.chatMessageListeners(message, html);
    VerbalCombat.chatMessageListeners(message, html);
    ApplyStatusEffects.chatMessageListeners(message, html);
});

Hooks.on('renderActiveEffectConfig', async (activeEffectConfig, html, data) => {
    const effectsSection = html[0].querySelector("section[data-tab='effects']");
    const inputFields = effectsSection.querySelectorAll('.key input');
    const datalist = document.createElement('datalist');
    const attributeKeyOptions = {};

    datalist.id = 'attribute-key-list';
    inputFields.forEach(inputField => {
        inputField.setAttribute('list', 'attribute-key-list');
    });

    for (const datamodel in CONFIG.Actor.dataModels) {
        CONFIG.Actor.dataModels[datamodel].schema.apply(function () {
            if (!(this instanceof foundry.data.fields.SchemaField)) {
                attributeKeyOptions[this.fieldPath] = this.label;
            }
        });
    }

    const sortedKeys = Object.keys(attributeKeyOptions).sort();
    sortedKeys.forEach(key => {
        const attributeKeyOption = document.createElement('option');
        attributeKeyOption.value = key;
        if (!!attributeKeyOptions[key]) attributeKeyOption.label = attributeKeyOptions[key];
        datalist.appendChild(attributeKeyOption);
    });

    effectsSection.append(datalist);
});

Hooks.once('ready', async function () {
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on('hotbarDrop', (bar, data, slot) => {
        if (data.type === 'Item') {
            createMacro(data, slot);
            return false;
        }
    });

    if (game.settings.get('TheWitcherTRPG', 'useWitcherFont')) {
        let els = document.getElementsByClassName('game');
        Array.prototype.forEach.call(els, function (el) {
            if (el) {
                el.classList.add('witcher-style');
            }
        });
        let chat = document.getElementById('chat-log');
        if (chat) {
            chat.classList.add('witcher-style');
        }
    }

    registerSocketListeners();
    deprecationWarnings();
});

Hooks.once('dragRuler.ready', SpeedProvider => {
    class FictionalGameSystemSpeedProvider extends SpeedProvider {
        get colors() {
            return [
                { id: 'walk', default: 0x00ff00, name: 'witcher.speeds.walk' },
                { id: 'dash', default: 0xffff00, name: 'witcher.speeds.dash' },
                { id: 'run', default: 0xff8000, name: 'witcher.speeds.run' }
            ];
        }

        getRanges(token) {
            let baseSpeed = token.actor.system.stats.spd.current;
            // A character can always walk it's base speed and dash twice it's base speed
            let moveSpeed = baseSpeed % 2 == 0 ? baseSpeed : baseSpeed + 1;
            let runspeed = (baseSpeed * 3) % 2 == 0 ? baseSpeed * 3 : baseSpeed * 3 + 1;
            const ranges = [
                { range: moveSpeed, color: 'walk' },
                { range: runspeed, color: 'dash' }
            ];
            return ranges;
        }
    }

    dragRuler.registerSystem('TheWitcherTRPG', FictionalGameSystemSpeedProvider);
});

Hooks.once('polyglot.init', LanguageProvider => {
    class FictionalGameSystemLanguageProvider extends LanguageProvider {
        languages = {
            common: { label: 'Common', font: 'Thorass' },
            dwarven: { label: 'Dwarven', font: 'Dethek' },
            elder: { label: 'Elder Speech', font: 'Espruar' }
        };

        getUserLanguages(actor) {
            let known_languages = new Set();
            let literate_languages = new Set();
            known_languages.add('common');
            if (
                actor.system.skills.int.eldersp.isProfession ||
                actor.system.skills.int.eldersp.isPickup ||
                actor.system.skills.int.eldersp.isLearned ||
                actor.system.skills.int.eldersp.value > 0
            ) {
                known_languages.add('elder');
            }
            if (
                actor.system.skills.int.dwarven.isProfession ||
                actor.system.skills.int.dwarven.isPickup ||
                actor.system.skills.int.dwarven.isLearned ||
                actor.system.skills.int.dwarven.value > 0
            ) {
                known_languages.add('dwarven');
            }
            if (
                actor.system.skills.int.commonsp.isProfession ||
                actor.system.skills.int.commonsp.isPickup ||
                actor.system.skills.int.commonsp.isLearned ||
                actor.system.skills.int.commonsp.value > 0
            ) {
                known_languages.add('common');
            }
            return [known_languages, literate_languages];
        }
    }
    game.polyglot.api.registerSystem(FictionalGameSystemLanguageProvider);
});

Hooks.on('getChatLogEntryContext', ApplyDamage.addDamageMessageContextOptions);
Hooks.on('getChatLogEntryContext', VerbalCombat.addVerbalCombatMessageContextOptions);
Hooks.on('getChatLogEntryContext', VerbalCombatDefense.addVerbalCombatDefenseMessageContextOptions);
Hooks.on('getChatLogEntryContext', Combat.addDefenseOptionsContextMenu);
Hooks.on('getChatLogEntryContext', Combat.addCritMessageContextOptions);
Hooks.on('getChatLogEntryContext', Fumble.addFumbleContextOptions);

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createMacro(data, slot) {
    if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
        return ui.notifications.warn('You can only create macro buttons for owned Items');
    }

    let item = fromUuidSync(data.uuid);

    let command = `actor = fromUuidSync('${item.parent.uuid}'); actor.useItem("${item.id}")`;

    let macro = game.macros.find(m => m.name === item.name && m.command === command);

    if (!macro) {
        macro = await Macro.create({
            name: item.name,
            type: 'script',
            img: item.img,
            command: command
        });
    }
    game.user.assignHotbarMacro(macro, slot);
}

Handlebars.registerHelper('getOwnedComponentCount', function (actor, componentName) {
    if (!actor) {
        console.warn(
            "'actor' parameter passed into getOwnedComponentCount is undefined. That might be a problem with one of the selected actors diagrams."
        );
        return 0;
    }
    let ownedComponent = actor.findNeededComponent(componentName);
    return ownedComponent.sum('quantity');
});

Handlebars.registerHelper('getSetting', function (setting) {
    return game.settings.get('TheWitcherTRPG', setting);
});

Handlebars.registerHelper('window', function (...props) {
    props.pop();
    return props.reduce((result, prop) => result[prop], window);
});

Handlebars.registerHelper('includes', function (csv, substr) {
    return csv
        .split(',')
        .map(v => v.trim())
        .includes(substr);
});

Handlebars.registerHelper('formatModLabel', function (statCurrent, statMax) {
    let calc = statCurrent - statMax;
    return calc;
});

Handlebars.registerHelper({
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
        return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    }
});

Handlebars.registerHelper('eachLimit', function (context, limit, options) {
    if (!context || typeof context !== 'object') return '';

    const keys = Object.keys(context);
    const result = [];

    for (let i = 0; i < limit; i++) {
        const key = keys[i];
        const lifeEvent = context[key];
        const data = Handlebars.createFrame(options.data || {});
        data.key = key;

        result.push(options.fn({ lifeEvent, key }, { data }));
    }
    return result.join('');
});

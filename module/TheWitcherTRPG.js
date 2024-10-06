import { WITCHER } from './setup/config.js';
import * as Chat from './scripts/chat.js';
import * as Attack from './scripts/combat/attack.js';
import * as VerbalCombat from './scripts/verbalCombat/verbalCombat.js';
import * as VerbalCombatDefense from './scripts/verbalCombat/verbalCombatDefense.js';
import * as Defense from './scripts/combat/defenses.js';
import * as ApplyDamage from './scripts/combat/applyDamage.js';
import * as ApplyStatusEffects from './scripts/statusEffects/applyStatusEffect.js';
import * as Crit from './scripts/combat/applyCrit.js';
import * as Fumble from './scripts/rolls/fumble.js';
import { registerSettings } from './setup/settings.js';

import WitcherItem from './item/witcherItem.js';
import WitcherActor from './actor/witcherActor.js';

import { registerDataModels } from './setup/registerDataModels.js';
import { registerSheets } from './setup/registerSheets.js';
import { registerSocketListeners } from './setup/socketHook.js';
import WitcherActiveEffect from './activeEffect/witcherActiveEffect.js';

async function preloadHandlebarsTemplates() {
    const templatePath = [
        'systems/TheWitcherTRPG/templates/sheets/actor/character-sheet.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/monster-sheet.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/loot-sheet.hbs',

        'systems/TheWitcherTRPG/templates/partials/character-header.hbs',

        'systems/TheWitcherTRPG/templates/partials/character/tab-skills.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/skill-display.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-profession.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-background.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-inventory.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-inventory-diagrams.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-inventory-valuables.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-inventory-mounts.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-inventory-runes-glyphs.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/substances.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-magic.hbs',

        'systems/TheWitcherTRPG/templates/partials/crit-wounds-table.hbs',

        'systems/TheWitcherTRPG/templates/partials/monster/monster-skill-tab.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-inventory-tab.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-details-tab.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-spell-tab.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-skill-display.hbs',

        'systems/TheWitcherTRPG/templates/partials/loot/loot-item-display.hbs',

        'systems/TheWitcherTRPG/templates/partials/item-header.hbs',
        'systems/TheWitcherTRPG/templates/partials/spell-header.hbs',
        'systems/TheWitcherTRPG/templates/partials/item-image.hbs',
        'systems/TheWitcherTRPG/templates/partials/associated-item.hbs',
        'systems/TheWitcherTRPG/templates/partials/effect-part.hbs',

        'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/damagePropertiesConfiguration.hbs',
        'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/defensePropertiesConfiguration.hbs',
        'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/consumablePropertiesConfiguration.hbs',

        'systems/TheWitcherTRPG/templates/sheets/investigation/mystery-sheet.hbs',
        'systems/TheWitcherTRPG/templates/partials/investigation/clue-display.hbs',
        'systems/TheWitcherTRPG/templates/partials/investigation/obstacle-display.hbs',

        'systems/TheWitcherTRPG/templates/dialog/verbal-combat.hbs',

        'systems/TheWitcherTRPG/templates/chat/damage/damageToLocation.hbs'
    ];
    return loadTemplates(templatePath);
}

Hooks.once('init', function () {
    console.log('TheWitcherTRPG | init system');

    CONFIG.WITCHER = WITCHER;
    CONFIG.statusEffects = CONFIG.WITCHER.statusEffects;
    CONFIG.Item.documentClass = WitcherItem;
    CONFIG.Actor.documentClass = WitcherActor;
    CONFIG.ActiveEffect.documentClass = WitcherActiveEffect;
    CONFIG.ActiveEffect.legacyTransferral = false;

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

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */
Hooks.once('ready', async function () {
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on('hotbarDrop', (bar, data, slot) => createBoilerplateMacro(data, slot));

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
Hooks.on('getChatLogEntryContext', Defense.addDefenseMessageContextOptions);
Hooks.on('getChatLogEntryContext', Crit.addCritMessageContextOptions);
Hooks.on('getChatLogEntryContext', Fumble.addFumbleContextOptions);

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createBoilerplateMacro(data, slot) {
    if (data.type == 'Actor') {
        const actor = game.actors.get(data.id);
        if (!actor) {
            return;
        }
        const command = `game.actors.get('${data.id}')?.sheet.render(true)`;
        let macro = game.macros.entities.find(macro => macro.name === actor.name && macro.command === command);

        if (!macro) {
            macro = await Macro.create(
                {
                    name: actor.name,
                    type: 'script',
                    img: actor.system.img,
                    command: command
                },
                { renderSheet: false }
            );
        }
        game.user.assignHotbarMacro(macro, slot);
        return false;
    } else if (!('item' in data)) {
        return ui.notifications.warn('You can only create macro buttons for owned Items');
    } else if (data.item.type == 'weapon') {
        const weapon = data.item;
        let foundActor = null;
        game.actors.forEach(actor => {
            actor.items.forEach(item => {
                if (weapon._id == item.id) {
                    foundActor = actor;
                }
            });
        });
        if (!foundActor) {
            return ui.notifications.warn('You can only create macro buttons with the original character');
        }
        const command = `actor = game.actors.get('${foundActor.id}'); actor.rollItem("${weapon._id}")`;
        let macro = game.macros.find(m => m.name === weapon.name && m.command === command);
        if (!macro) {
            macro = await Macro.create({
                name: weapon.name,
                type: 'script',
                img: weapon.img,
                command: command,
                flags: { 'boilerplate.itemMacro': true }
            });
        }
        game.user.assignHotbarMacro(macro, slot);
        return false;
    } else if (data.item.type == 'spell') {
        const spell = data.item;
        let foundActor = null;
        game.actors.forEach(actor => {
            actor.items.forEach(item => {
                if (spell._id == item.id) {
                    foundActor = actor;
                }
            });
        });
        if (!foundActor) {
            return ui.notifications.warn('You can only create macro buttons with the original character');
        }
        const command = `actor = game.actors.get('${foundActor.id}'); actor.rollSpell("${spell._id}")`;
        let macro = game.macros.find(m => m.name === spell.name && m.command === command);
        if (!macro) {
            macro = await Macro.create({
                name: spell.name,
                type: 'script',
                img: spell.img,
                command: command,
                flags: { 'boilerplate.itemMacro': true }
            });
        }
        game.user.assignHotbarMacro(macro, slot);
        return false;
    }
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

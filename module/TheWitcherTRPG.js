import { WITCHER } from './setup/config.js';
import * as Chat from './scripts/chat.js';
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
import { preloadHandlebarsTemplates, registerHandelbarHelpers } from './setup/handlebars.js';

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

Hooks.on('renderChatMessageHTML', (message, html, data) => {
    Combat.attackChatMessageListeners(message, html);
    VerbalCombat.chatMessageListeners(message, html);
    ApplyStatusEffects.chatMessageListeners(message, html);
});

Hooks.on('renderActiveEffectConfig', async (activeEffectConfig, html, data) => {
    const effectsSection = html.querySelector("section[data-tab='changes']");
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

Hooks.on('getChatMessageContextOptions', ApplyDamage.addDamageMessageContextOptions);
Hooks.on('getChatMessageContextOptions', VerbalCombat.addVerbalCombatMessageContextOptions);
Hooks.on('getChatMessageContextOptions', VerbalCombatDefense.addVerbalCombatDefenseMessageContextOptions);
Hooks.on('getChatMessageContextOptions', Combat.addDefenseOptionsContextMenu);
Hooks.on('getChatMessageContextOptions', Combat.addCritMessageContextOptions);
Hooks.on('getChatMessageContextOptions', Fumble.addFumbleContextOptions);

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

registerHandelbarHelpers();

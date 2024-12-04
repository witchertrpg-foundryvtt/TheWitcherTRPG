import WitcherCharacterSheet from '../actor/sheets/WitcherCharacterSheet.js';
import WitcherMonsterSheet from '../actor/sheets/WitcherMonsterSheet.js';
import WitcherLootSheet from '../actor/sheets/WitcherLootSheet.js';

import WitcherItemSheet from '../item/sheets/WitcherItemSheet.js';
import WitcherWeaponSheet from '../item/sheets/WitcherWeaponSheet.js';
import WitcherDiagramSheet from '../item/sheets/WitcherDiagramSheet.js';
import WitcherContainerSheet from '../item/sheets/WitcherContainerSheet.js';

import WitcherMysterySheet from '../actor/sheets/investigation/WitcherMysterySheet.js';
import WitcherClueSheet from '../item/sheets/investigation/WitcherClueSheet.js';
import WitcherObstacleSheet from '../item/sheets/investigation/WitcherObstacleSheet.js';
import WitcherGlobalModifierSheet from '../item/sheets/WitcherGlobalModifierSheet.js';
import WitcherSpellSheet from '../item/sheets/WitcherSpellSheet.js';
import WitcherAlchemicalSheet from '../item/sheets/WitcherAlchemicalSheet.js';
import WitcherArmorSheet from '../item/sheets/WitcherArmorSheet.js';
import WitcherValuableSheet from '../item/sheets/WitcherValuableSheet.js';
import { WitcherActiveEffectConfig } from '../activeEffect/WitcherActiveEffectSheet.js';
import WitcherRaceSheet from '../item/sheets/WitcherRaceSheet.js';
import WitcherSkillItemSheet from '../item/sheets/WitcherSkillItemSheet.js';
import WitcherMutagenSheet from '../item/sheets/WitcherMutagenSheet.js';
import WitcherEnhancementSheet from '../item/sheets/WitcherEnhancementSheet.js';

export const registerSheets = () => {
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('witcher', WitcherItemSheet, { makeDefault: true });

    Items.registerSheet('witcher', WitcherAlchemicalSheet, {
        makeDefault: true,
        types: ['alchemical']
    });
    Items.registerSheet('witcher', WitcherArmorSheet, {
        makeDefault: true,
        types: ['armor']
    });
    Items.registerSheet('witcher', WitcherContainerSheet, {
        makeDefault: true,
        types: ['container']
    });
    Items.registerSheet('witcher', WitcherDiagramSheet, {
        makeDefault: true,
        types: ['diagrams']
    });
    Items.registerSheet('witcher', WitcherEnhancementSheet, {
        makeDefault: true,
        types: ['enhancement']
    });
    Items.registerSheet('witcher', WitcherGlobalModifierSheet, {
        makeDefault: true,
        types: ['globalModifier']
    });
    Items.registerSheet('witcher', WitcherMutagenSheet, {
        makeDefault: true,
        types: ['mutagen']
    });
    Items.registerSheet('witcher', WitcherRaceSheet, {
        makeDefault: true,
        types: ['race']
    });
    Items.registerSheet('witcher', WitcherSpellSheet, {
        makeDefault: true,
        types: ['spell']
    });
    Items.registerSheet('witcher', WitcherValuableSheet, {
        makeDefault: true,
        types: ['valuable']
    });
    Items.registerSheet('witcher', WitcherWeaponSheet, {
        makeDefault: true,
        types: ['weapon']
    });

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('witcher', WitcherCharacterSheet, {
        makeDefault: true,
        types: ['character']
    });
    Actors.registerSheet('witcher', WitcherMonsterSheet, {
        makeDefault: true,
        types: ['monster']
    });
    Actors.registerSheet('witcher', WitcherLootSheet, {
        makeDefault: true,
        types: ['loot']
    });

    Actors.registerSheet('witcher', WitcherMysterySheet, {
        makeDefault: true,
        types: ['mystery']
    });
    Items.registerSheet('witcher', WitcherClueSheet, {
        makeDefault: true,
        types: ['clue']
    });
    Items.registerSheet('witcher', WitcherObstacleSheet, {
        makeDefault: true,
        types: ['obstacle']
    });

    Items.registerSheet('witcher', WitcherSkillItemSheet, {
        makeDefault: true,
        types: ['skill']
    });

    // Register configs for embedded documents.
    DocumentSheetConfig.unregisterSheet(ActiveEffect, 'core', ActiveEffectConfig);
    DocumentSheetConfig.registerSheet(ActiveEffect, 'witcher', WitcherActiveEffectConfig, {
        makeDefault: true
    });
};

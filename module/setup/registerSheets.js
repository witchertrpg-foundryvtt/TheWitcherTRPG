import WitcherCharacterSheet from "../actor/sheets/WitcherCharacterSheet.js";
import WitcherMonsterSheet from "../actor/sheets/WitcherMonsterSheet.js";
import WitcherLootSheet from "../actor/sheets/WitcherLootSheet.js";

import WitcherItemSheet from "../item/sheets/WitcherItemSheet.js";
import WitcherWeaponSheet from "../item/sheets/WitcherWeaponSheet.js";
import WitcherDiagramSheet from "../item/sheets/WitcherDiagramSheet.js";
import WitcherContainerSheet from "../item/sheets/WitcherContainerSheet.js";
import WitcherEffectSheet from "../item/sheets/WitcherActiveEffectSheet.js";

import WitcherMysterySheet from "../actor/sheets/investigation/WitcherMysterySheet.js";
import WitcherClueSheet from "../item/sheets/investigation/WitcherClueSheet.js";
import WitcherObstacleSheet from "../item/sheets/investigation/WitcherObstacleSheet.js";
import WitcherGlobalModifierSheet from "../item/sheets/WitcherGlobalModifierSheet.js";
import WitcherSpellSheet from "../item/sheets/WitcherSpellSheet.js";
import WitcherAlchemicalSheet from "../item/sheets/WitcherAlchemicalSheet.js";
import WitcherArmorSheet from "../item/sheets/WitcherArmorSheet.js";
import WitcherValuableSheet from "../item/sheets/WitcherValuableSheet.js";

export const registerSheets = () => {
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("witcher", WitcherItemSheet, { makeDefault: true });

    Items.registerSheet("witcher", WitcherAlchemicalSheet, {
        makeDefault: true,
        types: ['alchemical']
    });
    Items.registerSheet("witcher", WitcherArmorSheet, {
        makeDefault: true,
        types: ['armor']
    });
    Items.registerSheet("witcher", WitcherContainerSheet, {
        makeDefault: true,
        types: ['container']
    });
    Items.registerSheet("witcher", WitcherDiagramSheet, {
        makeDefault: true,
        types: ['diagrams']
    });
    Items.registerSheet("witcher", WitcherEffectSheet, {
        makeDefault: true,
        types: ['effect']
    });
    Items.registerSheet("witcher", WitcherGlobalModifierSheet, {
        makeDefault: true,
        types: ['globalModifier']
    });
    Items.registerSheet("witcher", WitcherSpellSheet, {
        makeDefault: true,
        types: ['spell']
    });
    Items.registerSheet("witcher", WitcherValuableSheet, {
        makeDefault: true,
        types: ['valuable']
    });
    Items.registerSheet("witcher", WitcherWeaponSheet, {
        makeDefault: true,
        types: ['weapon']
    });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("witcher", WitcherCharacterSheet, {
        makeDefault: true,
        types: ['character']
    });
    Actors.registerSheet("witcher", WitcherMonsterSheet, {
        makeDefault: true,
        types: ['monster']
    });
    Actors.registerSheet("witcher", WitcherLootSheet, {
        makeDefault: true,
        types: ['loot']
    });

    Actors.registerSheet("witcher", WitcherMysterySheet, {
        makeDefault: true,
        types: ['mystery']
    });
    Items.registerSheet("witcher", WitcherClueSheet, {
        makeDefault: true,
        types: ['clue']
    });
    Items.registerSheet("witcher", WitcherObstacleSheet, {
        makeDefault: true,
        types: ['obstacle']
    });
}
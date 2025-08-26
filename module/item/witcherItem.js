import { extendedRoll } from '../scripts/rolls/extendedRoll.js';
import { RollConfig } from '../scripts/rollConfig.js';
import { WITCHER } from '../setup/config.js';
import { damageUtilMixin } from './mixins/damageUtilMixin.js';
import { consumeMixin } from './mixins/consumeMixin.js';
import { repairMixin } from './mixins/repairMixin.js';
import { dismantlingMixin } from './mixins/dismantlingMixin.js';
import { defenseOptionMixin } from './mixins/defenseOptionMixin.js';

export default class WitcherItem extends Item {
    /** @inheritdoc */
    static migrateData(source) {
        this.migrateSpells(source);

        return super.migrateData(source);
    }

    static migrateSpells(source) {
        if (source.system?.class === 'Hexes') {
            source.type = 'hex';
        }

        if (source.system?.class === 'Rituals') {
            source.type = 'ritual';
        }
    }

    getItemAttack(
        options = {
            alt: false,
            ctrl: false,
            shift: false
        }
    ) {
        if (!this.system.attackOptions) {
            return {
                attackOption: 'none',
                itemUuid: this.uuid
            };
        }

        let mapKeyToNumber;
        if (Object.values(options).every(key => !key) || this.system.attackOptions.size < 2) {
            mapKeyToNumber = 0;
        } else {
            switch (true) {
                case options.ctrl:
                    mapKeyToNumber = 3;
                    break;
                case options.alt:
                    mapKeyToNumber = 2;
                    break;
                case options.shift:
                    mapKeyToNumber = 1;
                    break;
            }

            mapKeyToNumber = Math.min(mapKeyToNumber, this.system.attackOptions.size - 1);
        }

        let attackOption = [...this.system.attackOptions][mapKeyToNumber];

        let attackSkill = this.system[attackOption + 'AttackSkill'];
        return {
            attackOption,
            skill: attackSkill,
            alias: WITCHER.skillMap[attackSkill]?.label,
            itemUuid: this.uuid
        };
    }

    isAlchemicalCraft() {
        return this.system.alchemyDC && this.system.alchemyDC > 0;
    }

    populateAlchemyCraftComponentsList() {
        class AlchemyComponent {
            name = '';
            alias = '';
            content = '';
            quantity = 0;

            constructor(name, alias, content, quantity) {
                this.name = name;
                this.alias = alias;
                this.content = content;
                this.quantity = quantity;
            }
        }

        let alchemyCraftComponents = [];
        alchemyCraftComponents.push(
            new AlchemyComponent(
                'vitriol',
                game.i18n.localize('WITCHER.Inventory.Vitriol'),
                `<img src="systems/TheWitcherTRPG/assets/images/vitriol.png" class="substance-img" /> <b>${this.system.alchemyComponents.vitriol}</b>`,
                this.system.alchemyComponents.vitriol > 0 ? this.system.alchemyComponents.vitriol : 0
            )
        );
        alchemyCraftComponents.push(
            new AlchemyComponent(
                'rebis',
                game.i18n.localize('WITCHER.Inventory.Rebis'),
                `<img src="systems/TheWitcherTRPG/assets/images/rebis.png" class="substance-img" /> <b>${this.system.alchemyComponents.rebis}</b>`,
                this.system.alchemyComponents.rebis > 0 ? this.system.alchemyComponents.rebis : 0
            )
        );
        alchemyCraftComponents.push(
            new AlchemyComponent(
                'aether',
                game.i18n.localize('WITCHER.Inventory.Aether'),
                `<img src="systems/TheWitcherTRPG/assets/images/aether.png" class="substance-img" /> <b>${this.system.alchemyComponents.aether}</b>`,
                this.system.alchemyComponents.aether > 0 ? this.system.alchemyComponents.aether : 0
            )
        );
        alchemyCraftComponents.push(
            new AlchemyComponent(
                'quebrith',
                game.i18n.localize('WITCHER.Inventory.Quebrith'),
                `<img src="systems/TheWitcherTRPG/assets/images/quebrith.png" class="substance-img" /> <b>${this.system.alchemyComponents.quebrith}</b>`,
                this.system.alchemyComponents.quebrith > 0 ? this.system.alchemyComponents.quebrith : 0
            )
        );
        alchemyCraftComponents.push(
            new AlchemyComponent(
                'hydragenum',
                game.i18n.localize('WITCHER.Inventory.Hydragenum'),
                `<img src="systems/TheWitcherTRPG/assets/images/hydragenum.png" class="substance-img" /> <b>${this.system.alchemyComponents.hydragenum}</b>`,
                this.system.alchemyComponents.hydragenum > 0 ? this.system.alchemyComponents.hydragenum : 0
            )
        );
        alchemyCraftComponents.push(
            new AlchemyComponent(
                'vermilion',
                game.i18n.localize('WITCHER.Inventory.Vermilion'),
                `<img src="systems/TheWitcherTRPG/assets/images/vermilion.png" class="substance-img" /> <b>${this.system.alchemyComponents.vermilion}</b>`,
                this.system.alchemyComponents.vermilion > 0 ? this.system.alchemyComponents.vermilion : 0
            )
        );
        alchemyCraftComponents.push(
            new AlchemyComponent(
                'sol',
                game.i18n.localize('WITCHER.Inventory.Sol'),
                `<img src="systems/TheWitcherTRPG/assets/images/sol.png" class="substance-img" /> <b>${this.system.alchemyComponents.sol}</b>`,
                this.system.alchemyComponents.sol > 0 ? this.system.alchemyComponents.sol : 0
            )
        );
        alchemyCraftComponents.push(
            new AlchemyComponent(
                'caelum',
                game.i18n.localize('WITCHER.Inventory.Caelum'),
                `<img src="systems/TheWitcherTRPG/assets/images/caelum.png" class="substance-img" /> <b>${this.system.alchemyComponents.caelum}</b>`,
                this.system.alchemyComponents.caelum > 0 ? this.system.alchemyComponents.caelum : 0
            )
        );
        alchemyCraftComponents.push(
            new AlchemyComponent(
                'fulgur',
                game.i18n.localize('WITCHER.Inventory.Fulgur'),
                `<img src="systems/TheWitcherTRPG/assets/images/fulgur.png" class="substance-img" /> <b>${this.system.alchemyComponents.fulgur}</b>`,
                this.system.alchemyComponents.fulgur > 0 ? this.system.alchemyComponents.fulgur : 0
            )
        );

        this.system.alchemyCraftComponents = alchemyCraftComponents;
        return alchemyCraftComponents;
    }

    /**
     * @param {string} rollFormula
     * @param {*} messageData
     * @param {RollConfig} config
     */
    async realCraft(rollFormula, messageData, config) {
        //we want to show message to the chat only after removal of items from inventory
        config.showResult = false;

        //added crit rolls for craft & alchemy
        let roll = await extendedRoll(rollFormula, messageData, config);

        messageData.flavor += `<label><b> ${this.actor.name}</b></label><br/>`;

        let result = roll.total > config.threshold;
        let craftedItemName;
        if (this.system.associatedItem?.name) {
            let craftingComponents = this.isAlchemicalCraft()
                ? this.system.alchemyCraftComponents.filter(c => Number(c.quantity) > 0)
                : this.system.craftingComponents.filter(c => Number(c.quantity) > 0);

            craftingComponents.forEach(c => {
                let componentsToDelete = this.isAlchemicalCraft()
                    ? this.actor.getSubstance(c.name)
                    : this.actor.findNeededComponent(c.name);

                let componentsCountToDelete = Number(c.quantity);
                let componentsLeftToDelete = componentsCountToDelete;
                let componentsCountDeleted = 0;

                componentsToDelete.forEach(toDelete => {
                    let toDeleteCount = Math.min(
                        Number(toDelete.system.quantity),
                        componentsCountToDelete,
                        componentsLeftToDelete
                    );
                    if (toDeleteCount <= 0) {
                        return ui.notifications.info(
                            `${game.i18n.localize('WITCHER.craft.SkipRemovalOfComponent')}: ${toDelete.name}`
                        );
                    }

                    if (componentsCountDeleted < componentsCountToDelete) {
                        this.actor.removeItem(toDelete._id, toDeleteCount);
                        componentsCountDeleted += toDeleteCount;
                        componentsLeftToDelete -= toDeleteCount;
                        return ui.notifications.info(
                            `${toDeleteCount} ${toDelete.name} ${game.i18n.localize('WITCHER.craft.ItemsSuccessfullyDeleted')} ${this.actor.name}`
                        );
                    }
                });

                if (componentsCountDeleted != componentsCountToDelete || componentsLeftToDelete != 0) {
                    result = false;
                    return ui.notifications.error(game.i18n.localize('WITCHER.err.CraftItemDeletion'));
                }
            });

            craftedItemName = this.system.associatedItem?.name;
            if (result) {
                let craftedItem = await fromUuid(this.system.associatedItemUuid);
                this.actor.addItem(craftedItem, this.system.resultQuantity);
            }
        } else {
            craftedItemName = game.i18n.localize('WITCHER.craft.SuccessfulCraftForNothing');
        }

        messageData.flavor += `<b>${craftedItemName}</b>`;
        roll.toMessage(messageData);
    }

    /**
     *
     * @param Number newQuantity
     * @returns info whether we generated item with the help of the roll table
     */
    async checkIfItemHasRollTable(newQuantity) {
        // search for the compendium pack in the world roll tables by name of the generator
        const compendiumPack = game.packs
            .filter(p => p.metadata.type === 'RollTable')
            .filter(c => c.index.find(r => r.name === this.name));

        if (!compendiumPack || compendiumPack.length == 0) {
            // Provided item does not have associated roll table
            // this item should appear in loot sheet as is
            return false;
        } else if (compendiumPack.length == 1) {
            // get id of the needed table generator in the compendium pack
            const tableId = compendiumPack[0].index.getName(this.name)._id;

            for (let i = 0; i < newQuantity; i++) {
                let roll = await compendiumPack[0].getDocument(tableId).then(el => el.roll());
                let res = roll.results[0];
                let pack = game.packs.get(res.documentCollection);
                await pack?.getIndex();
                let genItem = await pack?.getDocument(res.documentId);

                if (!genItem) {
                    return ui.notifications.error(
                        `${game.i18n.localize('WITCHER.Monster.exportLootInvalidItemError')}`
                    );
                }

                // add generated item to the loot sheet
                let itemInLoot = this.actor.items.find(i => i.name === genItem.name && i.type === genItem.type);
                if (!itemInLoot) {
                    await Item.create(genItem, { parent: this.actor });
                } else {
                    // if we have already generated item in the loot sheet - increase it's count instead of creation
                    let itemToUpdate = itemInLoot[0] ? itemInLoot[0] : itemInLoot;
                    let itemToUpdateCount = itemToUpdate.system.quantity;
                    itemToUpdate.update({ 'system.quantity': ++itemToUpdateCount });
                }

                let successMessage = `${game.i18n.localize('WITCHER.Monster.exportLootGenerated')}: ${genItem.name}`;
                ui.notifications.info(`${successMessage}`);

                //whisper info about generated items from the roll table
                let chatData = {
                    user: game.user._id,
                    content: `${successMessage} ${res.getChatText()}`,
                    whisper: game.users.filter(u => u.isGM).map(u => u._id)
                };
                ChatMessage.create(chatData, {});
            }

            // remove basic item from the loot sheet
            // this item used for generation the actual item from the roll table
            await this.actor.items.get(this.id).delete();

            return true;
        } else {
            return ui.notifications.error(`${game.i18n.localize('WITCHER.Monster.exportLootToManyRollTablesError')}`);
        }
    }

    /* -------------------------------------------- */
    /*  Active Effects                              */
    /* -------------------------------------------- */

    prepareEmbeddedDocuments() {
        super.prepareEmbeddedDocuments();
        this.applyActiveEffects();
    }

    /**
     * Get all ActiveEffects that may apply to this Item.
     * @yields {ActiveEffect5e}
     * @returns {Generator<ActiveEffect5e, void, void>}
     */
    *allApplicableEffects() {
        for (const effect of this.effects) {
            if (effect.isAppliedTemporaryItemImprovement) yield effect;
        }
    }

    /* -------------------------------------------- */

    /**
     * Apply any transformation to the Item data which are caused by Effects.
     */
    applyActiveEffects() {
        const overrides = {};

        // Organize non-disabled effects by their application priority
        const changes = [];
        for (const effect of this.allApplicableEffects()) {
            if (!effect.active) continue;
            changes.push(
                ...effect.changes.map(change => {
                    const c = foundry.utils.deepClone(change);
                    c.effect = effect;
                    c.priority ??= c.mode * 10;
                    return c;
                })
            );
        }
        changes.sort((a, b) => a.priority - b.priority);

        // Apply all changes
        for (const change of changes) {
            if (!change.key) continue;
            const changes = change.effect.apply(this, change);
            Object.assign(overrides, changes);
        }

        // Expand the set of final overrides
        this.overrides = foundry.utils.expandObject(overrides);
    }
}

Object.assign(WitcherItem.prototype, consumeMixin);
Object.assign(WitcherItem.prototype, repairMixin);
Object.assign(WitcherItem.prototype, dismantlingMixin);
Object.assign(WitcherItem.prototype, damageUtilMixin);
Object.assign(WitcherItem.prototype, defenseOptionMixin);

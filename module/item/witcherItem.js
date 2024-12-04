import { extendedRoll } from '../scripts/rolls/extendedRoll.js';
import { RollConfig } from '../scripts/rollConfig.js';
import { WITCHER } from '../setup/config.js';
import AbilityTemplate from './ability-template.js';
import { applyActiveEffectToActorViaId } from '../scripts/activeEffects/applyActiveEffect.js';
import { emitForGM } from '../scripts/socket/socketMessage.js';
import RepairSystem from "../item/systems/repair.js";

export default class WitcherItem extends Item {
    async _preCreate(data, options, user) {
        //global modifiers are discontinued, so no new ones should be created
        if (data.type === 'globalModifier') return false;
        await super._preCreate(data, options, user);
    }

    async createSpellVisuals(damage) {
        if (this.system.createTemplate && this.system.templateType && this.system.templateSize) {
            AbilityTemplate.fromItem(this)
                ?.drawPreview()
                .then(templates => {
                    if (this.system.regionProperties.createRegionFromTemplate) {
                        this.createRegionFromTemplates(templates, damage);
                    }

                    return templates;
                })
                .then(templates => this.deleteSpellVisualEffect(templates))
                .catch(() => {});
        }
    }

    async deleteSpellVisualEffect(templates) {
        if (templates && this.system.visualEffectDuration > 0) {
            setTimeout(() => {
                canvas.scene.deleteEmbeddedDocuments(
                    'MeasuredTemplate',
                    templates.map(effect => effect.id)
                );
            }, this.system.visualEffectDuration * 1000);
        }
    }

    async createRegionFromTemplateUuids(templateUuids, damage) {
        this.createRegionFromTemplates(
            templateUuids.map(uuid => fromUuidSync(uuid)),
            damage
        );
    }

    async createRegionFromTemplates(templates, damage) {
        if (!game.user.isGM) {
            emitForGM('createRegionFromTemplateUuids', [this.uuid, templates.map(template => template.uuid), damage]);
            return;
        }
        templates.forEach(async template => {
            let origShape = template.object.shape ?? template.object._computeShape();
            let points = origShape.points ?? origShape.toPolygon().points;
            let shape = {
                hole: false,
                type: 'polygon',
                points: points.map((pt, ind) => (ind % 2 ? pt + template.y : pt + template.x))
            };

            let behaviors = [];
            if (this.system.regionProperties.applyMacroOnEnter) {
                let behavior = {
                    name: 'Execute Macro on Enter',
                    type: 'executeMacro',
                    system: {
                        events: ['tokenEnter'],
                        uuid: this.system.regionProperties.applyMacroOnEnter
                    }
                };
                behaviors.push(behavior);
            }

            let regions = await game.scenes.active.createEmbeddedDocuments('Region', [
                {
                    name: this.name,
                    shapes: [shape],
                    behaviors: behaviors,
                    flags: {
                        TheWitcherTRPG: {
                            item: this,
                            itemUuid: this.uuid,
                            duration: damage.duration,
                            actorUuid: this.parent.uuid
                        }
                    }
                }
            ]);

            regions.forEach(region => region.update({ visibility: 2 }));
        });
    }

    getItemAttackSkill() {
        return {
            name: this.system.attackSkill,
            alias: WITCHER.skillMap[this.system.attackSkill].label
        };
    }

    getAttackSkillFlags() {
        return {
            origin: {
                name: this.name,
                uuid: this.uuid
            },
            attackSkill: this.system.attackSkill,
            item: this,
            owner: this.parent.uuid
        };
    }

    getSpellFlags() {
        return {
            origin: {
                name: this.name,
                uuid: this.uuid
            },
            spell: this,
            item: this,
            owner: this.parent.uuid
        };
    }

    doesWeaponNeedMeleeSkillToAttack() {
        if (this.system.attackSkill) {
            //Check whether item attack skill is melee
            //Since actor can throw bombs relying on Athletic which is also a melee attack skill
            //We need specific logic for bomb throws
            let meleeSkill = WITCHER.meleeSkills.includes(this.system.attackSkill);
            let rangedSkill = WITCHER.rangedSkills.includes(this.system.attackSkill);

            if (meleeSkill && rangedSkill) {
                return meleeSkill && !this.system.usingAmmo && !this.system.isThrowable;
            } else {
                return meleeSkill;
            }
        }
    }

    isAlchemicalCraft() {
        return this.system.alchemyDC && this.system.alchemyDC > 0;
    }

    isWeaponThrowable() {
        return this.system.isThrowable;
    }

    populateAlchemyCraftComponentsList() {
        class alchemyComponent {
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
            new alchemyComponent(
                'vitriol',
                game.i18n.localize('WITCHER.Inventory.Vitriol'),
                `<img src="systems/TheWitcherTRPG/assets/images/vitriol.png" class="substance-img" /> <b>${this.system.alchemyComponents.vitriol}</b>`,
                this.system.alchemyComponents.vitriol > 0 ? this.system.alchemyComponents.vitriol : 0
            )
        );
        alchemyCraftComponents.push(
            new alchemyComponent(
                'rebis',
                game.i18n.localize('WITCHER.Inventory.Rebis'),
                `<img src="systems/TheWitcherTRPG/assets/images/rebis.png" class="substance-img" /> <b>${this.system.alchemyComponents.rebis}</b>`,
                this.system.alchemyComponents.rebis > 0 ? this.system.alchemyComponents.rebis : 0
            )
        );
        alchemyCraftComponents.push(
            new alchemyComponent(
                'aether',
                game.i18n.localize('WITCHER.Inventory.Aether'),
                `<img src="systems/TheWitcherTRPG/assets/images/aether.png" class="substance-img" /> <b>${this.system.alchemyComponents.aether}</b>`,
                this.system.alchemyComponents.aether > 0 ? this.system.alchemyComponents.aether : 0
            )
        );
        alchemyCraftComponents.push(
            new alchemyComponent(
                'quebrith',
                game.i18n.localize('WITCHER.Inventory.Quebrith'),
                `<img src="systems/TheWitcherTRPG/assets/images/quebrith.png" class="substance-img" /> <b>${this.system.alchemyComponents.quebrith}</b>`,
                this.system.alchemyComponents.quebrith > 0 ? this.system.alchemyComponents.quebrith : 0
            )
        );
        alchemyCraftComponents.push(
            new alchemyComponent(
                'hydragenum',
                game.i18n.localize('WITCHER.Inventory.Hydragenum'),
                `<img src="systems/TheWitcherTRPG/assets/images/hydragenum.png" class="substance-img" /> <b>${this.system.alchemyComponents.hydragenum}</b>`,
                this.system.alchemyComponents.hydragenum > 0 ? this.system.alchemyComponents.hydragenum : 0
            )
        );
        alchemyCraftComponents.push(
            new alchemyComponent(
                'vermilion',
                game.i18n.localize('WITCHER.Inventory.Vermilion'),
                `<img src="systems/TheWitcherTRPG/assets/images/vermilion.png" class="substance-img" /> <b>${this.system.alchemyComponents.vermilion}</b>`,
                this.system.alchemyComponents.vermilion > 0 ? this.system.alchemyComponents.vermilion : 0
            )
        );
        alchemyCraftComponents.push(
            new alchemyComponent(
                'sol',
                game.i18n.localize('WITCHER.Inventory.Sol'),
                `<img src="systems/TheWitcherTRPG/assets/images/sol.png" class="substance-img" /> <b>${this.system.alchemyComponents.sol}</b>`,
                this.system.alchemyComponents.sol > 0 ? this.system.alchemyComponents.sol : 0
            )
        );
        alchemyCraftComponents.push(
            new alchemyComponent(
                'caelum',
                game.i18n.localize('WITCHER.Inventory.Caelum'),
                `<img src="systems/TheWitcherTRPG/assets/images/caelum.png" class="substance-img" /> <b>${this.system.alchemyComponents.caelum}</b>`,
                this.system.alchemyComponents.caelum > 0 ? this.system.alchemyComponents.caelum : 0
            )
        );
        alchemyCraftComponents.push(
            new alchemyComponent(
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
                Item.create(craftedItem, { parent: this.actor });
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

    async consume() {
        let properties = this.system.consumeProperties;
        let messageInfos = {};
        if (properties.doesHeal) {
            let heal = parseInt(await this.calculateHealValue(properties.heal, this.actor));
            this.actor?.update({ 'system.derivedStats.hp.value': this.actor.system.derivedStats.hp.value + heal });
            messageInfos.heal = heal;
        }

        if (properties.appliesGlobalModifier) {
            properties.consumeGlobalModifiers.forEach(modifier => this.actor._activateGlobalModifier(modifier));
        }

        this.applyStatus(this.actor, properties.effects);
        applyActiveEffectToActorViaId(this.actor.uuid, this.uuid, 'applySelf');
        this.createConsumeMessage(messageInfos);
    }

    async calculateHealValue(value, actor) {
        let heal = value;
        if (value.includes && value.includes('d')) {
            heal = (await new Roll(value).evaluate()).total;
        }
        return parseInt(actor?.system.derivedStats.hp.value) + parseInt(heal) > actor?.system.derivedStats.hp.max
            ? parseInt(actor?.system.derivedStats.hp.max) - parseInt(actor?.system.derivedStats.hp.value)
            : heal;
    }

    async applyStatus(actor, effects) {
        effects.forEach(effect => {
            if (!actor.statuses.find(status => status == effect.statusEffect)) {
                actor.toggleStatusEffect(effect.statusEffect);
            }
        });
    }

    async createConsumeMessage(messageInfos) {
        const messageTemplate = 'systems/TheWitcherTRPG/templates/chat/item/consume.hbs';

        let statusEffects = this.system.consumeProperties.effects.map(effect => {
            return {
                name: effect.name,
                statusEffect: CONFIG.WITCHER.statusEffects.find(configEffect => configEffect.id == effect.statusEffect)
            };
        });

        const content = await renderTemplate(messageTemplate, { item: this, messageInfos, statusEffects });
        const chatData = {
            content: content,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };

        ChatMessage.create(chatData);
    }

    async repair() {
        await RepairSystem.process(this.actor, this)
    }

    restoreReliability() {
        RepairSystem.restoreReliability(this)
    }

    get canBeRepaired() {
        return RepairSystem.canBeRepaired(this)
    }
}

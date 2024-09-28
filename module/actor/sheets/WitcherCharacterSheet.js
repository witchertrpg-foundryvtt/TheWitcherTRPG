import WitcherActorSheet from "./WitcherActorSheet.js";
import { RollConfig } from "../../scripts/rollConfig.js";
import { extendedRoll } from "../../scripts/rolls/extendedRoll.js";

export default class WitcherCharacterSheet extends WitcherActorSheet {

    uniqueTypes = ["profession", "race"]

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["witcher", "sheet", "actor"],
            width: 1120,
            height: 600,
            template: "systems/TheWitcherTRPG/templates/sheets/actor/actor-sheet.hbs",
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
            scrollY:[".item-list"]
        });
    }

    _isUniqueItem(itemData) {
        return this.uniqueTypes.includes(itemData.type);
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".alchemy-potion").on("click", this._alchemyCraft.bind(this));
        html.find(".crafting-craft").on("click", this._craftingCraft.bind(this));
    }

    getData() {
        const context = super.getData();

        this._prepareCharacterData(context);
        this._prepareDiagramFormulas(context);
        this._prepareCrafting(context);
        this._prepareSubstances(context);
        this._prepareAlchemy(context);
        this._prepareValuables(context);

        return context;
    }

    _prepareCharacterData(context) {
        let actor = context.actor;

        context.profession = actor.getList("profession")[0];

        context.race = actor.getList("race")[0];

        context.totalStats = this.calc_total_stats(context)
        context.totalSkills = this.calc_total_skills(context)
        context.totalProfSkills = this.calc_total_skills_profession(context)
    }

    _prepareDiagramFormulas(context) {
        // Formulae
        context.diagrams = context.actor.getList("diagrams");
        context.alchemicalItemDiagrams = context.diagrams.filter(d => d.system.type == "alchemical" || !d.system.type).map(this.sanitizeDescription);
        context.potionDiagrams = context.diagrams.filter(d => d.system.type == "potion").map(this.sanitizeDescription);
        context.decoctionDiagrams = context.diagrams.filter(d => d.system.type == "decoction").map(this.sanitizeDescription);
        context.oilDiagrams = context.diagrams.filter(d => d.system.type == "oil").map(this.sanitizeDescription);

        // Diagrams
        context.enhancementDiagrams = context.diagrams.filter(d => d.system.type == "armor-enhancement").map(this.sanitizeDescription);
        context.ingredientDiagrams = context.diagrams.filter(d => d.system.type == "ingredients").map(this.sanitizeDescription);
        context.weaponDiagrams = context.diagrams.filter(d => d.system.type == "weapon").map(this.sanitizeDescription);
        context.armorDiagrams = context.diagrams.filter(d => d.system.type == "armor").map(this.sanitizeDescription);
        context.elderfolkWeaponDiagrams = context.diagrams.filter(d => d.system.type == "elderfolk-weapon").map(this.sanitizeDescription);
        context.elderfolkArmorDiagrams = context.diagrams.filter(d => d.system.type == "elderfolk-armor").map(this.sanitizeDescription);
        context.ammunitionDiagrams = context.diagrams.filter(d => d.system.type == "ammunition").map(this.sanitizeDescription);
        context.bombDiagrams = context.diagrams.filter(d => d.system.type == "bomb").map(this.sanitizeDescription);
        context.trapDiagrams = context.diagrams.filter(d => d.system.type == "traps").map(this.sanitizeDescription);
    }

    _prepareCrafting(context) {
        context.allComponents = context.actor.getList("component");
        context.craftingMaterials = context.allComponents.filter(i => i.system.type == "crafting-material" || i.system.type == "component");
        context.ingotsAndMinerals = context.allComponents.filter(i => i.system.type == "minerals");
        context.hidesAndAnimalParts = context.allComponents.filter(i => i.system.type == "animal-parts");
    }

    _prepareAlchemy(context) {
        let items = context.items;
        context.alchemicalItems = items.filter(i => (i.type == "valuable" && i.system.type == "alchemical-item") || (i.type == "alchemical" && i.system.type == "alchemical"));
        context.witcherPotions = items.filter(i => i.type == "alchemical" && (i.system.type == "decoction" || i.system.type == "potion"));
        context.oils = items.filter(i => i.type == "alchemical" && i.system.type == "oil");
        context.alchemicalTreatments = items.filter(i => i.type == "component" && i.system.type == "alchemical");
        context.mutagens = items.filter(i => i.type == "mutagen");
    }

    _prepareSubstances(context) {
        let actor = context.actor;

        context.substancesVitriol = actor.getSubstance("vitriol");
        context.vitriolCount = context.substancesVitriol.sum("quantity");
        context.substancesRebis = actor.getSubstance("rebis");
        context.rebisCount = context.substancesRebis.sum("quantity");
        context.substancesAether = actor.getSubstance("aether");
        context.aetherCount = context.substancesAether.sum("quantity");
        context.substancesQuebrith = actor.getSubstance("quebrith");
        context.quebrithCount = context.substancesQuebrith.sum("quantity");
        context.substancesHydragenum = actor.getSubstance("hydragenum");
        context.hydragenumCount = context.substancesHydragenum.sum("quantity");
        context.substancesVermilion = actor.getSubstance("vermilion");
        context.vermilionCount = context.substancesVermilion.sum("quantity");
        context.substancesSol = actor.getSubstance("sol");
        context.solCount = context.substancesSol.sum("quantity");
        context.substancesCaelum = actor.getSubstance("caelum");
        context.caelumCount = context.substancesCaelum.sum("quantity");
        context.substancesFulgur = actor.getSubstance("fulgur");
        context.fulgurCount = context.substancesFulgur.sum("quantity");
    }

    _prepareValuables(context) {
        let items = context.items;
        context.valuables = items.filter(i => i.type == "valuable");

        context.clothingAndContainers = context.valuables.filter(i => i.system.type == "clothing" || i.system.type == "containers");
        context.general = context.valuables.filter(i => i.system.type == "genera" || i.system.type == "general" || !i.system.type);
        context.foodAndDrinks = context.valuables.filter(i => i.system.type == "food-drink");
        context.toolkits = context.valuables.filter(i => i.system.type == "toolkit");
        context.questItems = context.valuables.filter(i => i.system.type == "quest-item");

        context.mounts = items.filter(i => i.type == "mount");
        context.mountAccessories = items.filter(i => i.type == "valuable" && i.system.type == "mount-accessories");
    }

    async _alchemyCraft(event) {
        let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
        let itemId = event.currentTarget.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);

        let content = `<label>${game.i18n.localize("WITCHER.Dialog.Crafting")} ${item.name}</label> <br />`;

        let messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `<h1>Crafting</h1>`,
        }

        let areCraftComponentsEnough = true;

        content += `<div class="components-display">`
        let alchemyCraftComponents = item.populateAlchemyCraftComponentsList();
        alchemyCraftComponents
            .filter(a => a.quantity > 0)
            .forEach(a => {
                content += `<div class="flex">${a.content}</div>`

                let ownedSubstance = this.actor.getSubstance(a.name)
                console.log(ownedSubstance)
                let ownedSubstanceCount = ownedSubstance.sum("quantity")
                if (ownedSubstanceCount < Number(a.quantity)) {
                    let missing = a.quantity - ownedSubstanceCount
                    content += `<span class="error-display">${game.i18n.localize("WITCHER.Dialog.NoComponents")}: ${missing} ${a.alias}</span><br />`
                    areCraftComponentsEnough = false
                }
            });
        content += `</div>`

        content += `<label>${game.i18n.localize("WITCHER.Dialog.CraftingDiagram")}: <input type="checkbox" name="hasDiagram"></label> <br />`
        content += `<label>${game.i18n.localize("WITCHER.Dialog.RealCrafting")}: <input type="checkbox" name="realCraft"></label> <br />`

        new Dialog({
            title: `${game.i18n.localize("WITCHER.Dialog.AlchemyTitle")}`,
            content,
            buttons: {
                Craft: {
                    label: `${game.i18n.localize("WITCHER.Dialog.ButtonCraft")}`,
                    callback: async html => {
                        let stat = this.actor.system.stats.cra.current;
                        let statName = game.i18n.localize(this.actor.system.stats.cra.label);
                        let skill = this.actor.system.skills.cra.alchemy.value;
                        let skillName = game.i18n.localize(this.actor.system.skills.cra.alchemy.label);
                        let hasDiagram = html.find("[name=hasDiagram]").prop("checked");
                        let realCraft = html.find("[name=realCraft]").prop("checked");
                        skillName = skillName.replace(" (2)", "");
                        messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.CraftingAlchemycal")}</h1>`,
                            messageData.flavor += `<label>${game.i18n.localize("WITCHER.Dialog.Crafting")}:</label> <b>${item.name}</b> <br />`,
                            messageData.flavor += `<label>${game.i18n.localize("WITCHER.Dialog.after")}:</label> <b>${item.system.craftingTime}</b> <br />`,
                            messageData.flavor += `${game.i18n.localize("WITCHER.Diagram.alchemyDC")} ${item.system.alchemyDC}`;

                        if (!item.isAlchemicalCraft()) {
                            stat = this.actor.system.stats.cra.current;
                            skill = this.actor.system.skills.cra.crafting.value;
                            messageData.flavor = `${game.i18n.localize("WITCHER.Diagram.craftingDC")} ${item.system.craftingDC}`;
                        }

                        let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${statName}]+${skill}[${skillName}]`;

                        if (hasDiagram) {
                            rollFormula += !displayRollDetails ? `+2` : `+2[${game.i18n.localize("WITCHER.Dialog.Diagram")}]`
                        }

                        rollFormula += this.actor.addAllModifiers("alchemy")

                        let config = new RollConfig();
                        config.showCrit = true
                        config.showSuccess = true
                        config.threshold = item.system.alchemyDC
                        config.thresholdDesc = skillName
                        config.messageOnSuccess = game.i18n.localize("WITCHER.craft.ItemsSuccessfullyCrafted")
                        config.messageOnFailure = game.i18n.localize("WITCHER.craft.ItemsNotCrafted")

                        if (realCraft) {
                            if (areCraftComponentsEnough) {
                                item.realCraft(rollFormula, messageData, config);
                            } else {
                                return ui.notifications.error(game.i18n.localize("WITCHER.Dialog.NoComponents") + " " + item.system.associatedItem.name)
                            }
                        } else {
                            // Craft without automatic removal components and without real crafting of an item
                            await extendedRoll(rollFormula, messageData, config)
                        }
                    }
                }
            }
        }).render(true)
    }

    async _craftingCraft(event) {
        let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
        let itemId = event.currentTarget.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);

        let content = `<label>${game.i18n.localize("WITCHER.Dialog.Crafting")} ${item.name}</label> <br />`;

        let messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `<h1>Crafting</h1>`,
        }

        let areCraftComponentsEnough = true;
        content += `<div class="components-display">`
        item.system.craftingComponents.forEach(craftingComponent => {

            content += `<div class="flex"><b>${craftingComponent.name}</b>(${craftingComponent.quantity}) </div>`

            let ownedComponent = this.actor.findNeededComponent(craftingComponent.name);

            console.log(ownedComponent)

            let componentQuantity = ownedComponent.sum("quantity");

            if (componentQuantity < Number(craftingComponent.quantity)) {
                let missing = craftingComponent.quantity - Number(componentQuantity)
                areCraftComponentsEnough = false;
                content += `<span class="error-display">${game.i18n.localize("WITCHER.Dialog.NoComponents")}: ${missing} ${craftingComponent.name}</span><br />`
            }

        });
        content += `</div>`

        content += `<label>${game.i18n.localize("WITCHER.Dialog.CraftingDiagram")}: <input type="checkbox" name="hasDiagram"></label> <br />`
        content += `<label>${game.i18n.localize("WITCHER.Dialog.RealCrafting")}: <input type="checkbox" name="realCraft"></label> <br />`

        new Dialog({
            title: `${game.i18n.localize("WITCHER.Dialog.CraftingTitle")}`,
            content,
            buttons: {
                Craft: {
                    label: `${game.i18n.localize("WITCHER.Dialog.ButtonCraft")}`,
                    callback: async html => {
                        let stat = this.actor.system.stats.cra.current;
                        let statName = game.i18n.localize(this.actor.system.stats.cra.label);
                        let skill = this.actor.system.skills.cra.crafting.value;
                        let skillName = game.i18n.localize(this.actor.system.skills.cra.crafting.label);
                        let hasDiagram = html.find("[name=hasDiagram]").prop("checked");
                        let realCraft = html.find("[name=realCraft]").prop("checked");
                        skillName = skillName.replace(" (2)", "");
                        messageData.flavor = `<h1>${game.i18n.localize("WITCHER.Dialog.CraftingItem")}</h1>`,
                            messageData.flavor += `<label>${game.i18n.localize("WITCHER.Dialog.Crafting")}:</label> <b>${item.name}</b> <br />`,
                            messageData.flavor += `<label>${game.i18n.localize("WITCHER.Dialog.after")}:</label> <b>${item.system.craftingTime}</b> <br />`,
                            messageData.flavor += `${game.i18n.localize("WITCHER.Diagram.craftingDC")} ${item.system.craftingDC}`;

                        let rollFormula = !displayRollDetails ? `1d10+${stat}+${skill}` : `1d10+${stat}[${statName}]+${skill}[${skillName}]`;

                        if (hasDiagram) {
                            rollFormula += !displayRollDetails ? `+2` : `+2[${game.i18n.localize("WITCHER.Dialog.Diagram")}]`
                        }

                        rollFormula += this.actor.addAllModifiers("crafting")

                        let config = new RollConfig();
                        config.showCrit = true
                        config.showSuccess = true
                        config.threshold = item.system.craftingDC
                        config.thresholdDesc = skillName
                        config.messageOnSuccess = game.i18n.localize("WITCHER.craft.ItemsSuccessfullyCrafted")
                        config.messageOnFailure = game.i18n.localize("WITCHER.craft.ItemsNotCrafted")

                        if (realCraft) {
                            if (areCraftComponentsEnough) {
                                item.realCraft(rollFormula, messageData, config);
                            } else {
                                return ui.notifications.error(game.i18n.localize("WITCHER.Dialog.NoComponents") + " " + item.system.associatedItem.name)
                            }
                        } else {
                            // Craft without automatic removal components and without real crafting of an item
                            await extendedRoll(rollFormula, messageData, config)
                        }
                    }
                }
            }
        }).render(true)
    }
}
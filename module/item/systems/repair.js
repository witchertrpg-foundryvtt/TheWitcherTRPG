import { extendedRoll } from "../../scripts/rolls/extendedRoll.js";
import { RollConfig } from "../../scripts/rollConfig.js";
import { updateItem } from "../../scripts/item/updateItem.js";

const repairableItemTypes = ['weapon', 'armor']
const durabilityLocations = [
    { label: ['WITCHER.Repair.damagedLocations.weapon'], reliability: 'reliable', maxReliability: 'maxReliability' },
    { label: ['WITCHER.Armor.LocationHead'], reliability: 'headStopping', maxReliability: 'headMaxStopping' },
    { label: ['WITCHER.Armor.LocationTorso'], reliability: 'torsoStopping', maxReliability: 'torsoMaxStopping' },
    { label: ['WITCHER.Location.Left', 'WITCHER.Armor.LocationArm'], reliability: 'leftArmStopping', maxReliability: 'leftArmMaxStopping' },
    { label: ['WITCHER.Location.Right', 'WITCHER.Armor.LocationArm'], reliability: 'rightArmStopping', maxReliability: 'rightArmMaxStopping' },
    { label: ['WITCHER.Location.Left', 'WITCHER.Armor.LocationLeg'], reliability: 'leftLegStopping', maxReliability: 'leftLegMaxStopping' },
    { label: ['WITCHER.Location.Right', 'WITCHER.Armor.LocationLeg'], reliability: 'rightLegStopping', maxReliability: 'rightLegMaxStopping' },
    { label: ['WITCHER.Repair.damagedLocations.shield'], reliability: 'reliability', maxReliability: 'reliabilityMax' },
]

const repairModifier = 5
const perEnchantModifier = 2

class Repair {

    async process(actor, item) {
        const data = await this.prepareData(actor, item)
        if (data) {
            await this.renderDialog(data)
        }
    }

    async prepareData(actor, item, artisan = null) {
        const diagramId = item.system?.associatedDiagramUuid
        let diagram = diagramId ? await fromUuid(diagramId) : null
        if (!diagram) {
            ui.notifications.error(game.i18n.localize(`WITCHER.Repair.alerts.noDiagram`))
            return
        }

        let ownedComponents = []
        let missingComponents = []
        const executor = artisan ?? actor

        diagram.system.craftingComponents.forEach(craftingComponent => {
            const ownedComponent = executor.findNeededComponent(craftingComponent.name)[0]

            if (ownedComponent) {
                ownedComponents.push(ownedComponent)
            } else {
                missingComponents.push(craftingComponent)
            }
        })

        return new RepairData(
            actor,
            item,
            diagram,
            ownedComponents,
            missingComponents,
            this.prepareDamageLocationsData(item),
            artisan
        )
    }

    prepareDamageLocationsData(item) {
        return this.findDamagedLocations(item).map(loc => {
            const label = loc.label.map(l => game.i18n.localize(l)).join(' ')
            const reliabilityValue = item.system[loc.reliability]
            const maxReliabilityValue = item.system[loc.maxReliability]

            return {
                label: label,
                reliability: loc.reliability,
                reliabilityValue: reliabilityValue,
                maxReliability: loc.maxReliability,
                maxReliabilityValue: maxReliabilityValue
            }
        });
    }

    async processRequest(owner, item, artisan) {
        const data = await this.prepareData(owner, item, artisan)
        if (data) {
            data.artisan = artisan;
            await this.renderDialog(data)
        }
    }

    async renderDialog(data) {
        const template = await this.prepareDialogTemplate(data)
        const buttons = {
            Repair: {
                label: game.i18n.localize(`WITCHER.Repair.buttons.repair`),
                icon: `<i class="fas fa-hammer"></i>`,
                callback: (_) => this.repairItem(data, false)
            },
            SimRepair: {
                label: game.i18n.localize(`WITCHER.Repair.buttons.simulate`),
                icon: `<i class="fas fa-scale-balanced"></i>`,
                callback: (_) => this.repairItem(data, true)
            }
        };
        if (!data.artisan) {
            buttons['RequestRepair'] = {
                label: game.i18n.localize(`WITCHER.Repair.buttons.request`),
                icon: `<i class="fas fa-coins"></i>`,
                callback: (_) => this.requestRepair(data)
            }
        }

        new Dialog({
            title: `${game.i18n.localize('WITCHER.Repair.dialog.title')} ${data.item.name}`,
            content: template,
            buttons: buttons
        }).render(true)
    }

    async prepareDialogTemplate(data) {
        let templateData = {
            ownedComponents: [],
            missingComponents: [],
            data: data
        };

        data.ownedComponents.forEach(oc => {
            const missingQuanitity = oc.system.quantity < 1 ? 1 : 0

            templateData.ownedComponents.push({
                component: oc,
                quantity: oc.system.quantity,
                missingQuantity: missingQuanitity,
            })
        })

        data.missingComponents.forEach(oc => {
            templateData.missingComponents.push({
                component: oc,
                quantity: 0,
                missingQuantity: 1,
            })
        })

        return await renderTemplate("systems/TheWitcherTRPG/templates/dialog/repair-dialog.hbs", templateData)
    }

    async repairItem(data, simulate) {
        if (!simulate) {
            if (data.missingComponents.length) {
                return ui.notifications.error(game.i18n.localize('WITCHER.Repair.alerts.notEnoughComponents'))
            }
            if (!data.damagedLocations.length) {
                return ui.notifications.warn(game.i18n.localize('WITCHER.Repair.alerts.itemIsAlreadyRepaired'))
            }
        }

        const rollFormula = this.prepareRollFormula(data)

        let config = this.prepareRollConfig(data)
        let messageData = await this.initMessageData(data)

        let roll = await extendedRoll(rollFormula, messageData, config)
        const success = roll.total > config.threshold

        if (!simulate) {
            this._doRepair(data, success)
        }

        roll.toMessage(messageData)
    }

    prepareRollFormula(data) {
        const stat = data.executor.system.stats.cra.current;
        const statName = game.i18n.localize(data.executor.system.stats.cra.label);

        const skill = data.executor.system.skills.cra.crafting.value;

        const displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails");

        let rollFormula = displayRollDetails
            ? `1d10+${stat}[${statName}]+${skill}[${data.skillName}]`
            : `1d10 + ${stat}`;
        rollFormula += data.executor.addAllModifiers("crafting")

        return rollFormula
    }

    prepareRollConfig(data, reliabilityToRestore) {
        let config = new RollConfig()

        config.showCrit = true
        config.showSuccess = true
        config.showResult = false
        config.threshold = data.repairDC
        config.thresholdDesc = data.skillName
        config.messageOnSuccess = game.i18n.localize('WITCHER.Repair.result.success')
        config.messageOnFailure = game.i18n.localize('WITCHER.Repair.result.failed')

        return config
    }

    async initMessageData(data) {
        const template = await this.renderChatTemplate(data, false)

        return {
            speaker: ChatMessage.getSpeaker({ actor: data.executor }),
            flavor: template
        }
    }

    async renderChatTemplate(data, isRequest) {
        return await renderTemplate("systems/TheWitcherTRPG/templates/chat/item/repair.hbs", {
            data: data,
            isRequest: isRequest,
            showComponents: data.ownedComponents.length || data.missingComponents.length
        });
    }

    _doRepair(data, success) {
        data.ownedComponents.forEach(c => {
            data.executor.removeItem(c._id, 1)
        })

        if (success) {
            let update = {}
            data.damagedLocations.forEach(loc => update[`system.${loc.reliability}`] = loc.maxReliabilityValue)

            updateItem(data.item, update)
        }
    }

    async requestRepair(data) {
        const content = await this.renderChatTemplate(data, true)

        const chatData = {
            content: content,
            speaker: ChatMessage.getSpeaker({ actor: data.actor }),
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };

        ChatMessage.create(chatData)
    }

    canBeRepaired(item) {
        return repairableItemTypes.includes(item.type)
            && item.system.associatedDiagramUuid
            && this.isDamaged(item)
    }

    isDamaged(item) {
        return this.findDamagedLocations(item).length > 0
    }

    findDamagedLocations(item) {
        const system = item.system

        return durabilityLocations.filter(loc => system[loc.reliability] < system[loc.maxReliability])
    }
}

class RepairData {
    constructor(actor, item, diagram, ownedComponents, missingComponents, damagedLocations, artisan = null) {
        this.actor = actor
        this.item = item
        this.diagram = diagram
        this.ownedComponents = ownedComponents
        this.missingComponents = missingComponents
        this.damagedLocations = damagedLocations
        this.artisan = artisan
    }

    get enchantsCount() {
        return this.item.system?.enhancementItemIds.filter(e => e).length
    }

    get executor() {
        return this.artisan ?? this.actor
    }

    get repairDC() {
        return this.diagram.system.craftingDC - repairModifier + this.enchantsDC
    }

    get repairDCForumulae() {
        let formulae = `${this.diagram.system.craftingDC}[${game.i18n.localize('WITCHER.Repair.params.craftingDC')}] - ${repairModifier}[${game.i18n.localize('WITCHER.Repair.params.repairMod')}]`
        const echantsCount = this.enchantsCount
        if (echantsCount) {
            formulae += ` + ${echantsCount} * ${perEnchantModifier}[${game.i18n.localize('WITCHER.Repair.params.enchants')}]`
        }

        return formulae
    }

    get enchantsDC() {
        return this.enchantsCount * perEnchantModifier
    }

    get skillName() {
        return game.i18n.localize(this.executor.system.skills.cra.crafting.label).replace(" (2)", "")
    }
}

let RepairSystem = Object.freeze(new Repair())

export default RepairSystem
import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';
import { RollConfig } from '../../scripts/rollConfig.js';
import { emitForGM } from '../../scripts/socket/socketMessage.js';
import { costEditMixin } from '../mixins/costEditMixin.js';

const DialogV2 = foundry.applications.api.DialogV2;

const repairableItemTypes = ['weapon', 'armor'];
const durabilityLocations = [
    { label: ['WITCHER.Repair.damagedLocations.weapon'], reliability: 'reliable', maxReliability: 'maxReliability' },
    { label: ['WITCHER.Armor.LocationHead'], reliability: 'headStopping', maxReliability: 'headMaxStopping' },
    { label: ['WITCHER.Armor.LocationTorso'], reliability: 'torsoStopping', maxReliability: 'torsoMaxStopping' },
    {
        label: ['WITCHER.Location.Left', 'WITCHER.Armor.LocationArm'],
        reliability: 'leftArmStopping',
        maxReliability: 'leftArmMaxStopping'
    },
    {
        label: ['WITCHER.Location.Right', 'WITCHER.Armor.LocationArm'],
        reliability: 'rightArmStopping',
        maxReliability: 'rightArmMaxStopping'
    },
    {
        label: ['WITCHER.Location.Left', 'WITCHER.Armor.LocationLeg'],
        reliability: 'leftLegStopping',
        maxReliability: 'leftLegMaxStopping'
    },
    {
        label: ['WITCHER.Location.Right', 'WITCHER.Armor.LocationLeg'],
        reliability: 'rightLegStopping',
        maxReliability: 'rightLegMaxStopping'
    },
    { label: ['WITCHER.Repair.damagedLocations.shield'], reliability: 'reliability', maxReliability: 'reliabilityMax' }
];

const repairModifier = -5;
const perEnchantModifier = 2;

class Repair {
    async process(actor, item) {
        const data = await this.prepareData(actor, item);
        if (data) {
            await this.renderDialog(data);
        }
    }

    async prepareData(actor, item, artisan = null) {
        const diagramId = item.system?.associatedDiagramUuid;
        let diagram = diagramId ? await fromUuid(diagramId) : null;
        if (!diagram) {
            ui.notifications.error(game.i18n.localize(`WITCHER.Repair.alerts.noDiagram`));
            return;
        }

        let ownedComponents = [];
        let missingComponents = [];
        let unknownComponents = [];
        const executor = artisan ?? actor;

        for (const craftingComponent of diagram.system.craftingComponents) {
            const uuid = craftingComponent.uuid;

            let component = executor.findNeededComponent(craftingComponent.name)[0];

            //component is in inventory, might have 0 quantity => checked later
            if (component) {
                ownedComponents.push(component);
            }
            //component is not in inventory
            else {
                //linked in diagram, so we can query data
                if (uuid) {
                    const component = await fromUuid(uuid);
                    missingComponents.push(component);
                } else {
                    //not linked, so user input is required later
                    unknownComponents.push(craftingComponent);
                }
            }
        }

        return new RepairData(
            actor,
            item,
            diagram,
            ownedComponents,
            missingComponents,
            unknownComponents,
            this.prepareDamageLocationsData(item),
            artisan
        );
    }

    prepareDamageLocationsData(item) {
        return this.findDamagedLocations(item).map(loc => {
            const label = loc.label.map(l => game.i18n.localize(l)).join(' ');
            const reliabilityValue = item.system[loc.reliability];
            const maxReliabilityValue = item.system[loc.maxReliability];

            return {
                label: label,
                reliability: loc.reliability,
                reliabilityValue: reliabilityValue,
                maxReliability: loc.maxReliability,
                maxReliabilityValue: maxReliabilityValue
            };
        });
    }

    async processRequest(owner, item, artisan) {
        const data = await this.prepareData(owner, item, artisan);
        if (data) {
            data.artisan = artisan;
            await this.renderDialog(data);
        }
    }

    async renderDialog(data) {
        const template = await this.prepareDialogTemplate(data);
        const buttons = [
            {
                action: 'repair',
                label: game.i18n.localize(`WITCHER.Repair.buttons.repair`),
                icon: `fas fa-hammer`,
                callback: _ =>
                    this.repairItem(data, {
                        simulate: false,
                        gmRepair: false
                    })
            },
            {
                action: 'sim-repair',
                label: game.i18n.localize(`WITCHER.Repair.buttons.simulate`),
                icon: `fas fa-scale-balanced`,
                callback: _ =>
                    this.repairItem(data, {
                        simulate: true,
                        gmRepair: false
                    })
            }
        ];
        if (!data.artisan) {
            buttons.push({
                action: 'request-repair',
                label: game.i18n.localize(`WITCHER.Repair.buttons.request`),
                icon: `fas fa-coins`,
                callback: _ => this.sendRepairInfoToChat(data, true)
            });
        } else if (game.user.isGM) {
            buttons.push({
                action: 'gm-repair',
                label: game.i18n.localize(`WITCHER.Repair.buttons.gmRepair`),
                icon: `fas fa-crown`,
                callback: _ =>
                    this.repairItem(data, {
                        simulate: true,
                        gmRepair: true
                    })
            });
        }

        await DialogV2.wait({
            modal: true,
            window: { title: `${game.i18n.localize('WITCHER.Repair.action')} ${data.item.name}` },
            content: template,
            buttons: buttons,
            render: _ => this.attachHtmlListeners((cost, data) => (data.additionalCost = cost), data)
        });
    }

    async prepareDialogTemplate(data) {
        let templateData = {
            components: [],
            data: data,
            isRequest: data.artisan !== null,
            canEditCost: game.user.isGM
        };

        data.unknownComponents.forEach(oc => {
            templateData.components.push({
                img: 'icons/svg/item-bag.svg',
                name: oc.name,
                quantity: 0,
                missingQuantity: 1,
                required: 1,
                cost: 0
            });
        });

        data.missingComponents.forEach(oc => {
            templateData.components.push({
                img: oc.img,
                name: oc.name,
                quantity: 0,
                missingQuantity: 1,
                required: 1,
                cost: oc.system?.cost ?? 0
            });
        });

        data.ownedComponents.forEach(oc => {
            const missingQuanitity = oc.system.quantity < 1 ? 1 : 0;

            templateData.components.push({
                img: oc.img,
                name: oc.name,
                quantity: oc.system.quantity,
                missingQuantity: missingQuanitity,
                required: 1,
                cost: oc.system.cost
            });
        });

        return await renderTemplate('systems/TheWitcherTRPG/templates/dialog/repair-dialog.hbs', templateData);
    }

    async repairItem(data, options) {
        if (!options.simulate) {
            if (data.missingComponents.length || data.unknownComponents.length) {
                return ui.notifications.error(game.i18n.localize('WITCHER.Repair.alerts.notEnoughComponents'));
            }
            if (!data.damagedLocations.length) {
                return ui.notifications.warn(game.i18n.localize('WITCHER.Repair.alerts.itemIsAlreadyRepaired'));
            }
        }

        if (options.gmRepair) {
            await this.gmRepair(data);
        } else {
            await this.commonRepair(data, options.simulate);
        }
    }

    async commonRepair(data, simulate) {
        const rollFormula = this.prepareRollFormula(data);

        let config = this.prepareRollConfig(data);
        let messageData = await this.initMessageData(data);

        let roll = await extendedRoll(rollFormula, messageData, config);
        const success = roll.total > config.threshold;

        if (!simulate) {
            this._doRepair(data, success);
        }

        roll.toMessage(messageData);
    }

    async gmRepair(data) {
        await this.sendRepairInfoToChat(data, false);

        this._doRestoreReliability(data.item, data.damagedLocations);
    }

    prepareRollFormula(data) {
        const stat = data.executor.system.stats.cra.value;
        const statName = game.i18n.localize(CONFIG.WITCHER.statMap.cra.label);

        const skill = data.executor.system.skills.cra.crafting.value;

        const displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        let rollFormula = displayRollDetails
            ? `1d10+${stat}[${statName}]+${skill}[${data.skillName}]`
            : `1d10 + ${stat} + ${skill}`;
        rollFormula += data.executor.addAllModifiers('crafting');

        return rollFormula;
    }

    prepareRollConfig(data, reliabilityToRestore) {
        let config = new RollConfig();

        config.showCrit = true;
        config.showSuccess = true;
        config.showResult = false;
        config.threshold = data.repairDC;
        config.thresholdDesc = data.skillName;
        config.messageOnSuccess = game.i18n.localize('WITCHER.Repair.result.success');
        config.messageOnFailure = game.i18n.localize('WITCHER.Repair.result.failure');

        return config;
    }

    async initMessageData(data) {
        const template = await this.renderChatTemplate(data, false);

        return {
            speaker: ChatMessage.getSpeaker({ actor: data.executor }),
            flavor: template,
            system: {}
        };
    }

    async renderChatTemplate(data, isRequest) {
        return await renderTemplate('systems/TheWitcherTRPG/templates/chat/item/repair.hbs', {
            data: data,
            isRequest: isRequest,
            isOrder: data.artisan !== null,
            showComponents: data.ownedComponents.length || data.missingComponents.length
        });
    }

    _doRepair(data, success) {
        data.ownedComponents.forEach(c => {
            data.executor.removeItem(c._id, 1);
        });

        if (success) {
            if (data.item.canUserModify(game.user, 'update')) {
                const updateData = this.getRestoreReliabilityData(data.damagedLocations);
                data.item.update(updateData);
            } else {
                emitForGM('restoreReliability', [data.item.uuid]);
            }
        }
    }

    async sendRepairInfoToChat(data, isRequest) {
        const content = await this.renderChatTemplate(data, isRequest);

        const chatData = {
            content: content,
            speaker: ChatMessage.getSpeaker({ actor: data.executor }),
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };

        ChatMessage.create(chatData);
    }

    canBeRepaired(item) {
        return repairableItemTypes.includes(item.type) && item.system.associatedDiagramUuid && this.isDamaged(item);
    }

    isDamaged(item) {
        return this.findDamagedLocations(item).length > 0;
    }

    findDamagedLocations(item) {
        const system = item.system;

        return durabilityLocations.filter(loc => system[loc.reliability] < system[loc.maxReliability]);
    }

    restoreReliability(item) {
        const damagedLocations = this.prepareDamageLocationsData(item);
        this._doRestoreReliability(item, damagedLocations);
    }

    _doRestoreReliability(item, damagedLocations) {
        const updateData = this.getRestoreReliabilityData(damagedLocations);
        item.update(updateData);
    }

    getRestoreReliabilityData(damagedLocations) {
        return damagedLocations.reduce((acc, loc) => {
            acc[`system.${loc.reliability}`] = loc.maxReliabilityValue;
            return acc;
        }, {});
    }
}

class RepairData {
    constructor(
        actor,
        item,
        diagram,
        ownedComponents,
        missingComponents,
        unknownComponents,
        damagedLocations,
        artisan = null
    ) {
        this.actor = actor;
        this.item = item;
        this.diagram = diagram;
        this.ownedComponents = ownedComponents;
        this.missingComponents = missingComponents;
        this.unknownComponents = unknownComponents;
        this.damagedLocations = damagedLocations;
        this.artisan = artisan;
        this.additionalCost = 0;
    }

    get enchantsCount() {
        return this.item.system?.enhancementItemIds.filter(e => e).length;
    }

    get executor() {
        return this.artisan ?? this.actor;
    }

    get repairDC() {
        return this.diagram.system.craftingDC + repairModifier + this.enchantsDC;
    }

    get repairDCFormula() {
        let formula = `${this.diagram.system.craftingDC}[${game.i18n.localize('WITCHER.Repair.params.craftingDC')}] - ${Math.abs(repairModifier)}[${game.i18n.localize('WITCHER.Repair.params.repairMod')}]`;
        const enchantsCount = this.enchantsCount;
        if (enchantsCount) {
            formula += ` + ${enchantsCount} * ${perEnchantModifier}[${game.i18n.localize('WITCHER.Repair.params.enchants')}]`;
        }

        return formula;
    }

    get enchantsDC() {
        return this.enchantsCount * perEnchantModifier;
    }

    get skillName() {
        return game.i18n.localize(CONFIG.WITCHER.skillMap.crafting.label);
    }

    get repairPrice() {
        const ownedPrice = this.ownedComponents.reduce((sum, comp) => sum + comp.system.cost, this.additionalCost);

        return this.missingComponents.reduce((sum, comp) => sum + comp.system?.cost, ownedPrice);
    }
}

Object.assign(Repair.prototype, costEditMixin);

let RepairSystem = Object.freeze(new Repair());

export default RepairSystem;

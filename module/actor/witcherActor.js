import { getRandomInt } from "../scripts/witcher.js";
import { WITCHER } from "../setup/config.js";

Array.prototype.weight = function () {

}

export default class WitcherActor extends Actor {

  prepareDerivedData() {
    super.prepareDerivedData()

    //v12 only functionality
    if (this.toggleStatusEffect) {
      let armorEffects = this.getList("armor")
        .filter(armor => armor.system.equipped)
        .map(armor => armor.system.effects)
        .flat()
        .filter(effect => effect.statusEffect)
        .map(effect => WITCHER.armorEffects.find(armorEffect => armorEffect.id == effect.statusEffect))

      armorEffects.forEach(effect => {
        if (effect.refersStatusEffect && !effect.addsResistance && !this.statuses.find(status => status == effect.id)) {
          this.toggleStatusEffect(effect.id);
        }
      });
    }

  }

  async rollItem(itemId) {
    this.sheet._onItemRoll(null, itemId)
  }

  async rollSpell(itemId) {
    this.sheet._onSpellRoll(null, itemId)
  }

  getControlledToken() {
    let tokens = game.canvas.tokens.controlled
    return tokens.length > 0 ? tokens[0].document : game.user.character?.token
  }

  getDamageFlags() {
    return {
      "witcher": { "origin": { "name": this.name } },
      "damage": true,
    }
  }

  getDefenceSuccessFlags(defenceSkill) {
    return {
      "witcher": { "origin": { "name": this.name } },
      "defenceSkill": defenceSkill,
      "defence": true,
    }
  }

  getNoDamageFlags() {
    return {
      "witcher": { "origin": { "name": this.name } },
      "damage": false,
    }
  }

  getDefenceFailFlags(defenceSkill) {
    return {
      "witcher": { "origin": { "name": this.name } },
      "defenceSkill": defenceSkill,
      "defence": false,
    }
  }

  isEnoughThrowableWeapon(item) {
    if (item.system.isThrowable) {
      let throwableItems = this.items.filter(w => w.type == "weapon" && w.name == item.name);

      let quantity = throwableItems[0].system.quantity >= 0 ?
        throwableItems[0].system.quantity :
        throwableItems.sum("quantity");
      return quantity > 0
    } else {
      return false
    }
  }

  getTotalWeight() {
    var total = 0
    this.items.forEach(item => {
      if (item.system.weight && item.system.quantity && item.system.isCarried && !item.system.isStored) {
        total += item.system.quantity * item.system.weight + (item.system.storedWeight ?? 0)
      }
    })
    return Math.ceil(total + this.calc_currency_weight())
  }

  calc_currency_weight() {
    let currency = this.system.currency;
    let totalPieces = 0;
    totalPieces += Number(currency.bizant);
    totalPieces += Number(currency.ducat);
    totalPieces += Number(currency.lintar);
    totalPieces += Number(currency.floren);
    totalPieces += Number(currency.crown);
    totalPieces += Number(currency.oren);
    totalPieces += Number(currency.falsecoin);
    return Number(totalPieces * 0.001)
  }

  getSubstance(name) {
    return this.getList("component").filter(i => i.system.type == "substances" && i.system.substanceType == name && !i.system.isStored);
  }

  getList(name) {
    return this.items.filter(i => i.type == name && !i.system.isStored)
  }

  // Find needed component in the items list based on the component name or based on the exact name of the substance in the players compendium
  // Components in the diagrams are only string fields.
  // It is possible for diagram to have component which is actually the substance
  // That is why we need to check whether specific component name could be a substance
  // Ideally we need to store some flag (substances list for diagrams) to the diagram components
  // which will indicate whether the component is substance or not.
  // Such modification may require either modification dozens of compendiums, or some additional parsers
  findNeededComponent(componentName) {
    return this.items.filter(item =>
      item.type == "component" &&
      (item.name == componentName ||
        (item.system.type == "substances" &&
          ((game.i18n.localize("WITCHER.Inventory.Vitriol") == componentName
            && item.system.substanceType == "vitriol") ||
            (game.i18n.localize("WITCHER.Inventory.Rebis") == componentName
              && item.system.substanceType == "rebis") ||
            (game.i18n.localize("WITCHER.Inventory.Aether") == componentName
              && item.system.substanceType == "aether") ||
            (game.i18n.localize("WITCHER.Inventory.Quebrith") == componentName
              && item.system.substanceType == "quebrith") ||
            (game.i18n.localize("WITCHER.Inventory.Hydragenum") == componentName
              && item.system.substanceType == "hydragenum") ||
            (game.i18n.localize("WITCHER.Inventory.Vermilion") == componentName
              && item.system.substanceType == "vermilion") ||
            (game.i18n.localize("WITCHER.Inventory.Sol") == componentName
              && item.system.substanceType == "sol") ||
            (game.i18n.localize("WITCHER.Inventory.Caelum") == componentName
              && item.system.substanceType == "caelum") ||
            (game.i18n.localize("WITCHER.Inventory.Fulgur") == componentName
              && item.system.substanceType == "fulgur"))))
    );
  }

  async removeItem(itemId, quantityToRemove) {
    let foundItem = this.items.get(itemId)
    let newQuantity = foundItem.system.quantity - quantityToRemove
    if (newQuantity <= 0) {
      await this.items.get(itemId).delete()
    } else {
      await foundItem.update({ 'system.quantity': newQuantity })
    }
  }

  getAllLocations() {
    let locations = [
      "head",
      "torso",
      "rightArm",
      "leftArm",
      "rightLeg",
      "leftLeg",
    ]

    if (this.type == "monster") {
      locations.push("tailWing")
    }

    return locations

  }

  getLocationObject(location) {
    let alias = "";
    let modifier = `+0`;
    let locationFormula;
    switch (location) {
      case "randomSpell":
      case "randomHuman":
        let randomHumanLocation = getRandomInt(10)
        switch (randomHumanLocation) {
          case 1:
            location = "head";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationHead")}`;
            locationFormula = 3;
            break;
          case 2:
          case 3:
          case 4:
            location = "torso";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
            locationFormula = 1;
            break;
          case 5:
            location = "rightArm";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
            locationFormula = 0.5;
            break;
          case 6:
            location = "leftArm";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
            locationFormula = 0.5;
            break;
          case 7:
          case 8:
            location = "rightLeg";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
            locationFormula = 0.5;
            break;
          case 9:
          case 10:
            location = "leftLeg";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
            locationFormula = 0.5;
            break;
          default:
            location = "torso";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
            locationFormula = 1;
            break;
        }
        break;
      case "randomMonster":
        let randomMonsterLocation = getRandomInt(10)
        switch (randomMonsterLocation) {
          case 1:
            location = "head";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationHead")}`;
            locationFormula = 3;
            break;
          case 2:
          case 3:
          case 4:
          case 5:
            location = "torso";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
            locationFormula = 1;
            break;
          case 6:
          case 7:
            location = "rightLeg";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Dialog.attackLimb")}`;
            locationFormula = 0.5;
            break;
          case 8:
          case 9:
            location = "leftLeg";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Dialog.attackLimb")}`;
            locationFormula = 0.5;
            break;
          case 10:
            location = "tailWing";
            alias = `${game.i18n.localize("WITCHER.Dialog.attackTail")}`;
            locationFormula = 0.5;
            break;
          default:
            location = "torso";
            alias = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
            locationFormula = 1;
            break;
        }
        break;
      case "randomSpell":
        alias = `${game.i18n.localize("WITCHER.Location.All")}`;
        break;
      case "head":
        alias = `${game.i18n.localize("WITCHER.Armor.LocationHead")}`;
        locationFormula = 3;
        modifier = `-6`;
        break;
      case "torso":
        alias = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
        locationFormula = 1;
        modifier = `-1`;
        break;
      case "rightArm":
        alias = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
        locationFormula = 0.5;
        modifier = `-3`;
        break;
      case "leftArm":
        alias = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Armor.LocationArm")}`;
        locationFormula = 0.5;
        modifier = `-3`;
        break;
      case "rightLeg":
        alias = `${game.i18n.localize("WITCHER.Armor.LocationRight")} ${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
        locationFormula = 0.5;
        modifier = `-2`;
        break;
      case "leftLeg":
        alias = `${game.i18n.localize("WITCHER.Armor.LocationLeft")} ${game.i18n.localize("WITCHER.Armor.LocationLeg")}`;
        locationFormula = 0.5;
        modifier = `-2`;
        break;
      case "tailWing":
        alias = `${game.i18n.localize("WITCHER.Dialog.attackTail")}`;
        locationFormula = 0.5;
        break;
      default:
        alias = `${game.i18n.localize("WITCHER.Armor.LocationTorso")}`;
        locationFormula = 1;
        modifier = `-1`;
        break;
    }

    return {
      name: location,
      alias: alias,
      locationFormula: locationFormula,
      modifier: modifier
    };
  }
}
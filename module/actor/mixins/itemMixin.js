import { buttonDialog, extendedRoll } from "../../scripts/chat.js";
import { rollDamage } from "../../scripts/attack.js";
import { addAllModifiers, getArmorEcumbrance } from "../../scripts/witcher.js";
import { RollConfig } from "../../scripts/rollConfig.js";

export let itemMixin = {

  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

    if (this._isUniqueItem(itemData)) {
      await this._removeItemsOfType(itemData.type)
    }

    // dragData should exist for WitcherActorSheet, WitcherItemSheet.
    // It is populated during the activateListeners phase
    let witcherDragData = event.dataTransfer.getData("text/plain")
    let dragData = witcherDragData ? JSON.parse(witcherDragData) : data;

    // handle itemDrop prepared in WitcherActorSheet, WitcherItemSheet
    // need this to drop item from actor
    if (witcherDragData && dragData.type === "itemDrop") {
      let previousActor = game.actors.get(dragData.actor._id)
      let token = previousActor.token ?? previousActor.getActiveTokens()[0]
      if (token) {
        previousActor = token.actor
      }

      if (previousActor == this.actor) {
        return;
      }

      // Calculate the rollable amount of items to be dropped from actors' inventory
      if (typeof (dragData.item.system.quantity) === 'string' && dragData.item.system.quantity.includes("d")) {
        let messageData = {
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: `<h1>Quantity of ${dragData.item.name}</h1>`,
        }
        let roll = await new Roll(dragData.item.system.quantity).evaluate({ async: true })
        roll.toMessage(messageData)

        // Add items to the recipient actor
        this._addItem(this.actor, dragData.item, Math.floor(roll.total))

        // Remove items from donor actor
        if (previousActor) {
          await previousActor.items.get(dragData.item._id).delete()
        }
        return
      }

      if (dragData.item.system.quantity != 0) {
        if (dragData.item.system.quantity > 1) {
          let content = `${game.i18n.localize("WITCHER.Items.transferMany")}: <input type="number" class="small" name="numberOfItem" value=1>/${dragData.item.system.quantity} <br />`
          let cancel = true
          let numberOfItem = 0
          let dialogData = {
            buttons: [
              [`${game.i18n.localize("WITCHER.Button.Continue")}`, (html) => {
                numberOfItem = html.find("[name=numberOfItem]")[0].value;
                cancel = false
              }],
              [`${game.i18n.localize("WITCHER.Button.All")}`, () => {
                numberOfItem = dragData.item.system.quantity
                cancel = false
              }]
            ],
            title: game.i18n.localize("WITCHER.Items.transferTitle"),
            content: content
          }
          await buttonDialog(dialogData)

          if (cancel) {
            return
          } else {
            // Remove items from donor actor
            this._removeItem(previousActor, dragData.item._id, numberOfItem)
            if (numberOfItem > dragData.item.system.quantity) {
              numberOfItem = dragData.item.system.quantity
            }
            // Add items to the recipient actor
            this._addItem(this.actor, dragData.item, numberOfItem)
          }
        } else {
          // Add item to the recipient actor
          this._addItem(this.actor, dragData.item, 1)
          // Remove item from donor actor
          if (previousActor) {
            await previousActor.items.get(dragData.item._id).delete()
          }
        }
      }
    } else if (dragData && dragData.type === "Item") {
      // Adding items from compendia
      // We do not have the same dragData object in compendia as for Actor or Item
      let itemToAdd = item

      // Somehow previous item from passed data object is empty. Let's try to get item from passed event
      if (!itemToAdd) {
        let dragEventData = TextEditor.getDragEventData(event)
        itemToAdd = await fromUuid(dragEventData.uuid)
      }

      if (itemToAdd) {
        this._addItem(this.actor, itemToAdd, 1)
      }
    } else {
      super._onDrop(event, data);
    }
  },

  _isUniqueItem(itemData) {
    return false;
  },

  async _removeItemsOfType(type) {
    let actor = this.actor;
    actor.deleteEmbeddedDocuments("Item", actor.items.filter(item => item.type === type).map(item => item.id))
  },

  async _removeItem(actor, itemId, quantityToRemove) {
    actor.removeItem(itemId, quantityToRemove)
  },

  async _addItem(actor, addItem, numberOfItem, forcecreate = false) {
    let foundItem = (actor.items).find(item => item.name == addItem.name && item.type == addItem.type);
    if (foundItem && !forcecreate && !foundItem.system.isStored) {
      await foundItem.update({ 'system.quantity': Number(foundItem.system.quantity) + Number(numberOfItem) })
    }
    else {
      let newItem = { ...addItem };

      if (numberOfItem) {
        newItem.system.quantity = Number(numberOfItem)
      }
      await actor.createEmbeddedDocuments("Item", [newItem]);
    }
  },

  async _onItemAdd(event) {
    let element = event.currentTarget
    let itemData = {
      name: `new ${element.dataset.itemtype}`,
      type: element.dataset.itemtype
    }

    switch (element.dataset.spelltype) {
      case "spellNovice":
        itemData.system = { class: "Spells", level: "novice" }
        break;
      case "spellJourneyman":
        itemData.system = { class: "Spells", level: "journeyman" }
        break;
      case "spellMaster":
        itemData.system = { class: "Spells", level: "master" }
        break;
      case "rituals":
        itemData.system = { class: "Rituals" }
        break;
      case "hexes":
        itemData.system = { class: "Hexes" }
        break;
      case "magicalgift":
        itemData.system = { class: "MagicalGift" }
        break;
    }

    if (element.dataset.itemtype == "component") {
      if (element.dataset.subtype == "alchemical") {
        itemData.system = { type: element.dataset.subtype }
      } else if (element.dataset.subtype) {
        itemData.system = { type: "substances", substanceType: element.dataset.subtype }
      } else {
        itemData.system = { type: "component", substanceType: element.dataset.subtype }
      }
    }

    if (element.dataset.itemtype == "valuable") {
      itemData.system = { type: "general" };
    }

    if (element.dataset.itemtype == "diagram") {
      itemData.system = { type: "alchemical", level: "novice", isFormulae: true };
    }

    await Item.create(itemData, { parent: this.actor })
  },

  _onItemInlineEdit(event) {
    event.preventDefault();
    event.stopPropagation()
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    let field = element.dataset.field;
    // Edit checkbox values
    let value = element.value
    if (value == "false") {
      value = true
    }
    if (value == "true" || value == "checked") {
      value = false
    }

    return item.update({ [field]: value });
  },

  _onItemEdit(event) {
    event.preventDefault();
    event.stopPropagation()
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    item.sheet.render(true)
  },

  async _onItemShow(event) {
    event.preventDefault;
    event.stopPropagation()
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    new Dialog({
      title: item.name,
      content: `<img src="${item.img}" alt="${item.img}" width="100%" />`,
      buttons: {}
    }, {
      width: 520,
      resizable: true
    }).render(true);
  },

  async _onItemDelete(event) {
    event.preventDefault();
    event.stopPropagation()
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    return await this.actor.items.get(itemId).delete();
  },

  async _chooseEnhancement(event) {
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId)
    let type = event.currentTarget.closest(".item").dataset.type;

    let content = ""
    let enhancements = this.actor.getList("enhancement")
    if (type == "weapon") {
      enhancements = enhancements.filter(e => e.system.applied == false && (e.system.type == "rune" || e.system.type == "weapon"));
    } else {
      enhancements = enhancements.filter(e => e.system.applied == false && (e.system.type == "armor" || e.system.type == "glyph"));
    }

    let quantity = enhancements.sum("quantity")
    if (quantity == 0) {
      content += `<div class="error-display">${game.i18n.localize("WITCHER.Enhancement.NoEnhancement")}</div>`
    } else {
      let enhancementsOption = ``
      enhancements.forEach(element => {
        enhancementsOption += `<option value="${element._id}"> ${element.name}(${element.system.quantity}) </option>`;
      });
      content += `<div><label>${game.i18n.localize("WITCHER.Dialog.Enhancement")}: <select name="enhancement">${enhancementsOption}</select></label></div>`
    }

    new Dialog({
      title: `${game.i18n.localize("WITCHER.Enhancement.ChooseTitle")}`,
      content,
      buttons: {
        Cancel: {
          label: `${game.i18n.localize("WITCHER.Button.Cancel")}`,
          callback: () => { }
        },
        Apply: {
          label: `${game.i18n.localize("WITCHER.Dialog.Apply")}`,
          callback: async (html) => {
            let enhancementId = undefined
            if (html.find("[name=enhancement]")[0]) {
              enhancementId = html.find("[name=enhancement]")[0].value;
            }
            if (enhancementId) {
              let newEnhancementList = item.system.enhancementItemIds;
              newEnhancementList.push(enhancementId)
              await item.update({ 'system.enhancementItemIds': newEnhancementList })

              let choosenEnhancement = this.actor.items.get(enhancementId)
              if (choosenEnhancement.system.type == "armor" || choosenEnhancement.system.type == "glyph") {
                await item.update({
                  "system.headStopping": item.system.headStopping + choosenEnhancement.system.stopping,
                  "system.headMaxStopping": item.system.headMaxStopping + choosenEnhancement.system.stopping,
                  "system.torsoStopping": item.system.torsoStopping + choosenEnhancement.system.stopping,
                  "system.torsoMaxStopping": item.system.torsoMaxStopping + choosenEnhancement.system.stopping,
                  "system.leftArmStopping": item.system.leftArmStopping + choosenEnhancement.system.stopping,
                  "system.leftArmMaxStopping": item.system.leftArmMaxStopping + choosenEnhancement.system.stopping,
                  "system.rightArmStopping": item.system.rightArmStopping + choosenEnhancement.system.stopping,
                  "system.rightArmMaxStopping": item.system.rightArmMaxStopping + choosenEnhancement.system.stopping,
                  "system.leftLegStopping": item.system.leftLegStopping + choosenEnhancement.system.stopping,
                  "system.leftLegMaxStopping": item.system.leftLegMaxStopping + choosenEnhancement.system.stopping,
                  "system.rightLegStopping": item.system.rightLegStopping + choosenEnhancement.system.stopping,
                  "system.rightLegMaxStopping": item.system.rightLegMaxStopping + choosenEnhancement.system.stopping,
                  'system.bludgeoning': choosenEnhancement.system.bludgeoning,
                  'system.slashing': choosenEnhancement.system.slashing,
                  'system.piercing': choosenEnhancement.system.piercing,
                  'system.effects': item.system.effects.concat(choosenEnhancement.system.effects)
                })
              }

              let newName = choosenEnhancement.name + "(Applied)"
              let newQuantity = choosenEnhancement.system.quantity
              await choosenEnhancement.update({
                'name': newName,
                'system.applied': true,
                'system.quantity': 1
              })
              if (newQuantity > 1) {
                newQuantity -= 1
                await this._addItem(this.actor, choosenEnhancement, newQuantity, true)
              }
            }
          }
        }
      }
    }).render(true)
  },

  _onItemDisplayInfo(event) {
    event.preventDefault();
    event.stopPropagation()
    let section = event.currentTarget.closest(".item");
    let editor = $(section).find(".item-info")
    editor.toggleClass("invisible");
  },

  async _onItemRoll(event, itemId = null) {
    let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

    if (!itemId) {
      itemId = event.currentTarget.closest(".item").dataset.itemId;
    }
    let item = this.actor.items.get(itemId);
    let displayDmgFormula = `${item.system.damage}`
    let formula = !displayRollDetails ? `${item.system.damage}` : `${item.system.damage}[${game.i18n.localize("WITCHER.Diagram.Weapon")}]`

    let isMeleeAttack = item.doesWeaponNeedMeleeSkillToAttack();
    if (this.actor.type == "character" && isMeleeAttack) {
      if (this.actor.system.attackStats.meleeBonus < 0) {
        displayDmgFormula += `${this.actor.system.attackStats.meleeBonus}`
        formula += !displayRollDetails ? `${this.actor.system.attackStats.meleeBonus}` : `${this.actor.system.attackStats.meleeBonus}[${game.i18n.localize("WITCHER.Dialog.attackMeleeBonus")}]`
      }
      if (this.actor.system.attackStats.meleeBonus > 0) {
        displayDmgFormula += `+${this.actor.system.attackStats.meleeBonus}`
        formula += !displayRollDetails ? `+${this.actor.system.attackStats.meleeBonus}` : `+${this.actor.system.attackStats.meleeBonus}[${game.i18n.localize("WITCHER.Dialog.attackMeleeBonus")}]`
      }
      formula = this.handleSpecialModifier(formula, "melee-damage")
    }

    let attackSkill = item.getItemAttackSkill();
    let messageData = {
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h1> ${game.i18n.localize("WITCHER.Dialog.attack")}: ${item.name}</h1>`,
    }

    let ammunitions = ``
    let noAmmo = 0
    let ammunitionOption = ``
    if (item.system.usingAmmo) {
      ammunitions = this.actor.items.filter(function (item) { return item.type == "weapon" && item.system.isAmmo });
      let quantity = ammunitions.sum("quantity")
      if (quantity <= 0) {
        noAmmo = 1;
      } else {
        ammunitions.forEach(element => {
          ammunitionOption += `<option value="${element._id}"> ${element.name}(${element.system.quantity}) </option>`;
        });
      }
    }

    let noThrowable = !this.actor.isEnoughThrowableWeapon(item)
    let meleeBonus = this.actor.system.attackStats.meleeBonus
    let data = { item, attackSkill, displayDmgFormula, isMeleeAttack, noAmmo, noThrowable, ammunitionOption, ammunitions, meleeBonus: meleeBonus }
    const myDialogOptions = { width: 500 }
    const dialogTemplate = await renderTemplate("systems/TheWitcherTRPG/templates/chat/weapon-attack.hbs", data)

    new Dialog({
      title: `${game.i18n.localize("WITCHER.Dialog.attackWith")}: ${item.name}`,
      content: dialogTemplate,
      buttons: {
        Roll: {
          label: `${game.i18n.localize("WITCHER.Dialog.ButtonRoll")}`,
          callback: async html => {
            let isExtraAttack = html.find("[name=isExtraAttack]").prop("checked");

            let location = html.find("[name=location]")[0].value;
            let ammunition = undefined
            if (html.find("[name=ammunition]")[0]) {
              ammunition = html.find("[name=ammunition]")[0].value;
            }

            let targetOutsideLOS = html.find("[name=targetOutsideLOS]").prop("checked");
            let outsideLOS = html.find("[name=outsideLOS]").prop("checked");
            let isFastDraw = html.find("[name=isFastDraw]").prop("checked");
            let isProne = html.find("[name=isProne]").prop("checked");
            let isPinned = html.find("[name=isPinned]").prop("checked");
            let isActivelyDodging = html.find("[name=isActivelyDodging]").prop("checked");
            let isMoving = html.find("[name=isMoving]").prop("checked");
            let isAmbush = html.find("[name=isAmbush]").prop("checked");
            let isRicochet = html.find("[name=isRicochet]").prop("checked");
            let isBlinded = html.find("[name=isBlinded]").prop("checked");
            let isSilhouetted = html.find("[name=isSilhouetted]").prop("checked");
            let customAim = html.find("[name=customAim]")[0].value;

            let range = item.system.range ? html.find("[name=range]")[0].value : null;
            let customAtt = html.find("[name=customAtt]")[0].value;
            let strike = html.find("[name=strike]")[0].value;
            let damageType = html.find("[name=damageType]")[0].value;
            let customDmg = html.find("[name=customDmg]")[0].value;
            let attacknumber = 1;

            let damage = {
              strike: strike,
              type: damageType,
              damageProperties: item.system.damageProperties
            };

            if (isExtraAttack) {
              let newSta = this.actor.system.derivedStats.sta.value - 3

              if (newSta < 0) {
                return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
              }
              this.actor.update({
                'system.derivedStats.sta.value': newSta
              });
            }

            let allEffects = foundry.utils.deepClone(item.system.damageProperties.effects)
            if (ammunition) {
              let item = this.actor.items.get(ammunition);
              let newQuantity = item.system.quantity - 1;
              item.update({ "system.quantity": newQuantity })
              allEffects.push(...item.system.damageProperties.effects)
              damage.ammunition = item;
            }

            if (item.isWeaponThrowable()) {
              let newQuantity = item.system.quantity - 1;
              if (newQuantity < 0) {
                return
              }
              item.update({ "system.quantity": newQuantity })
            }

            if (item.system.enhancementItems) {
              item.system.enhancementItems.forEach(element => {
                if (element && JSON.stringify(element) != '{}') {
                  let enhancement = this.actor.items.get(element.id);
                  allEffects.push(...enhancement.system.effects)
                }
              });
            }
            damage.effects = allEffects;

            if (strike == "fast") {
              attacknumber = 2;
            }
            for (let i = 0; i < attacknumber; i++) {
              let attFormula = "1d10"
              let damageFormula = formula;

              if (item.system.accuracy < 0) {
                attFormula += !displayRollDetails ? `${item.system.accuracy}` :
                  `${item.system.accuracy}[${game.i18n.localize("WITCHER.Weapon.Short.WeaponAccuracy")}]`
              }
              if (item.system.accuracy > 0) {
                attFormula += !displayRollDetails ? `+${item.system.accuracy}` :
                  `+${item.system.accuracy}[${game.i18n.localize("WITCHER.Weapon.Short.WeaponAccuracy")}]`
              }
              if (targetOutsideLOS) {
                attFormula += !displayRollDetails ? `-3` :
                  `-3[${game.i18n.localize("WITCHER.Dialog.attackTargetOutsideLOS")}]`;
              }
              if (outsideLOS) {
                attFormula += !displayRollDetails ? `+3` :
                  `+3[${game.i18n.localize("WITCHER.Dialog.attackOutsideLOS")}]`;
              }
              if (isExtraAttack) {
                attFormula += !displayRollDetails ? `-3` :
                  `-3[${game.i18n.localize("WITCHER.Dialog.attackExtra")}]`;
              }
              if (isFastDraw) {
                attFormula += !displayRollDetails ? `-3` :
                  `-3[${game.i18n.localize("WITCHER.Dialog.attackIsFastDraw")}]`;
              }
              if (isProne) {
                attFormula += !displayRollDetails ? `-2` :
                  `-2[${game.i18n.localize("WITCHER.Dialog.attackIsProne")}]`;
              }
              if (isPinned) {
                attFormula += !displayRollDetails ? `+4` :
                  `+4[${game.i18n.localize("WITCHER.Dialog.attackIsPinned")}]`;
              }
              if (isActivelyDodging) {
                attFormula += !displayRollDetails ? `-2` :
                  `-2[${game.i18n.localize("WITCHER.Dialog.attackIsActivelyDodging")}]`;
              }
              if (isMoving) {
                attFormula += !displayRollDetails ? `-3` :
                  `-3[${game.i18n.localize("WITCHER.Dialog.attackIsMoving")}]`;
              }
              if (isAmbush) {
                attFormula += !displayRollDetails ? `+5` :
                  `+5[${game.i18n.localize("WITCHER.Dialog.attackIsAmbush")}]`;
              }
              if (isRicochet) {
                attFormula += !displayRollDetails ? `-5` :
                  `-5[${game.i18n.localize("WITCHER.Dialog.attackIsRicochet")}]`;
              }
              if (isBlinded) {
                attFormula += !displayRollDetails ? `-3` :
                  `-3[${game.i18n.localize("WITCHER.Dialog.attackIsBlinded")}]`;
              }
              if (isSilhouetted) {
                attFormula += !displayRollDetails ? `+2` :
                  `+2[${game.i18n.localize("WITCHER.Dialog.attackIsSilhouetted")}]`;
              }
              if (customAim > 0) {
                attFormula += !displayRollDetails ? `+${customAim}` :
                  `+${customAim}[${game.i18n.localize("WITCHER.Dialog.attackCustom")}]`;
              }


              let skill = CONFIG.WITCHER.skillMap[attackSkill.name];
              attFormula += !displayRollDetails ?
                `+${this.actor.system.stats[skill.attribute.name].current}+${this.actor.system.skills[skill.attribute.name][skill.name].value}` :
                `+${this.actor.system.stats[skill.attribute.name].current}[${game.i18n.localize(skill.attribute.label)}]+${this.actor.system.skills[skill.attribute.name][skill.name].value}[${game.i18n.localize(skill.label)}]`;

              if (customAtt != "0") {
                attFormula += !displayRollDetails ? `+${customAtt}` : `+${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`;
              }

              switch (range) {
                case "pointBlank":
                  attFormula = !displayRollDetails ? `${attFormula}+5` : `${attFormula} +5[${game.i18n.localize("WITCHER.Weapon.Range")}]`;
                  break;
                case "medium":
                  attFormula = !displayRollDetails ? `${attFormula}-2` : `${attFormula} -2[${game.i18n.localize("WITCHER.Weapon.Range")}]`;
                  break;
                case "long":
                  attFormula = !displayRollDetails ? `${attFormula}-4` : `${attFormula} -4[${game.i18n.localize("WITCHER.Weapon.Range")}]`;
                  break;
                case "extreme":
                  attFormula = !displayRollDetails ? `${attFormula}-6` : `${attFormula} -6[${game.i18n.localize("WITCHER.Weapon.Range")}]`;
                  break;
              }

              if (customDmg != "0") {
                damageFormula += !displayRollDetails ? `+${customDmg}` : `+${customDmg}[${game.i18n.localize("WITCHER.Settings.Custom")}]`;
              }
              damage.formula = damageFormula

              let touchedLocation = this.actor.getLocationObject(location);
              attFormula += !displayRollDetails
                ? `${touchedLocation.modifier}`
                : `${touchedLocation.modifier}[${touchedLocation.alias}]`;
              damage.location = touchedLocation;

              if (strike == "joint" || strike == "strong") {
                attFormula = !displayRollDetails ? `${attFormula}-3` : `${attFormula} -3[${game.i18n.localize("WITCHER.Dialog.attackStrike")}]`;
              }

              attFormula = this.handleSpecialModifier(attFormula, strike)
              attFormula = addAllModifiers(this.actor, attackSkill.name, attFormula)

              messageData.flavor = `<div class="attack-message"><h1><img src="${item.img}" class="item-img" />${game.i18n.localize("WITCHER.Attack")}: ${item.name}</h1>`;
              messageData.flavor += `<span>  ${game.i18n.localize("WITCHER.Armor.Location")}: ${touchedLocation.alias} = ${touchedLocation.locationFormula} </span>`;

              messageData.flavor += `<button class="damage">${game.i18n.localize("WITCHER.table.Damage")}</button>`;
              if (item.system.rollOnlyDmg) {
                rollDamage(item, damage)
              } else {
                messageData.flags = {
                  TheWitcherTRPG: {
                    attack: item.getAttackSkillFlags(),
                    damage: damage
                  }
                }
                await extendedRoll(attFormula, messageData, new RollConfig())
              }
            }
          }
        }
      }
    }, myDialogOptions).render(true)
  },

  handleSpecialModifier(attFormula, action, additionalTag) {
    let relevantModifier = this.actor.getList("globalModifier")
      .filter(modifier => modifier.system.isActive)
      .filter(modifier => modifier.system.special?.length > 0)
      .map(modifier => modifier.system.special)
      .flat()
      .map(modifier => CONFIG.WITCHER.specialModifier.find(special => special.id == modifier.special))
      .filter(special => special.tags.includes(action))
      .filter(special => special.additionalTags?.includes(additionalTag?.toLowerCase()) ?? true)

    relevantModifier.forEach(modifier => attFormula += `${modifier.formula}[${game.i18n.localize(modifier.label)}]`)

    return attFormula;
  },

  async _onSpellRoll(event, itemId = null) {

    let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
    let damage = {};

    if (!itemId) {
      itemId = event.currentTarget.closest(".item").dataset.itemId;
    }
    let spellItem = this.actor.items.get(itemId);
    damage.item = spellItem;
    let rollFormula = `1d10`
    rollFormula += !displayRollDetails ? `+${this.actor.system.stats.will.current}` : `+${this.actor.system.stats.will.current}[${game.i18n.localize("WITCHER.StWill")}]`;
    switch (spellItem.system.class) {
      case "Witcher":
      case "Invocations":
      case "Spells":
        rollFormula += !displayRollDetails ? `+${this.actor.system.skills.will.spellcast.value}` : `+${this.actor.system.skills.will.spellcast.value}[${game.i18n.localize("WITCHER.SkWillSpellcastLable")}]`;
        rollFormula = addAllModifiers(this.actor, "spellcast", rollFormula)
        break;
      case "Rituals":
        rollFormula += !displayRollDetails ? `+${this.actor.system.skills.will.ritcraft.value}` : `+${this.actor.system.skills.will.ritcraft.value}[${game.i18n.localize("WITCHER.SkWillRitCraftLable")}]`;
        rollFormula = addAllModifiers(this.actor, "ritcraft", rollFormula)
        break;
      case "Hexes":
        rollFormula += !displayRollDetails ? `+${this.actor.system.skills.will.hexweave.value}` : `+${this.actor.system.skills.will.hexweave.value}[${game.i18n.localize("WITCHER.SkWillHexLable")}]`;
        rollFormula = addAllModifiers(this.actor, "hexweave", rollFormula)
        break;
    }

    let armorEnc = getArmorEcumbrance(this.actor)
    if (armorEnc > 0) {
      rollFormula += !displayRollDetails ? `-${armorEnc}` : `-${armorEnc}[${game.i18n.localize("WITCHER.Armor.EncumbranceValue")}]`
      rollFormula = this.handleSpecialModifier(rollFormula, "magic-armorencumbarance")
    }
    rollFormula = this.handleSpecialModifier(rollFormula, "magic")

    let staCostTotal = spellItem.system.stamina;
    let customModifier = 0;
    let isExtraAttack = false

    let content = `<label>${game.i18n.localize("WITCHER.Dialog.attackExtra")}: <input type="checkbox" name="isExtraAttack"></label> <br />`
    if (spellItem.system.staminaIsVar) {
      content += `${game.i18n.localize("WITCHER.Spell.staminaDialog")}<input class="small" name="staCost" value=1> <br />`
    }

    let focusOptions = `<option value="0"> </option>`
    let secondFocusOptions = `<option value="0" selected> </option>`

    let useFocus = false
    if (this.actor.system.focus1.value > 0) {
      focusOptions += `<option value="${this.actor.system.focus1.value}" selected> ${this.actor.system.focus1.name} (${this.actor.system.focus1.value}) </option>`;
      secondFocusOptions += `<option value="${this.actor.system.focus1.value}"> ${this.actor.system.focus1.name} (${this.actor.system.focus1.value}) </option>`;
      useFocus = true
    }
    if (this.actor.system.focus2.value > 0) {
      focusOptions += `<option value="${this.actor.system.focus2.value}"> ${this.actor.system.focus2.name} (${this.actor.system.focus2.value}) </option>`;
      secondFocusOptions += `<option value="${this.actor.system.focus2.value}"> ${this.actor.system.focus2.name} (${this.actor.system.focus2.value}) </option>`;
      useFocus = true
    }
    if (this.actor.system.focus3.value > 0) {
      focusOptions += `<option value="${this.actor.system.focus3.value}"> ${this.actor.system.focus3.name} (${this.actor.system.focus3.value}) </option>`;
      secondFocusOptions += `<option value="${this.actor.system.focus3.value}"> ${this.actor.system.focus3.name} (${this.actor.system.focus3.value}) </option>`;
      useFocus = true
    }
    if (this.actor.system.focus4.value > 0) {
      focusOptions += `<option value="${this.actor.system.focus4.value}"> ${this.actor.system.focus4.name} (${this.actor.system.focus4.value}) </option>`;
      secondFocusOptions += `<option value="${this.actor.system.focus4.value}"> ${this.actor.system.focus4.name} (${this.actor.system.focus4.value}) </option>`;
      useFocus = true
    }

    if (useFocus) {
      content += ` <label>${game.i18n.localize("WITCHER.Spell.ChooseFocus")}: <select name="focus">${focusOptions}</select></label> <br />`
      content += ` <label>${game.i18n.localize("WITCHER.Spell.ChooseExpandedFocus")}: <select name="secondFocus">${secondFocusOptions}</select></label> <br />`
    }
    content += `<label>${game.i18n.localize("WITCHER.Dialog.attackCustom")}: <input class="small" name="customMod" value=0></label> <br /><br />`;
    let cancel = true
    let focusValue = 0
    let secondFocusValue = 0

    let dialogData = {
      buttons: [
        [`${game.i18n.localize("WITCHER.Button.Continue")}`, (html) => {
          if (spellItem.system.staminaIsVar) {
            staCostTotal = html.find("[name=staCost]")[0].value;
          }
          customModifier = html.find("[name=customMod]")[0].value;
          isExtraAttack = html.find("[name=isExtraAttack]").prop("checked");
          if (html.find("[name=focus]")[0]) {
            focusValue = html.find("[name=focus]")[0].value;
          }
          if (html.find("[name=secondFocus]")[0]) {
            secondFocusValue = html.find("[name=secondFocus]")[0].value;
          }
          cancel = false
        }]],
      title: game.i18n.localize("WITCHER.Spell.MagicCost"),
      content: content
    }

    await buttonDialog(dialogData)

    if (cancel) {
      return
    }
    let origStaCost = staCostTotal

    staCostTotal -= Number(focusValue) + Number(secondFocusValue)
    if (isExtraAttack) {
      staCostTotal += 3
    }

    let useMinimalStaCost = false
    if (staCostTotal < 1) {
      useMinimalStaCost = true
      staCostTotal = 1
    }

    let newSta = this.actor.system.derivedStats.sta.value - staCostTotal
    if (newSta < 0) {
      return ui.notifications.error(game.i18n.localize("WITCHER.Spell.notEnoughSta"));
    }

    this.actor.update({
      'system.derivedStats.sta.value': newSta
    });

    let staCostDisplay = `${origStaCost}[${game.i18n.localize("WITCHER.Spell.Short.StaCost")}]`

    if (isExtraAttack) {
      staCostDisplay += ` + 3[${game.i18n.localize("WITCHER.Dialog.attackExtra")}]`
    }

    staCostDisplay += ` -${Number(focusValue) + Number(secondFocusValue)}[${game.i18n.localize("WITCHER.Actor.DerStat.Focus")}]`
    staCostDisplay += ` =  ${staCostTotal}`
    if (useMinimalStaCost) {
      staCostDisplay += `[${game.i18n.localize("WITCHER.MinValue")}]`
    }

    if (customModifier < 0) { rollFormula += !displayRollDetails ? ` ${customModifier}` : ` ${customModifier}[${game.i18n.localize("WITCHER.Settings.Custom")}]` }
    if (customModifier > 0) { rollFormula += !displayRollDetails ? ` +${customModifier}` : ` +${customModifier}[${game.i18n.localize("WITCHER.Settings.Custom")}]` }
    if (isExtraAttack) { rollFormula += !displayRollDetails ? ` -3` : ` -3[${game.i18n.localize("WITCHER.Dialog.attackExtra")}]` }

    let spellSource = ''
    switch (spellItem.system.source) {
      case "mixedElements": spellSource = "WITCHER.Spell.Mixed"; break;
      case "earth": spellSource = "WITCHER.Spell.Earth"; break;
      case "air": spellSource = "WITCHER.Spell.Air"; break;
      case "fire": spellSource = "WITCHER.Spell.Fire"; break;
      case "Water": spellSource = "WITCHER.Spell.Water"; break;
    }

    let messageData = {
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2><img src="${spellItem.img}" class="item-img" />${spellItem.name}</h2>
            <div><b>${game.i18n.localize("WITCHER.Spell.StaCost")}: </b>${staCostDisplay}</div>
            <div><b>${game.i18n.localize("WITCHER.Mutagen.Source")}: </b>${game.i18n.localize(spellSource)}</div>
            <div><b>${game.i18n.localize("WITCHER.Spell.Effect")}: </b>${spellItem.system.effect}</div>`
    }
    if (spellItem.system.range) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Range")}: </b>${spellItem.system.range}</div>`
    }
    if (spellItem.system.duration) {
      let durationText = spellItem.system.duration
      if (spellItem.system.duration.match(/\d+d\d+/g)) {
        let durationSubstrings = spellItem.system.duration.split(" ");
        let roll = await new Roll(durationSubstrings.shift()).evaluate()
        damage.duration = roll.total;

        let durationRoll = roll.toAnchor()
        durationText = durationRoll.outerHTML + " " + durationSubstrings.join(" ")
      }

      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Duration")}: </b>` + durationText + `</div>`
    }
    if (spellItem.system.defence) {
      messageData.flavor += `<div class='defense'><b>${game.i18n.localize("WITCHER.Spell.Defence")}: </b>${spellItem.system.defence}</div>`
    }
    if (spellItem.system.preparationTime) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.PrepTime")}: </b>${spellItem.system.preparationTime}</div>`
    }
    if (spellItem.system.difficultyCheck) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.DC")}: </b>${spellItem.system.difficultyCheck}</div>`
    }
    if (spellItem.system.components) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Components")}: </b>${spellItem.system.components}</div>`
    }
    if (spellItem.system.alternateComponents) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.AlternateComponents")}: </b>${spellItem.system.alternateComponents}</div>`
    }
    if (spellItem.system.liftRequirement) {
      messageData.flavor += `<div><b>${game.i18n.localize("WITCHER.Spell.Requirements")}: </b>${spellItem.system.liftRequirement}</div>`
    }

    if (spellItem.system.causeDamages) {
      let dmg = spellItem.system.damage || "0"
      if (spellItem.system.staminaIsVar) {
        dmg = this.calcStaminaMulti(origStaCost, dmg)

        spellItem.system.damageProperties.effects.forEach(effect => {
          if (effect.varEffect) {
            effect.percentage = this.calcStaminaMulti(origStaCost, effect.percentage)
          }
        })
      }

      damage.effects = spellItem.system.damageProperties.effects;
      damage.formula = dmg;

      messageData.flavor += `<button class="damage" data-img="${spellItem.img}" data-name="${spellItem.name}">${game.i18n.localize("WITCHER.table.Damage")}</button>`;
      damage.location = this.actor.getLocationObject("randomSpell")
    }

    if (spellItem.system.createsShield) {
      let shield = spellItem.system.shield || "0"
      if (spellItem.system.staminaIsVar) {
        shield = this.calcStaminaMulti(origStaCost, shield)
      }

      messageData.flavor += `<button class="shield" data-img="${spellItem.img}" data-name="${spellItem.name}" data-shield="${shield}" data-actor="${this.actor.uuid}">${game.i18n.localize("WITCHER.Spell.Short.Shield")}</button>`;
    }

    if (spellItem.system.doesHeal) {
      let heal = spellItem.system.heal || "0"
      if (spellItem.system.staminaIsVar) {
        heal = this.calcStaminaMulti(origStaCost, heal)
      }

      messageData.flavor += `<button class="heal" data-img="${spellItem.img}" data-name="${spellItem.name}" data-heal="${heal}" data-actor="${this.actor.uuid}">${game.i18n.localize("WITCHER.Spell.Short.Heal")}</button>`;
    }

    let config = new RollConfig()
    config.showCrit = true
    config.showResult = false;

    await spellItem.createSpellVisualEffectIfApplicable();
    await spellItem.deleteSpellVisualEffect();

    messageData.flags = {
      TheWitcherTRPG: {
        attack: spellItem.getSpellFlags(),
        damage: damage,
        effects: spellItem.system.damageProperties.effects
      }
    }
    let roll = await extendedRoll(rollFormula, messageData, config)
    await roll.toMessage(messageData);

    if (!roll.data.fumble) {
      await spellItem.system.globalModifiers.forEach(modifier => this._activateGlobalModifier(modifier))
    }
  },

  _onSpellDisplay(event) {
    event.preventDefault();
    let section = event.currentTarget.closest(".spell");
    this.actor.update({ [`system.pannels.${section.dataset.spelltype}IsOpen`]: !this.actor.system.pannels[section.dataset.spelltype + 'IsOpen'] });
  },

  _onSubstanceDisplay(event) {
    event.preventDefault();
    let section = event.currentTarget.closest(".substance");
    this.actor.update({ [`system.pannels.${section.dataset.subtype}IsOpen`]: !this.actor.system.pannels[section.dataset.subtype + 'IsOpen'] });
  },

  async _activateGlobalModifier(name) {
    let toActivate = this.actor.items.find(item => item.type == "globalModifier" && item.name == name)

    if (!toActivate) {
      let compendium = game.packs.get("TheWitcherTRPG.modifiers-and-conditions")
      let newGlobalModifier = await compendium.getDocuments({ name: name })
      toActivate = (await Item.create(newGlobalModifier, { parent: this.actor })).shift();
    }

    if (!toActivate || toActivate.system.isActive) return;

    toActivate.update({
      'system.isActive': true
    });
  },

  itemListener(html) {
    html.find(".add-item").on("click", this._onItemAdd.bind(this));
    html.find(".item-edit").on("click", this._onItemEdit.bind(this));
    html.find(".item-show").on("click", this._onItemShow.bind(this));
    html.find(".item-delete").on("click", this._onItemDelete.bind(this));
    html.find(".inline-edit").change(this._onItemInlineEdit.bind(this));
    html.find(".inline-edit").on("click", e => e.stopPropagation())

    html.find(".enhancement-weapon-slot").on("click", this._chooseEnhancement.bind(this));
    html.find(".enhancement-armor-slot").on("click", this._chooseEnhancement.bind(this));

    html.find(".item-weapon-display").on("click", this._onItemDisplayInfo.bind(this));
    html.find(".item-armor-display").on("click", this._onItemDisplayInfo.bind(this));
    html.find(".item-valuable-display").on("click", this._onItemDisplayInfo.bind(this));
    html.find(".item-spell-display").on("click", this._onItemDisplayInfo.bind(this));
    html.find(".item-substance-display").on("click", this._onSubstanceDisplay.bind(this));

    html.find(".spell-display").on("click", this._onSpellDisplay.bind(this));

    html.find(".item-roll").on("click", this._onItemRoll.bind(this));
    html.find(".spell-roll").on("click", this._onSpellRoll.bind(this));

    html.find(".dragable").on("dragstart", (ev) => {
      let itemId = ev.target.dataset.id
      let item = this.actor.items.get(itemId);
      ev.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          item: item,
          actor: this.actor,
          type: "itemDrop",
        }),
      )
    });

    const newDragDrop = new DragDrop({
      dragSelector: `.dragable`,
      dropSelector: `.window-content`,
      permissions: { dragstart: this._canDragStart.bind(this), drop: this._canDragDrop.bind(this) },
      callbacks: { dragstart: this._onDragStart.bind(this), drop: this._onDrop.bind(this) }
    })
    this._dragDrop.push(newDragDrop);
  }

}
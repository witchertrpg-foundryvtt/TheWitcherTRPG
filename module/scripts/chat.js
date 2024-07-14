export function addChatListeners(html) {
  html.on('click', "button.shield", onShield)
  html.on('click', "button.heal", onHeal)
  html.on('click', "a.crit-roll", onCritRoll)
}

/*
  Button Dialog
    Send an array of buttons to create a dialog that will execute specific callbacks based on button pressed.

    returns a promise (no value)

  data = {
    buttons : [[`Label`, ()=>{Callback} ], ...]
    title : `title_label`,
    content : `Html_Content`
  }
*/
export async function buttonDialog(data) {
  return await new Promise(async (resolve) => {
    let buttons = {}, dialog;

    data.buttons.forEach(([str, callback]) => {
      buttons[str] = {
        label: str,
        callback
      }
    });

    dialog = new Dialog({
      title: data.title,
      content: data.content,
      buttons,
      close: () => resolve()
    }, {
      width: 300,
    });

    await dialog._render(true);
  });
}

async function onCritRoll(event) {
  let current = event.currentTarget.parentElement.parentElement.parentElement.getElementsByClassName("dice-total")
  if (!current.length) {
    current = event.currentTarget.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("dice-total")
  }
  let isSuccess = event.currentTarget.getElementsByClassName("dice-success")
  let totalValue = Number(current[0].innerText)
  let rollResult = await new Roll("1d10x10").evaluate()
  if (isSuccess.length) {
    totalValue += Number(rollResult.total)
  } else {
    totalValue--
    totalValue -= Number(rollResult.total)
  }
  let messageData = {}
  messageData.flavor = `<h2>${game.i18n.localize("WITCHER.CritTotal")}: ${totalValue}</h2>`
  rollResult.toMessage(messageData)
}

function onShield(event) {
  let shield = event.currentTarget.getAttribute("data-shield")
  let actorUuid = event.currentTarget.getAttribute("data-actor")

  let actor = fromUuidSync(actorUuid);
  actor?.update({ 'system.derivedStats.shield.value': shield });

  let messageContent = `${actor.name} ${game.i18n.localize("WITCHER.Combat.shieldApplied")} ${shield}`;
  let messageData = {
    user: game.user.id,
    content: messageContent,
    speaker: ChatMessage.getSpeaker({ actor: actor }),
  }
  ChatMessage.create(messageData);
}

function onHeal(event) {
  let heal = parseInt(event.currentTarget.getAttribute("data-heal"))
  let actorUuid = event.currentTarget.getAttribute("data-actor")

  let actor = fromUuidSync(actorUuid);

  let target = game.user.targets[0]?.actor ?? canvas.tokens.controlled[0]?.actor ?? game.user.character
  heal = (target?.system.derivedStats.hp.value + heal) > target?.system.derivedStats.hp.max ? (target?.system.derivedStats.hp.max - target?.system.derivedStats.hp.value) : heal;
  target?.update({ 'system.derivedStats.hp.value': target.system.derivedStats.hp.value + heal });

  let messageContent = `${actor.name} ${game.i18n.format("WITCHER.Combat.healed", { heal: heal, target: target.name })}`;
  let messageData = {
    user: game.user.id,
    content: messageContent,
    speaker: ChatMessage.getSpeaker({ actor: actor }),
  }
  ChatMessage.create(messageData);
}

/**
 * @param {string} rollFormula rollFormula to apply
 * @param {*} messageData messageData to display
 * @param {RollConfig} config Configuration for Extended roll
 * @param {Flag} flags an object/array of objects of flags to be set
 */
export async function extendedRoll(rollFormula, messageData, config, flags) {
  let roll = await new Roll(rollFormula).evaluate()
  let rollTotal = Number(roll.total);

  //crit/fumble calculation
  if (config.showCrit && (isCrit(roll) || isFumble(roll))) {
    let extraRollDescription = isCrit(roll) ? `${game.i18n.localize("WITCHER.Crit")}` : `${game.i18n.localize("WITCHER.Fumble")}`;

    let critClass = config.reversal ? "dice-fail" : "dice-success"
    let fumbleClass = config.reversal ? "dice-success" : "dice-fail"
    messageData.flavor += isCrit(roll)
      ? `<div class="${critClass}"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Crit")}</div>`
      : `<div class="${fumbleClass}"><i class="fas fa-dice-d6"></i>${game.i18n.localize("WITCHER.Fumble")}</div>`;

    messageData.flavor += `<div>${rollFormula} = <b>${rollTotal}</b></div>`;

    //print crit/fumble roll
    let extraRollFormula = `1d10x10[${extraRollDescription}]`;
    let extraRoll = await new Roll(extraRollFormula).evaluate();
    let extraRollTotal = Number(extraRoll.total);
    messageData.flavor += `<div>${extraRollFormula} = <b>${extraRollTotal}</b></div>`;

    //add/subtract extra result from the original one
    extraRollFormula = `${rollTotal}[${game.i18n.localize("WITCHER.BeforeCrit")}]`;
    let data;
    if (isCrit(roll)) {
      extraRollFormula += `+${extraRollTotal}[${extraRollDescription}]`;
      rollTotal += extraRollTotal;
      data = {
        crit: true
      }
    } else {
      if (extraRollTotal >= rollTotal) {
        extraRollTotal = rollTotal;
      }
      extraRollFormula += `-${extraRollTotal}[${extraRollDescription}]`;
      rollTotal -= extraRollTotal;
      data = {
        fumble: true
      }
    }

    //print add/subtract roll info
    extraRoll = await new Roll(extraRollFormula, data).evaluate();
    roll = extraRoll;
  }

  //calculate overall success/failure for the attack/defence
  if (config.showSuccess && config.threshold >= 0) {
    let success
    if (!config.reversal) {
      success = config.defence ? roll.total >= config.threshold : roll.total > config.threshold
    } else {
      success = config.defence ? roll.total <= config.threshold : roll.total < config.threshold
    }

    let successHeader = config.thresholdDesc ? `: ${game.i18n.localize(config.thresholdDesc)}` : ""
    messageData.flavor += success
      ? `<div class="dice-success"><i>${game.i18n.localize("WITCHER.Chat.Success")}${successHeader}</i></br>${config.messageOnSuccess}</div>`
      : `<div class="dice-fail"><i>${game.i18n.localize("WITCHER.Chat.Fail")}${successHeader}</i></br>${config.messageOnFailure}</div>`;

    messageData.flags = success
      ? config.flagsOnSuccess
      : config.flagsOnFailure;
  }

  if (config.showResult) {
    let message = await roll.toMessage(messageData)
    if (flags) {
      if (Array.isArray(flags)) {
        flags.forEach(flag => message.setFlag('TheWitcherTRPG', flag.key, flag.value))
      }
      else {
        message.setFlag('TheWitcherTRPG', flags.key, flags.value)
      }
    }
  }

  return config.showResult ? roll.total : roll
}

function isCrit(roll) {
  return roll.dice[0].results[0].result == 10;
}

function isFumble(roll) {
  return roll.dice[0].results[0].result == 1;
}

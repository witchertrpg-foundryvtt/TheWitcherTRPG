/**
 * Simple handling of creating and emitting socket messages
 *
 * Use emitForGM for messages meant only for ONE gm
 * > SocketMessage.emitGM(FLAGS.<yourFlag>, {yourDataField: 'yourData'})
 *
 * To listen to these socket messages see Hooks#registerSocketListeners
 */
function _createMessage(type, data) {
    return { type, data };
}

export async function emitForGM(type, data) {
    if (!game.socket || !game.user || !game.users) return;
    if (game.user.isGM) return console.error('Active user is GM! Aborting socket message...');

    if (!game.users.activeGM) return console.error('No active GM user! One GM must be active for this action to work.');

    const message = _createMessage(type, data);
    await game.socket.emit('system.TheWitcherTRPG', message);
}

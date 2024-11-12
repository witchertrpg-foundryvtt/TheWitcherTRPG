import { emitForGM } from '../socket/socketMessage.js';

export function updateItem(item, data) {
    if(item.canUserModify(game.user, 'update')) {
        item.update(data)
    } else {
        emitForGM('updateItemByUuid', [item.uuid, data])
    }
}

export function updateItemByUuid(itemId, data) {
    const item = fromUuidSync(itemId)
    item?.update(data)
}
export default class ChatMessageData {
    constructor(actor, flavor, type = 'base', system = {}, flags = { TheWitcherTRPG: {} }) {
        this.speaker = ChatMessage.getSpeaker({ actor: actor });
        this.flavor = flavor;
        this.type = type;
        this.system = system;
        this.flags = flags;
    }

    append(messageData) {
        this.flavor += messageData.flavor;
        this.system = {
            ...this.system,
            ...messageData.system
        };
        this.flags = {
            ...this.flags,
            ...messageData.flags
        }
    }
}

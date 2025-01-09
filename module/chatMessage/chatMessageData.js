export default class ChatMessageData {
    constructor(actor, flavor, type = 'base', system = {}, flags = { TheWitcherTRPG: {} }) {
        this.speaker = ChatMessage.getSpeaker({ actor: actor });
        this.flavor = flavor;
        this.type = type;
        this.system = system;
        this.flags = flags;
    }
}

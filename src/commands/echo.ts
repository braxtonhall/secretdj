import {Command} from "@ubccpsc310/bot-base";
import {Client, Message} from "discord.js";

const echo: Command = {
    name: "echo",
    description: "Repeats a message",
    usage: "echo <message>?",
    async procedure(client: Client, message: Message, args: string[]): Promise<Message> {
        let reply;
        if (args.length > 0) {
            reply = args.join(" ");
        } else {
            reply = "... echo";
        }
        return message.channel.send(reply);
    },
};

export default echo;

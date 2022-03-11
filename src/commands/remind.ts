import {Command} from "@ubccpsc310/bot-base";
import {Client, Message} from "discord.js";
import {DatabaseController} from "../controller/DatabaseController";
import {User} from "../Types";
import {createAssignmentEmbed} from "../util/Util";
import {ConfigKey, getConfig} from "../util/Config";

const remind: Command = {
    name: "remind",
    description: "Sends reminders",
    usage: "remind <password>",
    async procedure(client: Client, message: Message, args: string[]): Promise<Message> {
        const db = DatabaseController.getInstance();
        const {guild} = message;
        const [password] = args;

        const registrationOpen = await db.isRegistrationOpen(guild.id);
        if (registrationOpen) {
            return message.reply("Attempted to send reminders before game has begun");
        }
        if (!password) {
            return message.reply("A password must be supplied to remind the game");
        }
        if (password !== getConfig(ConfigKey.password)) {
            return message.reply("Password is not correct");
        }

        const users: User[] = await db.listUsers(guild.id);
        const unfinished = users.filter((user) => !user.done);
        const futureReminders = unfinished.map(async (user) => {
            const member = guild.members.resolve(user.id);
            const recipient = await db.getUser(user.guild, user.recipient);
            return member.send({
                content: `Don't forget to make a your playlist for ${recipient.name}.\n\nWhen you're ready, just DM me the playlist.`,
                embeds: [createAssignmentEmbed(recipient)],
            });
        });
        await Promise.all(futureReminders);
        return message.reply("Secret DJ reminders sent!");
    },
};

export default remind;

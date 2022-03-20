import {Command} from "@ubccpsc310/bot-base";
import {Client, Message} from "discord.js";
import {DatabaseController} from "../controller/DatabaseController";
import {Pair, User} from "../Types";
import {createAssignmentEmbed} from "../util/Util";
import {ConfigKey, getConfig} from "../util/Config";

const start: Command = {
    name: "start",
    description: "Starts the exchange",
    usage: "start <password>",
    async procedure(client: Client, message: Message, args: string[]): Promise<Message> {
        const db = DatabaseController.getInstance();
        const {guild} = message;
        const [password] = args;

        const registrationOpen = await db.isRegistrationOpen(guild.id);
        if (!registrationOpen) {
            return message.reply("Attempted to start game when registration is closed");
        }
        if (!password) {
            return message.reply("A password must be supplied to start the game");
        }
        if (password !== getConfig(ConfigKey.password)) {
            return message.reply("Password is not correct");
        }
        await db.closeRegistration(guild.id);

        const users: User[] = await db.listUsers(guild.id);
        const assignedUsers: Pair[] = createAssignments(users);
        await Promise.all(assignedUsers.map((pair) => db.updateUser(pair.creator, true)));
        const futureAssignmentMessages = assignedUsers.map(async (pair) => {
            const {creator, recipient} = pair;
            const member = await guild.members.fetch(creator.id);
            return member.send({
                content: `It's time to start making your playlist for ${recipient.name}.\nThis _Spotify_ playlist should be at least 8 songs long!\n\nWhen you're ready, just DM me the playlist.`,
                embeds: [createAssignmentEmbed(recipient)],
            });
        });
        await Promise.all(futureAssignmentMessages);
        return message.reply("Secret DJ started!");
    },
};

function createAssignments(users: User[]): Pair[] {
    function shuffle<T>(array: T[]): T[] {
        const shuffleArray = [...array];
        for (let i = shuffleArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffleArray[i], shuffleArray[j]] = [shuffleArray[j], shuffleArray[i]];
        }
        return shuffleArray;
    }

    const shuffledUsers = shuffle(users);
    const pairs: Pair[] = [];

    for (let i = 0; i < shuffledUsers.length; i = i + 1) {
        const creator = shuffledUsers[i];
        const recipient = shuffledUsers[(i + 1) % shuffledUsers.length];
        creator.recipient = recipient.id;
        pairs.push({creator, recipient});
    }

    return pairs;
}

export default start;

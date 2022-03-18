import {Listener} from "@ubccpsc310/bot-base";
import {Client, Message} from "discord.js";
import {DatabaseController} from "../controller/DatabaseController";
import {createUserDataEmbed} from "../util/Util";
import {syncDJFeed} from "../util/syncDJFeed";

const playlist: Listener<"messageCreate"> = {
    event: "messageCreate",
    async procedure(client: Client, message: Message): Promise<void> {
        const {content, channel, author} = message;
        if (channel.type !== "DM") return;
        if (content.includes("open.spotify.com/playlist") || content.includes("youtube.com/playlist")) {
            const db = DatabaseController.getInstance();
            const guilds = await db.getGuilds(author.id);
            if (guilds.length === 0) {
                // await reply("You aren't playing Secret DJ!");
                // Just ignore it whatever
                return;
            } else if (guilds.length > 1) {
                // TODO support more than one thingy
                await message.reply("Braxton is an idiot and didn't support signing up in multiple discords yet. Go bother him.");
                return;
            }
            const [guild] = guilds;
            if (await db.isRegistrationOpen(guild)) {
                await message.reply("Secret DJ hasn't started yet! Hold on.");
                return;
            }

            // TODO confirmation

            const user = await db.getUser(guild, author.id);
            const recipient = await db.getUser(guild, user.recipient);
            recipient.playlist = content.trim();
            user.done = true;
            await db.updateUser(recipient);
            await db.updateUser(user);
            await client
                .guilds.resolve(guild)
                .members.resolve(user.recipient)
                .send({
                    content: "Your playlist is ready!",
                    embeds: [createUserDataEmbed(recipient)],
                });
            await syncDJFeed(client, recipient);
        }
    }
};

export default playlist;

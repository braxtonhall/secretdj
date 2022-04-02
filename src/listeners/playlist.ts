import {Listener, Log} from "@ubccpsc310/bot-base";
import {Client, Message} from "discord.js";
import {DatabaseController} from "../controller/DatabaseController";
import {createUserDataEmbed} from "../util/Util";
import {syncDJFeed} from "../util/syncDJFeed";

const playlist: Listener<"messageCreate"> = {
    event: "messageCreate",
    async procedure(client: Client, message: Message): Promise<void> {
        const {content, channel, author} = message;
        if (channel.type !== "DM") {
            return;
        }
        Log.debug("Got a DM from someone");
        if (content.includes("open.spotify.com/playlist") || content.includes("youtube.com/playlist")) {
            Log.debug("Got a playlist from someone");
            const db = DatabaseController.getInstance();
            const guilds = await db.getGuilds(author.id);
            if (guilds.length === 0) {
                // await reply("You aren't playing Secret DJ!");
                // Just ignore it whatever
                Log.debug("Playlist gotten from someone who is not playing Secret DJ");
                return;
            } else if (guilds.length > 1) {
                // TODO support more than one thingy
                await message.reply("Braxton is an idiot and didn't support signing up in multiple discords yet. Go bother him.");
                return;
            }
            const [guildId] = guilds;
            if (await db.isRegistrationOpen(guildId)) {
                await message.reply("Secret DJ hasn't started yet! Hold on.");
                return;
            }

            // TODO confirmation

            const user = await db.getUser(guildId, author.id);
            const recipient = await db.getUser(guildId, user.recipient);
            recipient.playlist = content.trim();
            user.done = true;
            await db.updateUser(recipient, true);
            await db.updateUser(user, true);
            const guild = await client.guilds.fetch(guildId);
            const guildRecipient = await guild.members.fetch(user.recipient);
            const embed = createUserDataEmbed(recipient);
            await guildRecipient.send({
                content: "Your playlist is ready!",
                embeds: [embed],
            });
            await author.send({
                content: "Playlist received!",
                embeds: [embed],
            });
            await syncDJFeed(client, recipient);
        }
    }
};

export default playlist;

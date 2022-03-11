import {Command, Log} from "@ubccpsc310/bot-base";
import {Client, Message} from "discord.js";
import {getUserDataFromDM} from "../util/getUserDataFromDM";
import {User} from "../Types";
import {DatabaseController} from "../controller/DatabaseController";
import {DatabaseError, TimeoutError} from "../Errors";
import {createUserDataEmbed, editButtons} from "../util/Util";
import {syncDJFeed} from "../util/syncDJFeed";

const DELAY = 3 * 60 * 1000; // 3 minutes

const enrol: Command = {
    name: "enrol",
    description: "Join Secret DJ",
    usage: "enrol",
    async procedure(client: Client, message: Message) {
        const db = DatabaseController.getInstance();
        const {author, guild, channel} = message;
        if (await db.getUser(guild.id, author.id)) {
            return channel.send("You already signed up!");
        }
        if (!(await db.isRegistrationOpen(guild.id))) {
            return channel.send("Registration is no longer open");
        }
        try {
            const getFromPrompt = (prompt: string) => getUserDataFromDM(client, author, prompt, DELAY);
            const guild = message.guild.id;
            const id = author.id;
            const playlist = "";
            const recipient = "";
            const name = await getFromPrompt("What is your **name**?");
            const rule1 = await getFromPrompt("What's the **first rule** for the playlist you want to receive?");
            const rule2 = await getFromPrompt("What's the **second rule** for the playlist you want to receive?");
            const user: User = {guild, id, name, rule1, rule2, playlist, recipient, done: false};
            await db.createUser(user);
            await author.send({
                content: "Sign up successful! I'll DM you when it is time to start.",
                embeds: [createUserDataEmbed(user)],
                components: [editButtons],
            });
            await syncDJFeed(client, user);
        } catch (err) {
            Log.error(err);
            return author.send(getErrorMessage(err));
        }

    },
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof DatabaseError) {
        return "Could not create a new user. Did you already enrol?";
    } else if (error instanceof TimeoutError) {
        return "Timeout! User not created.";
    } else {
        return "Could not create user for mysterious reasons";
    }
};

export default enrol;

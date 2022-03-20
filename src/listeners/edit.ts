import {Listener} from "@ubccpsc310/bot-base";
import {Client, Interaction} from "discord.js";
import {getUserDataFromDM} from "../util/getUserDataFromDM";
import {createUserDataEmbed, editButtons} from "../util/Util";
import {syncDJFeed} from "../util/syncDJFeed";
import {DatabaseController} from "../controller/DatabaseController";
import {DatabaseError, TimeoutError} from "../Errors";

const edit: Listener<"interactionCreate"> = {
    event: "interactionCreate",
    async procedure(client: Client, interaction: Interaction): Promise<void> {
        if (!interaction.isButton()) return;
        const {customId} = interaction;
        if (!['edit-name', 'edit-rule1', 'edit-rule2'].includes(interaction.customId)) return;
        const db = DatabaseController.getInstance();

        const guilds = await db.getGuilds(interaction.user.id);
        if (guilds.length === 0) {
            return interaction.reply("This shouldn't have been possible! Let us pretend this didn't happen.");
        }
        // TODO support more than one guild lol
        if (guilds.length > 1) {
            return interaction.reply("Braxton is an idiot and didn't support signing up in multiple discords yet. Go bother him.");
        }
        const [guildId] = guilds;

        if (!(await db.isRegistrationOpen(guildId))) {
            return interaction.reply("Rules have already been sent out and can no longer be edited");
        }

        const user = await db.getUser(guildId, interaction.user.id);

        const reply = (prompt: string) => getUserDataFromDM(client, interaction.user, () => interaction.reply(prompt));
        try {
            // TODO this isn't a great place for this stuff... "edit-name" etc need to be written in a single location
            if (customId === "edit-name") {
                user.name = await reply("Enter your new **name**");
            } else if (customId === "edit-rule1") {
                user.rule1 = await reply("Enter your **first rule** again");
            } else if (customId === "edit-rule2") {
                user.rule2 = await reply("Enter your **second rule** again");
            }
            await db.updateUser(user);
            await interaction.user.send({
                content: "Information updated!",
                embeds: [createUserDataEmbed(user)],
                components: [editButtons]
            });
            await syncDJFeed(client, user);
        } catch (err) {
            await interaction.user.send(getErrorMessage(err));
        }
    }
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof DatabaseError) {
        return "Could not edit user. Did registration close?";
    } else if (error instanceof TimeoutError) {
        return "Timeout! User not edited.";
    } else {
        return "Could not create user for mysterious reasons";
    }
};

export default edit;

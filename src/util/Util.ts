import {User, UserTransport} from "../Types";
import {MessageActionRow, MessageButton, MessageEmbed} from "discord.js";

const isUserTransport = (user: unknown): user is UserTransport => {
    if (user === null || typeof user !== "object") {
        return false;
    }
    for (const key of ["name", "rule1", "rule2", "playlist"]) {
        if (typeof user[key] !== "string") {
            return false;
        }
    }
    return user["user1"] && user["rule2"] && user["name"];
};

const toUserTransport = (user: User): UserTransport => {
    const {name, rule1, rule2, playlist} = user;
    return {name, rule1, rule2, playlist};
};

const createBaseEmbed = (user) =>
    new MessageEmbed()
        .addField('Name', user.name)
        .addField('Rule 1', user.rule1)
        .addField('Rule 2', user.rule2);

const createAssignmentEmbed = (user) =>
    createBaseEmbed(user)
        .setTitle("Here are your rules!");

const createUserDataEmbed = (user) => {
    const baseEmbed = createBaseEmbed(user);
    if (user.playlist) {
        return baseEmbed
            .setTitle("Playlist")
            .setURL(user.playlist);
    } else {
        return baseEmbed;
    }
};

const editButtons = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('edit-name')
            .setLabel('Edit Name')
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId('edit-rule1')
            .setLabel('Edit Rule 1')
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId('edit-rule2')
            .setLabel('Edit Rule 2')
            .setStyle('PRIMARY'),
    );

export {isUserTransport, toUserTransport, createUserDataEmbed, createAssignmentEmbed, editButtons};

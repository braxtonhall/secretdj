import {Client, Message, User} from "discord.js";
import {TimeoutError} from "../Errors";

const getUserDataFromDM = (client: Client, user: User, prompt: string | (() => Promise<any>), delay: number = 60000): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const stopWaitingForUser = () => client.off("messageCreate", onMessageCreation);

        // On incoming messages
        const onMessageCreation = (message: Message) => {
            // if it's a DM and from the user we care about
            if (message.channel.type === "DM" && message.author.id === user.id && !!message.content) {
                clearTimeout(timeout);
                stopWaitingForUser();
                return resolve(message.content);
            }
        };

        // After waiting too long for a user response
        const timeout = setTimeout(() => {
            stopWaitingForUser();
            return reject(new TimeoutError("Timeout!"));
        }, delay);

        client.on("messageCreate", onMessageCreation);
        if (prompt) {
            if (typeof prompt === "string") {
                return user.send(prompt);
            } else {
                return prompt();
            }
        }
    });
};

export {getUserDataFromDM};

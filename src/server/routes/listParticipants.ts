import {Next, Request, Response} from "restify";
import {toUserTransport} from "../../util/Util";
import {DatabaseController} from "../../controller/DatabaseController";
import {SecretDJTransport} from "../../Types";
import {Client} from "discord.js";


/**
 * Lists everyone in the game and their rules, and their playlist if available
 * @param req
 * @param res
 * @param next
 */
const listParticipants = (client: Client) => async (req: Request, res: Response, next: Next): Promise<void> => {
    const users = await DatabaseController.getInstance().listUsers();
    const secretDJ: SecretDJTransport = {};
    const prettySecretDJ: SecretDJTransport = {};
    for (const user of users) {
        if (!secretDJ[user.guild]) {
            secretDJ[user.guild] = [];
        }
        secretDJ[user.guild].push(toUserTransport(user));
    }
    for (const [guild, users] of Object.entries(secretDJ)) {
        const name = client.guilds.resolve(guild).name;
        prettySecretDJ[name] = users;
    }
    res.json(200, prettySecretDJ);
    return next();
}

export default listParticipants;

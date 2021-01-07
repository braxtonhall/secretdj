import {config} from "dotenv";
config();

import {DatabaseController, IDatabaseController} from "../src/controllers/DatabaseController";
import {Pair, User} from "../src/Types";
import {EmailController} from "../src/controllers/EmailController";

const DRY_RUN: boolean = false;

const notMailed = [];

(async () => {
    await DatabaseController.getInstance().forceInit();
    const databaseController: IDatabaseController = DatabaseController.getInstance();
    const users: User[] = await databaseController.listUsers();
    const confirmedUsers = users.filter((user) => user.emailConfirmed);
    const usersNotEmailed = confirmedUsers.filter((user) => notMailed.includes(user.email));
    const pairs: Pair[] = await Promise.all(usersNotEmailed.map(async (user): Promise<Pair> => ({
        creator: user,
        recipient: await databaseController.getUser(user.recipient),
    })));
    const emailController = EmailController.getInstance();
    for (const pair of pairs) {
        console.log(`Mailing ${pair.creator.email}`);
        // @ts-ignore
        if (DRY_RUN === false) {
            await emailController.sendAssignmentEmail(pair);
        }
    }
    process.exit(0);
})();

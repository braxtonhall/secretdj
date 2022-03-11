import {Listener, Log} from "@ubccpsc310/bot-base";
import {Client} from "discord.js";

const ready: Listener<"ready"> = {
    event: "ready",
    procedure(client: Client): void {
        Log.info("Bot started 👀");
    }
};

export default ready;

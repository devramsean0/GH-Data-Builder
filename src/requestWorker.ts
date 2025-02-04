import Logger from "./lib/logger.ts";
import {Octokit} from "octokit";

declare var self: Worker;

self.onmessage = (event: MessageEvent) => {
    let GH_API_KEY = "";
    switch (event.data.type) {
        case "ping":
            // Initial "Alive" message, Tells the thread-pool manager to start sending events
            GH_API_KEY = event.data.value;
            Logger.info(`[Worker] [${event.data.id}] Responded to PING`);
            postMessage({type: "pong", value: event.data.value, id: event.data.id});
            break;
        case "job":
            Logger.info(`[Worker] [${event.data.id}] Received Job for ${event.data.value.url}`)
            const gh = new Octokit({
                auth: GH_API_KEY,
                userAgent: `devramsean0/GH-Data-Builder <https://github.com/devramsean0/GH-Data-Builder>`,
            });
            event.data.value.callbackFn("");
            break;
        default:
            Logger.error(`[Worker] [${event.data.id}] Unknown event type ${event.data.type}`);
            break;
    }
}
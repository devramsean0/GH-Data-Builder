import Logger from "./lib/logger.ts";
import {Octokit} from "octokit";
import {drizzle} from "drizzle-orm/bun-sqlite";
import {usersTable} from "./db/schema.ts";
import type {InferInsertModel} from "drizzle-orm";

const db = drizzle(process.env.DB_FILE_NAME!);

declare var self: Worker;

let GH_API_KEY = "";
self.onmessage = async (event: MessageEvent) => {
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
            switch (event.data.value.type) {
                case "users":
                    await (async () => {
                        // Make API Request
                        const gh_response = await gh.request(`${event.data.value.url}?since=${event.data.value.data.since}`, {
                            headers: {
                                'X-GitHub-Api-Version': '2022-11-28'
                            }
                        })
                        // Extract new Since variable
                        if (typeof gh_response.headers.link == "undefined") {
                            Logger.warn(`[GH API] Users Link header Null`)
                        }
                        const since_match = gh_response.headers.link?.match(/since=(\d+)/);
                        const since = since_match ? since_match[1] : null;
                        // Send request back to queue
                        postMessage({
                            type: "new_job",
                            value: {
                                url: event.data.value.url,
                                type: "users",
                                data: {
                                    since: since
                                }
                            },
                            id: event.data.id,
                        })
                        // Add each user lookup to queue
                        gh_response.data.forEach((user: any) => {
                            postMessage({
                                type: "new_job",
                                value: {
                                    url: `GET /user/${user.id}`,
                                    type: "user",
                                    data: {}
                                },
                                id: event.data.id,
                            })
                        })
                        // Release Worker back to queue
                        postMessage({
                            type: "release",
                            value: {},
                            id: event.data.id
                        })
                    })();
                    break;
                case "user":
                    await (async () => {
                        // Make API Request
                        const res = await gh.request(event.data.value.url, {
                            headers: {
                                'X-GitHub-Api-Version': '2022-11-28'
                            }
                        });
                        if (res.status == 200) {
                            const data: InferInsertModel<typeof usersTable> = {
                                login: res.data.login,
                                github_id: res.data.id,
                                gravatar: res.data.gravatar_id ? 1 : 0,
                                site_admin: res.data.site_admin ? 1 : 0,
                                name: res.data.name,
                                company_name: res.data.company,
                                location: res.data.location,
                                hireable: res.data.hireable ? 1 : 0,
                                twitter_username: res.data.twitter_username,
                                public_repo_count: res.data.public_repos,
                                public_gist_count: res.data.public_gists,
                                followers_count: res.data.followers,
                                following_count: res.data.following,
                                github_created_at: res.data.created_at,
                                github_updated_at: res.data.updated_at,
                            }
                            try {
                                await db.insert(usersTable).values(data)
                                    .onConflictDoUpdate({target: usersTable.github_id, set: data})
                                    .returning();
                            } catch(e) {
                                Logger.error(`[DB] Insert Failed: ${e}`)
                            }
                        }
                        // Release Worker back to queue
                        postMessage({
                            type: "release",
                            value: {},
                            id: event.data.id
                        })
                    })();
                    break;
                default:
                    Logger.error(`[Worker] [${event.data.id}] Unknown job type ${event.data.value.type}`);
                    break;
            }
            break;
        default:
            Logger.error(`[Worker] [${event.data.id}] Unknown event type ${event.data.type}`);
            break;
    }
}
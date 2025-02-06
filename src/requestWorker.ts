import Logger from "./lib/logger.ts";
import {drizzle} from "drizzle-orm/bun-sqlite";
import {repositoriesTable, usersTable} from "./db/schema.ts";
import type {InferInsertModel} from "drizzle-orm";
import {makeGithubApiRequest, type SecondaryRatelimitInterface} from "./lib/github.ts";

const db = drizzle(process.env.DB_FILE_NAME!);
const secondaryRateLimits: SecondaryRatelimitInterface = {};

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
            Logger.info(`[Worker] [${event.data.id}] Received Job for ${event.data.value.url} with params object: ${JSON.stringify(event.data.value.data)}`)
            try {
                switch (event.data.value.type) {
                    case "users":
                        await (async () => {
                            // Make API Request
                            /* const gh_response = await gh.request(`${event.data.value.url}?since=${event.data.value.data.since}`, {
                                headers: {
                                    'X-GitHub-Api-Version': '2022-11-28'
                                }
                            }) */
                            const gh_response = await makeGithubApiRequest("GET /users", `?since=${event.data.value.data.since}`, secondaryRateLimits, event.data.id, GH_API_KEY);
                            // Extract new Since variable
                            if (typeof gh_response!.headers.get("link") == "undefined") {
                                Logger.warn(`[GH API] Users Link header Null`)
                            }
                            const since_match = gh_response!.headers.get("link")?.match(/since=(\d+)/);
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
                            gh_response!.data.forEach((user: any) => {
                                postMessage({
                                    type: "new_job",
                                    value: {
                                        url: `GET /user/`,
                                        type: "user",
                                        data: {
                                            id: user.id
                                        }
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
                            /* const res = await gh.request(event.data.value.url, {
                                headers: {
                                    'X-GitHub-Api-Version': '2022-11-28'
                                }
                            }); */
                            const gh_response = await makeGithubApiRequest("GET /user/", `${event.data.value.data.id}`, secondaryRateLimits, event.data.id, GH_API_KEY);
                            const res = gh_response!.data;
                            const data: InferInsertModel<typeof usersTable> = {
                                    login: res.login,
                                    github_id: res.id,
                                    gravatar: res.gravatar_id ? 1 : 0,
                                    site_admin: res.site_admin ? 1 : 0,
                                    name: res.name,
                                    company_name: res.company,
                                    location: res.location,
                                    hireable: res.hireable ? 1 : 0,
                                    twitter_username: res.twitter_username,
                                    public_repo_count: res.public_repos,
                                    public_gist_count: res.public_gists,
                                    followers_count: res.followers,
                                    following_count: res.following,
                                    github_created_at: res.created_at,
                                    github_updated_at: res.updated_at,
                                }
                                try {
                                    await db.insert(usersTable).values(data)
                                        .onConflictDoUpdate({target: usersTable.github_id, set: data})
                                        .returning();
                                } catch(e) {
                                    Logger.error(`[DB] Insert Failed: ${e}`)
                                }
                            // Add Repository lookup to queue
                            postMessage({
                                type: "new_job",
                                value: {
                                    url: `GET /users/`,
                                    type: "repository",
                                    data: {
                                        login: res.login,
                                        page: "repos"
                                    }
                                },
                                id: event.data.id,
                            })
                            // Release Worker back to queue
                            postMessage({
                                type: "release",
                                value: {},
                                id: event.data.id
                            })
                        })();
                        break;
                    case "repository":
                        await (async () => {
                            const gh_response = await makeGithubApiRequest("GET /users/", `${event.data.value.data.login}/${event.data.value.data.page}`, secondaryRateLimits, event.data.id, GH_API_KEY);
                            const res = gh_response!.data;
                            console.log(res)
                            const data: InferInsertModel<typeof repositoriesTable> = {
                                github_id: res.id,
                                name: res.name,
                                full_name: res.full_name,
                                user_id: res.owner.id,
                                description: res.description,
                                fork: res.fork ? 1 : 0,
                                homepage: res.homepage,
                                language: res.language,
                                fork_count: res.fork_count,
                                stargazers_count: res.stargazers_count,
                                size: res.size,
                                default_branch: res.default_branch,
                                open_issue_count: res.open_issue_count,
                                is_test: res.is_test ? 1 : 0,
                                topics: res.topics,
                                has_issues: res.has_issues ? 1 : 0,
                                has_projects: res.has_projects ? 1 : 0,
                                has_wiki: res.has_wiki ? 1 : 0,
                                has_pages: res.has_pages ? 1 : 0,
                                has_downloads: res.has_downloads ? 1 : 0,
                                has_discussions: res.has_discussions ? 1 : 0,
                                archived: res.archived ? 1 : 0,
                                disabled: res.disabled ? 1 : 0,
                                visibility: res.visibility,
                                pushed_at: res.pushed_at,
                                github_created_at: res.created_at,
                                github_updated_at: res.updated_at,
                                permissions: res.permissions,
                                role_name: res.role_name,
                                delete_branch_on_merge: res.delete_branch_on_merge ? 1 : 0,
                                subscribers_count: res.subscribers_count,
                                network_count: res.network_count,
                                code_of_conduct: res.code_of_conduct,
                                license: res.license,
                                forks_count: res.forks_count,
                                open_issues: res.open_issues,
                                watchers_count: res.watchers_count,
                                allow_forking: res.allow_forking ? 1 : 0,
                                web_commit_signoff_required: res.web_commit_signoff_required ? 1 : 0,
                                security_and_analysis: res.security_and_analysis
                            }
                            try {
                                await db.insert(repositoriesTable).values(data)
                                    .onConflictDoUpdate({target: repositoriesTable.github_id, set: data})
                                    .returning();
                            } catch(e) {
                                Logger.error(`[DB] Insert Failed: ${e}`)
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
            } catch (e) {
                Logger.error(`[Worker] [${event.data.id}] Unknown error ${e}`)
                postMessage({
                    type: "release",
                    value: {},
                    id: event.data.id,
                })
            }
            break;
        default:
            Logger.error(`[Worker] [${event.data.id}] Unknown event type ${event.data.type}`);
            break;
    }
}
import Logger from './logger';

export async function makeGithubApiRequest(baseMethod: string, formattedParams: string, secondaryRateLimits: SecondaryRatelimitInterface, id: number, apiKey: string) {
    if (secondaryRateLimits[baseMethod] == 200) {
        Logger.info(`[Worker] [${id}] Points Based Rate Limit Reached for ${baseMethod}, Waiting 1s`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        Logger.info(`[Worker] [${id}] Points Based Rate Limit Reset for ${baseMethod}`);
        secondaryRateLimits[baseMethod] = 0;
    }
    const splitMethod = baseMethod.split(" ");
    try {
        const res = await fetch(`https://api.github.com/${splitMethod[1]}${formattedParams}`, {
            method: splitMethod[0],
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
                "Authorization": `Bearer ${apiKey}`,
                "User-Agent": "devramsean0/GH-Data-Builder <https://github.com/devramsean0/GH-Data-Builder>",
            },
        })
        secondaryRateLimits[baseMethod] += 1;
        if (typeof res.headers == "undefined") {
            Logger.error(`[Worker] [${id}] [GH API] ${baseMethod} Returned Empty Headers`)
            await makeGithubApiRequest(baseMethod, formattedParams, secondaryRateLimits, id, apiKey);
        }
        switch (res.status) {
            case 200:
                return {
                    headers: res.headers,
                    data: await res.json()}
            case 403:
                if (Number(res.headers.get('x-ratelimit-remaining')) <= 500) {
                    Logger.info(`[Worker] [${id}] Rate Limit Reached for ${baseMethod}, Waiting 3600000ms`);
                    await new Promise((resolve) => setTimeout(resolve, 3600000));
                    Logger.info(`[Worker] [${id}] Rate Limit Reset for ${baseMethod}`);
                    await makeGithubApiRequest(baseMethod, formattedParams, secondaryRateLimits, id, apiKey);
                }
                break;
            case 404:
                Logger.info(`[Worker] [${id}] ${baseMethod}${formattedParams} Not Found!`)
                break
            default:
                console.log(`[Error] [${id}] ${baseMethod}${formattedParams} Unexpected Status ${res.status}`);
        }
    } catch (e) {
        Logger.error(`[Worker] [${id}] Error while fetching ${baseMethod}: ${e}`);
    }
}

export interface SecondaryRatelimitInterface {
    [key: string]: number;
}
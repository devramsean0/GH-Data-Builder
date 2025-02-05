import { Octokit } from 'octokit';
import Logger from './logger';

export async function makeGithubApiRequest(baseMethod: string, formattedParams: string, secondaryRateLimits: SecondaryRatelimitInterface, id: number, apiKey: string) {
    if (secondaryRateLimits[baseMethod] == 200) {
        Logger.info(`[Worker] [${id}] Points Based Rate Limit Reached for ${baseMethod}, Waiting 1s`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        Logger.info(`[Worker] [${id}] Points Based Rate Limit Reset for ${baseMethod}`);
        secondaryRateLimits[baseMethod] = 0;
    }
    const gh = new Octokit({
        auth: apiKey,
        userAgent: `devramsean0/GH-Data-Builder <https://github.com/devramsean0/GH-Data-Builder>`,
    });
    const res = await gh.request(`${baseMethod}${formattedParams}`, {
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
    secondaryRateLimits[baseMethod] += 1;
    switch (res.status) {
        case 200:
            return res;
        case 403:
            if (Number(res.headers['x-ratelimit-remaining']) == 3600000) {
                Logger.info(`[Worker] [${id}] Rate Limit Reached for ${baseMethod}, Waiting 1s`);
                await new Promise((resolve) => setTimeout(resolve, 60));
                Logger.info(`[Worker] [${id}] Rate Limit Reset for ${baseMethod}`);
                makeGithubApiRequest(baseMethod, formattedParams, secondaryRateLimits, id, apiKey);
            }
            return makeGithubApiRequest(baseMethod, formattedParams, secondaryRateLimits, id, apiKey);
    }
}

export interface SecondaryRatelimitInterface {
    [key: string]: number;
}
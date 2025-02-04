import 'dotenv/config';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import Logger from "./lib/logger"

const db = drizzle(process.env.DB_FILE_NAME!);
Logger.info("[DB] Connected")

// Setup Workers
const workers: Worker[] = [];
const activeWorkers: number[] = [];

// Queues
const jobs: IQueueJob[] = [];

/// Eventually, we should get the number of tokens from the DB. but for now, we just spawn 1
for (let i = 0; i < 1; i++) {
    const worker = new Worker(`${process.cwd()}/src/requestWorker.ts`);
    worker.addEventListener("message", async (event) => {
        if (event.data.type === "pong") {
            activeWorkers.push(event.data.id);
            Logger.info(`[Worker] [MAIN] [${event.data.id}] Received PONG`);
        }
    })
    worker.postMessage({type: "ping", value: process.env.GITHUB_PAT, id: i})
    const job: IQueueJob = {
        url: "GET /users",
        callbackFn: async (data) => {
            console.log("Job!")
        }
    }
    worker.postMessage({type: "job", value: JSON.parse(JSON.stringify(job)), id: i})
    Logger.info("[Workers] Spawned Worker")
    workers.push(worker)
}

interface IQueueJob {
    url: string;
    callbackFn: (data: any) => Promise<void>;
}
import 'dotenv/config';
import Logger from "./lib/logger"

// Setup Workers
const workers: Worker[] = [];
const activeWorkers: number[] = [];

// Queues
const jobs: IQueueJob[] = [
    {
        url: "GET /users",
        type: "users",
        data: {
            since: 0
        }
    }
];

function worker_allocate_job() {
    const job = jobs.shift();
    if (!job) {
        Logger.warn("[QUEUE] No Jobs available")
        return
    }
    const workerID = activeWorkers.shift();
    if (typeof workerID == "undefined") {
        Logger.warn("[QUEUE] No Workers available")
        return
    }
    workers[workerID].postMessage({
        type: "job",
        value: job,
        id: workerID
    })
}

/// Eventually, we should get the number of tokens from the DB. but for now, we just spawn 1
for (let i = 0; i < 1; i++) {
    const worker = new Worker(`${process.cwd()}/src/requestWorker.ts`);
    worker.addEventListener("message", async (event) => {
        if (event.data.type === "pong") {
            activeWorkers.push(event.data.id);
            console.log(activeWorkers);
            Logger.info(`[Worker] [MAIN] [${event.data.id}] Received PONG`);
            worker_allocate_job();
        } else if (event.data.type === "new_job") {
            jobs.push(event.data.value);
            Logger.info(`[Worker] [MAIN] [${event.data.id}] Received New Job for ${event.data.value.url}`);
        } else if (event.data.type === "release") {
            activeWorkers.push(event.data.id);
            Logger.info(`[Worker] [MAIN] [${event.data.id}] Received Release from job`);
            worker_allocate_job();
        }
    })
    worker.postMessage({type: "ping", value: process.env.GITHUB_PAT, id: i})
    Logger.info("[Workers] Spawned Worker")
    workers.push(worker)
}

interface IQueueJob {
    url: string;
    type: "users" | "repository"
    data: any
}

import { MemoryVault } from './memory.js';
import { Router } from './router.js';
import { generateId, Logger } from './utils.js';

export class TaskConductorCore {
    constructor() {
        this.memory = new MemoryVault();
        this.router = new Router();
        this.queue = [];
        this.isProcessing = false;
        this.events = {
            onStart: [],
            onProgress: [],
            onComplete: []
        };
    }

    on(event, callback) {
        if (this.events[event]) {
            this.events[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb(data));
        }
    }

    async run(input, promptTypes) {
        const taskId = generateId();
        Logger.log(`Starting task ${taskId} for input: "${input}"`);

        this.emit('onStart', { taskId, input });

        // Create subtasks for each prompt type
        const subtasks = promptTypes.map(type => ({
            id: generateId(),
            type: type.type,
            input: input,
            template: type.template
        }));

        const results = [];

        for (const subtask of subtasks) {
            Logger.log(`Processing subtask: ${subtask.type}`);
            const workers = this.router.route(subtask.type);

            let currentResult = subtask.input;

            for (const worker of workers) {
                this.emit('onProgress', {
                    taskId,
                    subtask: subtask.type,
                    worker: worker.name,
                    status: 'working'
                });

                // Execute worker process
                const output = await worker.process({ input: currentResult });
                currentResult = output;

                this.emit('onProgress', {
                    taskId,
                    subtask: subtask.type,
                    worker: worker.name,
                    status: 'done'
                });
            }

            // Final generation (mocked for now, but using the template)
            const finalContent = subtask.template(input);
            results.push({
                type: subtask.type,
                content: finalContent
            });
        }

        Logger.log(`Task ${taskId} complete`);
        this.emit('onComplete', { taskId, results });
        return results;
    }
}

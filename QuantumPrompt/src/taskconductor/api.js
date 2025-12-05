import { TaskConductorCore } from './core.js';

const core = new TaskConductorCore();

export const TaskConductor = {
    run: (input, promptTypes) => core.run(input, promptTypes),
    on: (event, callback) => core.on(event, callback)
};

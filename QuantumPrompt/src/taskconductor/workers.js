import { sleep } from './utils.js';

class BaseWorker {
    constructor(name, role) {
        this.name = name;
        this.role = role;
    }

    async process(task) {
        throw new Error('Process method must be implemented');
    }
}

export class Researcher extends BaseWorker {
    constructor() { super('Researcher', 'analysis'); }

    async process(task) {
        await sleep(1000); // Simulate research time
        return `Analyzed context for: ${task.input}. Found key constraints and requirements.`;
    }
}

export class CreativeDirector extends BaseWorker {
    constructor() { super('CreativeDirector', 'creative'); }

    async process(task) {
        await sleep(1200);
        return `Generated creative concepts for: ${task.input}. Applied futuristic and emotional tones.`;
    }
}

export class TechnicalArchitect extends BaseWorker {
    constructor() { super('TechnicalArchitect', 'technical'); }

    async process(task) {
        await sleep(1500);
        return `Structured technical solution for: ${task.input}. Defined steps and logic.`;
    }
}

export class Editor extends BaseWorker {
    constructor() { super('Editor', 'refinement'); }

    async process(task) {
        await sleep(800);
        return `Refined and polished output for: ${task.input}. Checked for clarity and impact.`;
    }
}

export const Workers = {
    Researcher,
    CreativeDirector,
    TechnicalArchitect,
    Editor
};

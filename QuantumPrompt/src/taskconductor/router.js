import { Workers } from './workers.js';

export class Router {
    constructor() {
        this.workers = {
            research: new Workers.Researcher(),
            creative: new Workers.CreativeDirector(),
            technical: new Workers.TechnicalArchitect(),
            edit: new Workers.Editor()
        };
    }

    route(taskType) {
        switch (taskType) {
            case 'Detailed & Structured':
                return [this.workers.research, this.workers.technical, this.workers.edit];
            case 'Creative & Abstract':
                return [this.workers.creative, this.workers.edit];
            case 'Concise & Direct':
                return [this.workers.technical, this.workers.edit];
            case 'Socratic & Educational':
                return [this.workers.research, this.workers.technical];
            default:
                return [this.workers.research, this.workers.edit];
        }
    }
}

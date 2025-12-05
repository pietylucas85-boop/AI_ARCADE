import { StateManager } from './StateManager.js';
import { StoryGenerator } from './StoryGenerator.js';
import { Renderer } from './Renderer.js';

export class ComicEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("Canvas not found!");
            return;
        }
        this.stateManager = new StateManager();
        this.storyGenerator = new StoryGenerator(this.stateManager);
        this.renderer = new Renderer(this.canvas);
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.sceneDuration = 3000; // 3 seconds per scene
        this.lastSceneTime = 0;
        this.currentScene = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.canvas.style.display = 'block';
        this.loop(0);
    }

    stop() {
        this.isRunning = false;
        this.canvas.style.display = 'none';
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        // Generate new scene if needed
        if (timestamp - this.lastSceneTime > this.sceneDuration || !this.currentScene) {
            this.currentScene = this.storyGenerator.generateScene();
            this.lastSceneTime = timestamp;
        }

        // Render
        this.renderer.renderScene(this.currentScene);

        requestAnimationFrame((t) => this.loop(t));
    }
}

import { Character } from './Character.js';

export class StoryGenerator {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    generateScene() {
        const state = this.stateManager.get();

        // Ensure we have characters
        if (state.heroes.length === 0) {
            this.addNewHero(state);
        }
        if (state.villains.length === 0) {
            this.addNewVillain(state);
        }

        // Determine scene type based on randomness and state
        const roll = Math.random();
        let type = 'idle';
        let dialogue = '';
        let action = null;

        if (roll < 0.6) {
            // Combat Scene
            type = 'combat';
            const hero = state.heroes[0];
            const villain = state.villains[0];

            // Simple combat logic
            if (Math.random() > 0.5) {
                // Hero attacks
                action = { attacker: hero, defender: villain, damage: 10 + Math.floor(Math.random() * 10) };
                dialogue = `TAKE THIS!`;
            } else {
                // Villain attacks
                action = { attacker: villain, defender: hero, damage: 8 + Math.floor(Math.random() * 8) };
                dialogue = `YOU CANNOT WIN!`;
            }
        } else if (roll < 0.8) {
            // Dialogue Scene
            type = 'dialogue';
            dialogue = this.getRandomDialogue();
        } else {
            const villain = new Character(Date.now() + 1, 'villain');
            this.stateManager.update(s => s.villains.push(villain));
            return villain;
        }

        getRandomDialogue() {
            const lines = [
                "The code is unstable here...",
                "I sense a glitch nearby.",
                "Did you hear that?",
                "Stay sharp, team.",
                "This universe is crumbling."
            ];
            return lines[Math.floor(Math.random() * lines.length)];
        }
    }

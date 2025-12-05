export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    clear() {
        this.ctx.fillStyle = '#050510'; // Match main bg
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    renderScene(scene) {
        this.clear();

        // Draw Floor
        this.ctx.strokeStyle = '#00f3ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height * 0.8);
        this.ctx.lineTo(this.width, this.height * 0.8);
        this.ctx.stroke();

        // Draw Characters
        scene.heroes.forEach((hero, i) => {
            this.drawCharacter(hero, this.width * 0.3, this.height * 0.8);
        });

        scene.villains.forEach((villain, i) => {
            this.drawCharacter(villain, this.width * 0.7, this.height * 0.8, true);
        });

        // Draw Dialogue/SFX
        if (scene.dialogue) {
            this.drawSpeechBubble(this.width * 0.5, this.height * 0.4, scene.dialogue);
        }

        // Draw Action SFX
        if (scene.action) {
            this.drawSFX(this.width * 0.5, this.height * 0.6, "WHACK!");
        }
    }

    drawCharacter(char, x, y, flip = false) {
        const ctx = this.ctx;
        const color = char.color;
        const scale = 1.5;

        ctx.save();
        ctx.translate(x, y);
        if (flip) ctx.scale(-1, 1);
        ctx.scale(scale, scale);

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;

        // Head
        ctx.beginPath();
        ctx.arc(0, -50, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Body
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(0, 0);
        ctx.stroke();

        // Arms
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(-20, -10); // Left arm
        ctx.moveTo(0, -30);
        ctx.lineTo(20, -10); // Right arm
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-15, 30); // Left leg
        ctx.moveTo(0, 0);
        ctx.lineTo(15, 30); // Right leg
        ctx.stroke();

        // Weapon (Simple line for now)
        if (char.weapon) {
            ctx.beginPath();
            ctx.moveTo(20, -10);
            ctx.lineTo(30, -20);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawSpeechBubble(x, y, text) {
        const ctx = this.ctx;
        ctx.font = '20px "Rajdhani", sans-serif';
        const padding = 20;
        const textWidth = ctx.measureText(text).width;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;

        // Bubble
        ctx.beginPath();
        ctx.roundRect(x - textWidth / 2 - padding, y - 30, textWidth + padding * 2, 60, 10);
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    }

    drawSFX(x, y, text) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.random() * 0.5 - 0.25);
        ctx.font = 'bold 40px "Outfit", sans-serif';
        ctx.fillStyle = '#ff0055';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0055';
        ctx.fillText(text, 0, 0);
        ctx.strokeText(text, 0, 0);
        ctx.restore();
    }
}

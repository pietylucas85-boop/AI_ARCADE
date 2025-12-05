export class Character {
    constructor(id, type = 'hero') {
        this.id = id;
        this.type = type; // 'hero', 'villain', 'neutral'
        this.name = this.generateName();
        this.hp = 100;
    }

    generateWeapon() {
        const weapons = ['Katana', 'Blaster', 'Staff', 'Fists', 'Glitch-Blade'];
        return weapons[Math.floor(Math.random() * weapons.length)];
    }

    generateAccessory() {
        const accessories = ['Visor', 'Cape', 'Headphones', 'Scarf', 'None'];
        return accessories[Math.floor(Math.random() * accessories.length)];
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        if (this.hp === 0) {
            this.state = 'dead';
        } else {
            this.state = 'hit';
        }
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    levelUp() {
        this.level++;
        this.maxHp += 20;
        this.hp = this.maxHp;
    }
}

const MAP_WIDTH = 40;
const MAP_HEIGHT = 24;
const MIN_ROOM_SIZE = 3;
const MAX_ROOM_SIZE = 8;
const MIN_ROOMS = 5;
const MAX_ROOMS = 10;
const MIN_CORRIDORS = 3;
const MAX_CORRIDORS = 5;
const POTIONS_COUNT = 10;
const SWORDS_COUNT = 2;
const ENEMIES_COUNT = 10;
// const TILE_SIZE = 50;
const TILE_SIZE = 25

const TILES = {
    WALL: 'W',
    FLOOR: '-',
    HERO: 'P',
    ENEMY: 'E',
    POTION: 'HP',
    SWORD: 'SW'
};

class Game {
    constructor() {
        this.map = [];
        this.hero = { x: 0, y: 0, strength: 1, health: 100 };
        this.enemies = [];
        this.canvas = null;
        this.ctx = null;
        this.images = {};
        this.imagesLoaded = false;

    }

    async init() {
        try {
            this.canvas = $('.field')[0];
            this.ctx = this.canvas.getContext('2d');
            await this.loadImages();
            this.initializeMap();
            this.generateRooms();
            this.generateCorridors();
            this.placeItems();
            this.placeHero();
            this.placeEnemies();
            this.render();
            this.bindControls();
            console.log('Game initialized successfully');
        } catch (e) {
            console.error('Game initialization failed:', e);
            $('.debug').append(`<p>Error: ${e.message}. Check image paths and console.</p>`);
        }
    }

    // load all images
    async loadImages() {
        const imagePaths = {
            [TILES.FLOOR]: 'images/tile-.png',
            [TILES.WALL]: 'images/tile-W.png',
            [TILES.HERO]: 'images/tile-P.png',
            [TILES.ENEMY]: 'images/tile-E.png',
            [TILES.POTION]: 'images/tile-HP.png',
            [TILES.SWORD]: 'images/tile-SW.png'
        };

        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            });
        };


        try {
            for (let tile in imagePaths) {
                this.images[tile] = await loadImage(imagePaths[tile]);
            }
            this.imagesLoaded = true;
            console.log('Images loaded successfully');
        } catch (e) {
            throw new Error(`Image loading failed: ${e.message}`);
        }
    }


    initializeMap() {
        for (let y = 0; y < MAP_HEIGHT; y++) {
            this.map[y] = [];
            for (let x = 0; x < MAP_WIDTH; x++) {
                this.map[y][x] = TILES.WALL;
            }
        }
        console.log('Map initialized with walls');
    }

    generateRooms() {
        const roomCount = Math.floor(Math.random() * (MAX_ROOMS - MIN_ROOMS + 1)) + MIN_ROOMS;
        for (let i = 0; i < roomCount; i++) {
            const width = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
            const height = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
            const x = Math.floor(Math.random() * (MAP_WIDTH - width - 2)) + 1;
            const y = Math.floor(Math.random() * (MAP_HEIGHT - height - 2)) + 1;

            for (let ry = y; ry < y + height; ry++) {
                for (let rx = x; rx < x + width; rx++) {
                    this.map[ry][rx] = TILES.FLOOR;
                }
            }
        }
        console.log(`Generated ${roomCount} rooms`);
    }

    generateCorridors() {
        const hCorridors = Math.floor(Math.random() * (MAX_CORRIDORS - MIN_CORRIDORS + 1)) + MIN_CORRIDORS;
        for (let i = 0; i < hCorridors; i++) {
            const y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            for (let x = 0; x < MAP_WIDTH; x++) {
                this.map[y][x] = TILES.FLOOR;
            }
        }

        const vCorridors = Math.floor(Math.random() * (MAX_CORRIDORS - MIN_CORRIDORS + 1)) + MIN_CORRIDORS;
        for (let i = 0; i < vCorridors; i++) {
            const x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
            for (let y = 0; y < MAP_HEIGHT; y++) {
                this.map[y][x] = TILES.FLOOR;
            }
        }
        console.log(`Generated ${hCorridors} horizontal and ${vCorridors} vertical corridors`);
    }

    getRandomFloorPosition() {
        let attempts = 0;
        const maxAttempts = 100;
        let x, y;
        do {
            x = Math.floor(Math.random() * MAP_WIDTH);
            y = Math.floor(Math.random() * MAP_HEIGHT);
            attempts++;
            if (attempts > maxAttempts) {
                throw new Error('Could not find valid floor position. Ensure map has enough floor tiles.');
            }
        } while (this.map[y][x] !== TILES.FLOOR);
        return { x, y };
    }

    placeItems() {
        for (let i = 0; i < POTIONS_COUNT; i++) {
            const pos = this.getRandomFloorPosition();
            this.map[pos.y][pos.x] = TILES.POTION;
        }
        for (let i = 0; i < SWORDS_COUNT; i++) {
            const pos = this.getRandomFloorPosition();
            this.map[pos.y][pos.x] = TILES.SWORD;
        }
        console.log('Placed items');
    }

    placeHero() {
        const pos = this.getRandomFloorPosition();
        this.hero.x = pos.x;
        this.hero.y = pos.y;
        this.map[pos.y][pos.x] = TILES.HERO;
        console.log(`Hero placed at (${pos.x}, ${pos.y})`);
    }

    placeEnemies() {
        for (let i = 0; i < ENEMIES_COUNT; i++) {
            const pos = this.getRandomFloorPosition();
            this.enemies.push({ x: pos.x, y: pos.y, health: 50 });
            this.map[pos.y][pos.x] = TILES.ENEMY;
        }
        console.log(`Placed ${ENEMIES_COUNT} enemies`);
    }

    render() {

        if (!this.imagesLoaded) {
            console.warn('Images not loaded, skipping render');
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const tile = this.map[y][x];
                const img = this.images[tile];
                if (img) {
                    this.ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }

                // Draw health bars for hero and enemies
                if (tile === TILES.HERO || tile === TILES.ENEMY) {
                    const health = tile === TILES.HERO ? this.hero.health : this.enemies.find(e => e.x === x && e.y === y).health;
                    const healthWidth = Math.max(0, (health / 100) * TILE_SIZE);
                    this.ctx.fillStyle = tile === TILES.HERO ? '#00ff00' : '#ff0000';
                    this.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, healthWidth, 3);
                }
            }
        }
    }


    checkGameState() {
        if (this.hero.health <= 0) {
            $('.debug').append('<p>Game over! Hero dierd</p>');
            alert('Game over! Hero dierd');
            return true;
        } else if (this.enemies.length === 0) {
            $('.debug').append('<p>Game over! No more enemies!</p>');
            alert('Game over! No more enemies!');
            return true;
        }
        return false;
    }

    // controls setting
    bindControls() {
        $(document).on('keydown', (e) => {
            let newX = this.hero.x;
            let newY = this.hero.y;

            switch (e.key.toLowerCase()) {
                case 'w': newY--; break;
                case 's': newY++; break;
                case 'a': newX--; break;
                case 'd': newX++; break;
                case ' ': this.attack(); return;
                default: return;
            }

            if (this.isValidMove(newX, newY)) {
                this.moveHero(newX, newY);
                this.moveEnemies();
                this.render();
                this.checkGameState();

                // if (this.hero.health <= 0) {
                //     alert('Game over! Yu dead.');
                // } else if (this.enemies.length === 0) {
                //     $('.debug').append('<p>Game over! No enemies left!</p>');
                //     alert('Game over! No enemies left');
                // }
            }
        });
    }

    // validation of next posible move
    isValidMove(x, y) {
        if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
        return this.map[y][x] !== TILES.WALL && this.map[y][x] !== TILES.ENEMY;
    }

    // hero movment
    moveHero(newX, newY) {

        if (this.map[newY][newX] === TILES.POTION) {
            this.hero.health = Math.min(this.hero.health + 20, 100);
            this.map[newY][newX] = TILES.FLOOR;
        } else if (this.map[newY][newX] === TILES.SWORD) {
            this.hero.strength++;
            this.map[newY][newX] = TILES.FLOOR;
        }

        this.map[this.hero.y][this.hero.x] = TILES.FLOOR;
        this.hero.x = newX;
        this.hero.y = newY;
        this.map[newY][newX] = TILES.HERO;
    }

    attack() {
        const directions = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 1, y: 0 }
        ];

        for (let dir of directions) {
            const x = this.hero.x + dir.x;
            const y = this.hero.y + dir.y;
            if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                const enemyIndex = this.enemies.findIndex(e => e.x === x && e.y === y);
                if (enemyIndex !== -1) {
                    this.enemies[enemyIndex].health -= 10 * this.hero.strength;
                    if (this.enemies[enemyIndex].health <= 0) {
                        this.map[y][x] = TILES.FLOOR;
                        this.enemies.splice(enemyIndex, 1);
                    }
                }
            }
        }
        this.moveEnemies();
        this.render();
        this.checkGameState();
    }

    // enemies movement handling
    moveEnemies() {
        for (let enemy of this.enemies) {
            const directions = [
                { x: 0, y: -1 }, { x: 0, y: 1 },
                { x: -1, y: 0 }, { x: 1, y: 0 }
            ];

            // Check for attack opportunity (adjacent to hero)
            for (let dir of directions) {
                const adjX = enemy.x + dir.x;
                const adjY = enemy.y + dir.y;
                if (adjX === this.hero.x && adjY === this.hero.y) {
                    this.hero.health -= 5;
                    this.render(); // Immediate render to show hero health change
                    this.checkGameState();
                    return; // Skip movement if attacking
                }
            }

            const moveDir = directions[Math.floor(Math.random() * directions.length)];
            const newX = enemy.x + moveDir.x;
            const newY = enemy.y + moveDir.y;

            if (this.isValidMove(newX, newY) && !this.enemies.some(e => e.x === newX && e.y === newY)) {
                this.map[enemy.y][enemy.x] = TILES.FLOOR;
                enemy.x = newX;
                enemy.y = newY;
                this.map[newY][newX] = TILES.ENEMY;
            }
        }
    }
}
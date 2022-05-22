// https://kenney.nl/assets/pirate-pack
// thank you kenny for images


// 'use strict';
let ships;
let bullets;
let explosions;
let shipAssets;
let explosionAssets;
const bulletChance = 0.0001;

function preload() {
	const shipImgUrls = [['ship (1).png', 'ship (2).png', 'ship (3).png', 'ship (4).png', 'ship (5).png', 'ship (6).png'],
											['ship (7).png', 'ship (8).png', 'ship (9).png', 'ship (10).png', 'ship (11).png', 'ship (12).png'],
											['ship (13).png', 'ship (14).png', 'ship (15).png', 'ship (16).png', 'ship (17).png', 'ship (18).png'],
											['ship (19).png', 'ship (20).png', 'ship (21).png', 'ship (22).png', 'ship (23).png', 'ship (24).png']];
	shipAssets = shipImgUrls.map(arr => arr.map(url => loadImage(url)));
	const explosionImgUrls = ['explosion3.png', 'explosion2.png', 'explosion1.png'];
	explosionAssets = explosionImgUrls.map(url => loadImage(url));


}

function setup() {
	createCanvas(windowWidth, windowHeight);
	ships = createShips(20);
	bullets = [];
	explosions = [];
	imageMode(CENTER);
	background(100);
}

function draw() {
	// background("#AFE8FB");
	background(20);
	drawShips(ships);
	updateShips(ships);
	drawBullets(bullets);
	updateBullets(bullets);
	drawExplosions(explosions);
	updateExplosions(explosions);
	bullets = bullets.filter(b => !(b.isDead));
	ships = ships.filter(s => !(s.isDead));
	explosions = explosions.filter(e => !(e.isDead));

}

function createShip(index) {
	const pos = createVector(random(width), random(height));
	const vel = p5.Vector.fromAngle(radians(random(360)), random(2.5, 7.5) * 0.1);
	let ship = {
		pos,
		vel,
		team: random([0, 1, 2, 3, 4, 5]),
		phase: index * 1000,
		bulletCount: floor(random(50, 100)),
		hasBurst: random(1) < 0.01,
		health:4,
		isDead: false
	};
	return ship;
}

function createShips(num) {
	const ships = [];
	for (let i = 0; i < num; i++) {
		ships.push(createShip(i));
	}

	return ships;
}

function drawShip(ship) {
	push();
	translate(ship.pos.x, ship.pos.y);
	rotate(ship.vel.heading());
	rotate(radians(-90));
	scale(0.5, 0.5);
	image(shipAssets[4-ship.health][ship.team], 0, 0);
	pop();
}

function drawShips(ships) {
	for (let ship of ships) {
		drawShip(ship);
	}
}

function updateShip(ship) {
	ship.pos.add(ship.vel);
	ship.pos = p5.Vector.lerp(ship.pos, p5.Vector.add(ship.pos, ship.vel), 0.2);
	ship.vel.rotate(radians(noise(frameCount / ship.vel.mag() / 100, ship.phase) * 5 - 2.5));
	if (ship.pos.x > width) {
		ship.pos.x -= width;
	}
	if (ship.pos.y > height) {
		ship.pos.y -= height;
	}
	if (ship.pos.x < 0) {
		ship.pos.x += width;
	}
	if (ship.pos.y < 0) {
		ship.pos.y += height;
	}
	if (random(1) < bulletChance * (ships.length - 1) && ship.bulletCount > 0) {
		if (ship.hasBurst) {
			bullets.push(createBullet(ship, 0), createBullet(ship, PI / 6), createBullet(ship, -PI / 6));
			ship.bulletCount -= 3;
		} else {
			bullets.push(createBullet(ship, 0));
			ship.bulletCount -= 1;
		}
	}
}

function updateShips(ships) {
	for (let ship of ships) {
		updateShip(ship);
	}
}

function createBullet(ship, angle) {

	let bullet = {
		mother: ship,
		pos: ship.pos.copy(),
		vel: p5.Vector.fromAngle(ship.vel.heading() + angle, random(2.5, 7.5)),
		isDead: false,
	};
	return bullet;
}

function drawBullet(bullet) {
	stroke('grey');
	if (bullet.isDead) {
		fill('red');
	} else {
		fill(50);
	}
	circle(bullet.pos.x, bullet.pos.y, 10);
}

function drawBullets(bullets) {
	for (let bullet of bullets) {
		drawBullet(bullet);
	}
}

function updateBullet(bullet, targets) {
	bullet.pos.add(bullet.vel);
	bullet.pos = p5.Vector.lerp(bullet.pos, p5.Vector.add(bullet.pos, bullet.vel), 0.2);
	if (bullet.pos.x > width) {
		bullet.pos.x -= width;
	}
	if (bullet.pos.y > height) {
		bullet.pos.y -= height;
	}
	if (bullet.pos.x < 0) {
		bullet.pos.x += width;
	}
	if (bullet.pos.y < 0) {
		bullet.pos.y += height;
	}
	for (let target of targets) {
		if (bullet.pos.dist(target.pos) < 40 && target !== bullet.mother) {
			triggerExplosion(bullet, target);
		}
	}
}

function updateBullets(bullets) {
	for (let bullet of bullets) {
		updateBullet(bullet, ships);
	}
}

function killBullet(bullet) {
	bullet.isDead = true;
}

function killShip(ship) {
	ship.isDead = true;
}

function triggerExplosion(bullet, target) {
	const explosion = {
		phase: 0,
		pos: bullet.pos.copy(),
		age: 0,
		isDead: false
	};
	explosions.push(explosion);
	killBullet(bullet);
	target.health -= 1;
	if (target.health<1) {
			killShip(target);
	}
}

function updateExplosion(explosion) {
	explosion.age += 1;
	explosion.phase = floor(explosion.age / 10);
	if (explosion.phase > 2) {
		explosion.isDead = true;
		explosion.phase = 2;
	}
}

function updateExplosions(explosions) {
	for (let explosion of explosions) {
		updateExplosion(explosion);
	}
}

function drawExplosion(explosion) {
	push();
	translate(explosion.pos.x, explosion.pos.y);
	scale(0.7);
	image(explosionAssets[explosion.phase], 0, 0);
	pop();
}

function drawExplosions(explosions) {
	for (let explosion of explosions) {
		drawExplosion(explosion);
	}
}
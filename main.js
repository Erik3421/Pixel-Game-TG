kaboom({
	scale: 4,
	font: "monospace",
});

// Загрузка пиксельного шрифта
loadFont("RetroGaming", "assets/RetroGaming.ttf");

// Загрузка спрайтов с анимациями
loadSprite("bean", "assets/bean.png", {
	sliceX: 5,
	anims: {
		"idle": {
			from: 0,
			to: 1,
			speed: 5,
			loop: true,
		},
		"run": {
			from: 2,
			to: 3,
			speed: 10,
			loop: true,
		},
		"jump": 4,
	},
});

loadSprite("coin", "assets/coin.png", {
	sliceX: 7,
	anims: {
		"spin": {
			from: 0,
			to: 6,
			speed: 10,
			loop: true,
		},
	},
});

const SPEED = 120;
const JUMP_FORCE = 240;
const COIN_FALL_SPEED = 40;

setGravity(640);

// Добавление персонажа
const player = add([
	sprite("bean"),
	pos(center()),
	anchor("center"),
	area(),
	body(),
]);

// Начальная анимация
player.play("idle");

// Добавление платформы
const ground = add([
	rect(width(), 24),
	area(),
	outline(1),
	pos(0, height() - 24),
	body({ isStatic: true }),
]);

// Анимация при соприкосновении с землей
player.onGround(() => {
	if (!isKeyDown("left") && !isKeyDown("right")) {
		player.play("idle");
	} else {
		player.play("run");
	}
});

player.onAnimEnd((anim) => {
	if (anim === "idle") {
		// Дополнительная логика по окончании анимации
	}
});

onKeyPress("space", () => {
	if (player.isGrounded()) {
		player.jump(JUMP_FORCE);
		player.play("jump");
	}
});

onKeyDown("left", () => {
	player.move(-SPEED, 0);
	player.flipX = true;
	if (player.isGrounded() && player.curAnim() !== "run") {
		player.play("run");
	}
});

onKeyDown("right", () => {
	player.move(SPEED, 0);
	player.flipX = false;
	if (player.isGrounded() && player.curAnim() !== "run") {
		player.play("run");
	}
});

["left", "right"].forEach((key) => {
	onKeyRelease(key, () => {
		if (player.isGrounded() && !isKeyDown("left") && !isKeyDown("right")) {
			player.play("idle");
		}
	});
});

// Ограничение движения персонажа по горизонтали
player.onUpdate(() => {
	if (player.pos.x < 0) player.pos.x = 0;
	if (player.pos.x > width()) player.pos.x = width();
});

// Переменная для хранения очков
let score = 0;

// Добавление текста для отображения очков
const scoreLabel = add([
	text("Score: 0", { size: 16, font: "RetroGaming" }), 
	pos(12, 12),
]);

// Функция для обновления текста очков
function updateScore(points) {
	score += points;
	scoreLabel.text = `Score: ${score}`;

	// Добавление текста "+100" на месте пойманной монеты
	const plus100 = add([
		text("+100", { size: 12, font: "RetroGaming" }), 
		pos(player.pos),
		color(255, 232, 94),
	]);

	// Анимация исчезновения текста "+100"
	plus100.onUpdate(() => {
		plus100.move(0, -20);
		plus100.opacity -= 0.05;
		if (plus100.opacity <= 0) {
			destroy(plus100);
		}
	});
}

// Функция для создания монеток
function spawnCoin() {
	const coin = add([
		sprite("coin"),
		pos(rand(0, width()), 0),
		area(),
		scale(0.5), 
		"coin",
	]);

	coin.play("spin");

	coin.onUpdate(() => {
		coin.move(0, COIN_FALL_SPEED);
		if (coin.pos.y > height()) {
			destroy(coin);
		}
	});

	wait(rand(1, 3), spawnCoin);
}

// Запуск функции для создания монеток
spawnCoin();

// Проверка на столкновение с монеткой
player.onCollide("coin", (coin) => {
	destroy(coin);
	updateScore(100);
});

// Обработка нажатий на экран
mouseClick(() => {
	const clickPos = mousePos();
	if (clickPos.x < width() / 2) {
		player.move(-SPEED, 0);
		player.flipX = true;
		if (player.isGrounded() && player.curAnim() !== "run") {
			player.play("run");
		}
	} else {
		player.move(SPEED, 0);
		player.flipX = false;
		if (player.isGrounded() && player.curAnim() !== "run") {
			player.play("run");
		}
	}
});

mouseRelease(() => {
	if (player.isGrounded() && !isKeyDown("left") && !isKeyDown("right")) {
		player.play("idle");
	}
});

// Обработка свайпов для прыжка
touchStart(() => {
	const startTouchPos = mousePos();
	touchMove(() => {
		const endTouchPos = mousePos();
		if (endTouchPos.y < startTouchPos.y - 20 && player.isGrounded()) {
			player.jump(JUMP_FORCE);
			player.play("jump");
		}
	});
});

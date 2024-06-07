kaboom({
    global: true,
    fullscreen: true,
    scale: 1.5, // Уменьшение масштаба
    debug: true,
    clearColor: [0, 0, 0, 1],
});

// Загрузка спрайтов и шрифтов
loadFont("RetroGaming", "assets/RetroGaming.ttf");
loadSprite("bean", "assets/bean.png", {
    sliceX: 5,
    anims: {
        idle: { from: 0, to: 1, speed: 5, loop: true },
        run: { from: 2, to: 3, speed: 10, loop: true },
        jump: 4,
    },
});
loadSprite("coin", "assets/coin.png", {
    sliceX: 7,
    anims: { spin: { from: 0, to: 6, speed: 10, loop: true } },
});

const SPEED = 200; // Скорость для масштабирования
const JUMP_FORCE = 360; // Сила прыжка для масштабирования
const COIN_FALL_SPEED = 30; // Скорость падения монеток

setGravity(640);

const player = add([
    sprite("bean"),
    pos(center()),
    anchor("center"),
    area(),
    body(),
    scale(1.5), // Масштаб персонажа
]);

player.play("idle");

const ground = add([
    rect(width(), 36), // Высота платформы
    area(),
    outline(1),
    pos(0, height() - 36),
    body({ isStatic: true }),
]);

player.onGround(() => {
    if (!isKeyDown("left") && !isKeyDown("right")) {
        player.play("idle");
    } else {
        player.play("run");
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

let score = 0;

// Текст для отображения очков
const scoreLabel = add([
    text(`Score: ${score}`, { size: 24, font: "RetroGaming" }), // Размер текста
    pos(24, 24),
]);

function updateScore(points) {
    score += points;
    scoreLabel.text = `Score: ${score}`;

    // Текст "+100" на месте пойманной монеты
    const plus100 = add([
        text("+100", { size: 18, font: "RetroGaming" }), // Размер текста
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

function spawnCoin() {
    const coin = add([
        sprite("coin"),
        pos(rand(0, width()), 0),
        area(),
        scale(0.75), // Масштаб монеток
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

spawnCoin();

player.onCollide("coin", (coin) => {
    destroy(coin);
    updateScore(100);
});

// Ограничение движения игрока в пределах экрана
player.onUpdate(() => {
    if (player.pos.x < 0) player.pos.x = 0;
    if (player.pos.x > width()) player.pos.x = width();
});

// Обработка касаний для мобильного управления
touchStart((id, pos) => {
    if (pos.x < width() / 2) {
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

touchEnd(() => {
    if (player.isGrounded()) {
        player.play("idle");
    }
});

touchMove((id, pos) => {
    if (pos.y < height() / 2 && player.isGrounded()) {
        player.jump(JUMP_FORCE);
        player.play("jump");
    }
});

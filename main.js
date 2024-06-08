kaboom({
    global: true,
    fullscreen: true,
    scale: 1.5,
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

const SPEED = 100;
const JUMP_FORCE = 360;
const COIN_FALL_SPEED = 40;

setGravity(640);

const tapToStart = add([
    text("Tap to Start", { size: 48, font: "RetroGaming" }),
    pos(center()),
    anchor("center"),
]);

onTouchStart(() => {
    destroy(tapToStart);
    startGame();
});

function startGame() {
    const player = add([
        sprite("bean"),
        pos(center()),
        anchor("center"),
        area(),
        body(),
        scale(1.5),
    ]);

    player.play("idle");

    const ground = add([
        rect(width(), 36),
        area(),
        outline(1),
        pos(0, height() - 36),
        body({ isStatic: true }),
    ]);

    function updatePlayerAnimation() {
        if (player.isGrounded()) {
            if (isTouchingLeft || isKeyDown("left") || isTouchingRight || isKeyDown("right")) {
                player.play("run");
            } else {
                player.play("idle");
            }
        }
    }

    player.onGround(() => {
        updatePlayerAnimation();
    });

    onKeyPress("space", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE);
            player.play("jump");
        }
    });

    onKeyDown("left", () => {
        isTouchingLeft = true;
        player.move(-SPEED, 0);
        player.flipX = true;
        if (player.isGrounded() && player.curAnim() !== "run") {
            player.play("run");
        }
    });

    onKeyDown("right", () => {
        isTouchingRight = true;
        player.move(SPEED, 0);
        player.flipX = false;
        if (player.isGrounded() && player.curAnim() !== "run") {
            player.play("run");
        }
    });

    ["left", "right"].forEach((key) => {
        onKeyRelease(key, () => {
            if (key === "left") {
                isTouchingLeft = false;
            }
            if (key === "right") {
                isTouchingRight = false;
            }
            updatePlayerAnimation();
        });
    });

    let score = 0;

    const scoreLabel = add([
        text(`Score: ${score}`, { size: 24, font: "RetroGaming" }),
        pos(24, 24),
    ]);

    function updateScore(points) {
        score += points;
        scoreLabel.text = `Score: ${score}`;

        const plus100 = add([
            text("+100", { size: 18, font: "RetroGaming" }),
            pos(player.pos),
            color(255, 232, 94),
        ]);

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
            scale(0.75),
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

    player.onUpdate(() => {
        if (player.pos.x < 0) player.pos.x = 0;
        if (player.pos.x > width()) player.pos.x = width();
    });

    // Обработка касаний для мобильного управления
    let isTouchingLeft = false;
    let isTouchingRight = false;

    onTouchStart((pos, t) => {
        if (pos.x < width() / 2) {
            isTouchingLeft = true;
            isTouchingRight = false;
            player.move(-SPEED, 0);
            player.flipX = true;
            if (player.isGrounded() && player.curAnim() !== "run") {
                player.play("run");
            }
        } else {
            isTouchingRight = true;
            isTouchingLeft = false;
            player.move(SPEED, 0);
            player.flipX = false;
            if (player.isGrounded() && player.curAnim() !== "run") {
                player.play("run");
            }
        }
    });

    onTouchEnd((pos, t) => {
        isTouchingLeft = false;
        isTouchingRight = false;
        updatePlayerAnimation();
    });

    onTouchMove((pos, t) => {
        if (pos.y < height() / 2 && player.isGrounded()) {
            player.jump(JUMP_FORCE);
            player.play("jump");
        }
    });

    player.onUpdate(() => {
        if (isTouchingLeft) {
            player.move(-SPEED, 0);
            player.flipX = true;
            if (player.isGrounded() && player.curAnim() !== "run") {
                player.play("run");
            }
        }
        if (isTouchingRight) {
            player.move(SPEED, 0);
            player.flipX = false;
            if (player.isGrounded() && player.curAnim() !== "run") {
                player.play("run");
            }
        }
    });
}

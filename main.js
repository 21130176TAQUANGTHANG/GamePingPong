//board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context; 

let currentLevel = 1; // Mức độ hiện tại, mặc định là 1

//players
let playerWidth = 500; //500 for testing, 80 normal
let playerHeight = 10;
let playerVelocityX = 10; //move 10 pixels each time

let player = {
    x : boardWidth/2 - playerWidth/2,
    y : boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX : playerVelocityX
}

//ball
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 15; //15 for testing, 3 normal
let ballVelocityY = 10; //10 for testing, 2 normal

let ball = {
    x : boardWidth/2,
    y : boardHeight/2,
    width: ballWidth,
    height: ballHeight,
    velocityX : ballVelocityX,
    velocityY : ballVelocityY
}

//blocks
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8; 
let blockRows = 3; //add more as game goes on
let blockMaxRows = 10; //limit how many rows
let blockCount = 0;

//starting block corners top left 
let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;

// vật phẩm
let powerUpWidth = 20;
let powerUpHeight = 20;
let powerUpVelocityY = 1; // Tốc độ rơi của vật phẩm

let powerUps = []; // Mảng chứa các vật phẩm
// kiểm tra va chạm vật phẩm với nguòi chơi
let doubleBallActivated = false;

function createPowerUp(x, y, type) {
    if (currentLevel === 2) {
        let powerUp = {
            x: x,
            y: y,
            width: powerUpWidth,
            height: powerUpHeight,
            velocityY: powerUpVelocityY,
            type: type
        };

        if (type === "doubleBall") {
            doubleBallActivated = true;// cập nhậpt lại đã va chạm với người chơi
            splitBall(); // Thực hiện tách ra thành 2 quả bóng
        }

        powerUps.push(powerUp);
    }
}
// Hàm cập nhật vật phẩm
function updatePowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
        let powerUp = powerUps[i];
        powerUp.y += powerUp.velocityY;
        
        // Kiểm tra va chạm với người chơi
        if (currentLevel === 2 && detectCollision(player, powerUp)) {
            if (powerUp.type === "doubleBall") {
                splitBall(); // Thực hiện tách ra thành 2 quả bóng
                powerUps.splice(i, 1); // Xóa vật phẩm khỏi mảng
            }
        } else {
            // Vẽ vật phẩm
            context.fillStyle = "white";
            context.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        }
    }
}
// tách ra thành 2 quả bóng
let balls =[];
function splitBall() {
    let newBalls = [
        { x: ball.x, y: ball.y, width: ball.width, height: ball.height, velocityX: -ball.velocityX, velocityY: -ball.velocityY },
        { x: ball.x, y: ball.y, width: ball.width, height: ball.height, velocityX: ball.velocityX, velocityY: -ball.velocityY }
    ];
    balls.push(...newBalls); // Thêm 2 quả bóng mới vào mảng
}


window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // ve 2d

    //draw initial player
    context.fillStyle="skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);

    // vẽ khối
    createBlocks();

    // tạo chức năng khi click vào button
    const startGame = document.getElementById("startGame");
    const menu = document.getElementById("menu");
    const game = document.getElementById("board");
    const level = document.getElementById("level");

    startGame.addEventListener("click", function() {
        menu.style.display = "none";
        level.style.display = "block";
        game.style.display = "block";
        update();
    });
    const level1 = document.getElementById("level1");
    const level2 = document.getElementById("level2");
    const level3 = document.getElementById("level3");
    level1.addEventListener("click", function() {
        changeLevel(1);
    });
    
    level2.addEventListener("click", function() {
        changeLevel(2);
    });
    
    level3.addEventListener("click", function() {
        changeLevel(3);
    });
}


function changeLevel(level) {
    currentLevel = level;
    resetGame();
}

function update() {
    requestAnimationFrame(update);
    //stop drawing
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // player
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    // ball
    if (currentLevel === 2) {
        context.fillStyle = "red";
    } else {
        context.fillStyle = "white";
    }
    balls.forEach(function(ball) {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        context.fillRect(ball.x, ball.y, ball.width, ball.height);
    });

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    //bounce the ball off player paddle
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1;   // flip y direction up or down
    }
    else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1;   // flip x direction left or right
    }

    if (ball.y <= 0) { 
        // if ball touches top of canvas
        ball.velocityY *= -1; //reverse direction
    }
    else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
        // if ball touches left or right of canvas
        ball.velocityX *= -1; //reverse direction
    }
    else if (ball.y + ball.height >= boardHeight) {
        // if ball touches bottom of canvas
        context.font = "20px sans-serif";
        context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
        gameOver = true;
    }

    //blocks
    // xử lý va chạm giữa ball và block
    context.fillStyle = "skyblue";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {   
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true;     // block is broken
                ball.velocityY *= -1;   // flip y direction up or down
                score += 100;
                blockCount -= 1;
                // Tạo vật phẩm khi block bị phá vỡ
                // Tạo vật phẩm khi block bị phá vỡ
                if ( currentLevel ===2 && doubleBallActivatedBlocks.includes(block)) {
                    if (Math.random() < 0.6) {
                        createPowerUp(block.x + block.width / 2, block.y + block.height / 2, "doubleBall");   
                        splitBall();
                    }
                }
                        
            }
            else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                block.break = true;     // block is broken
                ball.velocityX *= -1;   // flip x direction left or right
                score += 100;
                blockCount -= 1;
                // Tạo vật phẩm khi block bị phá vỡ
                if ( currentLevel ===2 && doubleBallActivatedBlocks.includes(block)) {
                    if (Math.random() < 0.6) {
                        createPowerUp(block.x + block.width / 2, block.y + block.height / 2, "doubleBall");
                        splitBall();
                    }
                }       
             }

            context.fillRect(block.x, block.y, block.width, block.height);
            
        }
    }
    updatePowerUps()
    //next level
    if (blockCount == 0) {
        score += 100*blockRows*blockColumns; //bonus points :)
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        changeLevel(currentLevel + 1);
    }

    //score
    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);
}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);
}

function movePlayer(e) {
    if (gameOver) {
        if (e.code == "Space") {
            resetGame();
            console.log("RESET");
        }
        return;
    }
    if (e.code == "ArrowLeft") {
        // player.x -= player.velocityX;
        let nextplayerX = player.x - player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
    }
    else if (e.code == "ArrowRight") {
        let nextplayerX = player.x + player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
        // player.x += player.velocityX;    
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function topCollision(ball, block) { //a is above b (ball is above block)
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) { //a is above b (ball is below block)
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) { //a is left of b (ball is left of block)
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) { //a is right of b (ball is right of block)
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function createBlocks() {
    blockArray = []; //clear blockArray
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x : blockX + c*blockWidth + c*10, //c*10 space 10 pixels apart columns
                y : blockY + r*blockHeight + r*10, //r*10 space 10 pixels apart rows
                width : blockWidth,
                height : blockHeight,
                break : false,
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;
    player = {
        x : boardWidth/2 - playerWidth/2,
        y : boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX : playerVelocityX
    }
    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width: ballWidth,
        height: ballHeight,
        velocityX : ballVelocityX,
        velocityY : ballVelocityY
    }
    blockArray = [];
    blockRows = 3;
    score = 0;
    createBlocks();
}
//21130176 - Tạ Quang Thắng - 0379690935 - DH21DTA

//board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

let currentLevel = 1; // Mức độ hiện tại, mặc định là 1

//players
let playerWidth = 80; // chiều dài ván trượt
let playerHeight = 10; // chiều rộng ván trượt
let playerVelocityX = 10; // di chuyển + 10px

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
let ballVelocityX = 2; // vận tốc bóng chiều x
let ballVelocityY = 1; // vận tốc bóng chiều y

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
let obstacleArray = [];// chướng ngại vật
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRows = 3; // số dòng khối
let blockMaxRows = 10; // số dòng tối đa
let blockCount = 0;

// đặt vị trí block
let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;

// vật phẩm
let powerUpWidth = 20;
let powerUpHeight = 20;
let powerUpVelocityY = 1; // Tốc độ rơi của vật phẩm

let powerUps = []; // Mảng chứa các vật phẩm

let frameCount = 0; // Đếm số frame đã vẽ

// kiểm tra va chạm vật phẩm với nguòi chơi
let playerHitPowerUp = false;

//lệnh pause
let isPaused = false;

//tự động di chuyển chướng ngại vật. Cài đạt vận tốc
let obstacleVelocityX = 2; // Tốc độ di chuyển của chướng ngại vật
let obstacleDirection = 1; // Hướng di chuyển của chướng ngại vật, 1 cho phải và -1 cho trái

// Cập nhật vị trí của chướng ngại vật trong hàm update
function updateObstacles() {
    blockArray.forEach(function(obstacle) {
        obstacle.x += obstacleVelocityX * obstacleDirection;

        // Kiểm tra xem chướng ngại vật chạm đến biên trái hoặc phải của board chưa
        if (obstacle.x <= 0 || obstacle.x + obstacle.width >= boardWidth) {
            // Nếu đã đạt biên trái hoặc phải, đảo ngược hướng di chuyển
            obstacleDirection *= -1;
        }
    });
}


// vật phẩm tách 2 quả bóng
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
            playerHitPowerUp = true;
        }

        powerUps.push(powerUp);
    }
}
//vật phẩm quả boom
function createBomb(x, y, type) {
    if (currentLevel === 4) {
        let bomb = {
            x: x,
            y: y,
            width: powerUpWidth,
            height: powerUpHeight,
            velocityY: powerUpVelocityY,
            type: type
        };

        powerUps.push(bomb);
    }
}
// Hàm cập nhật vật phẩm
function updatePowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
        // Lấy vật phẩm hiện tại từ mảng
        let powerUp = powerUps[i];

        // Di chuyển vật phẩm xuống dưới
        powerUp.y += powerUp.velocityY;

        // Kiểm tra va chạm với người chơi
        if (currentLevel === 2 && detectCollision(player, powerUp)) {
            if (powerUp.type === "doubleBall") {
                powerUps.splice(i, 1); // Xóa vật phẩm khỏi mảng
                splitBall(); // Thực hiện tách ra thành 2 quả bóng
                playerHitPowerUp = true;
            }
        } else if (currentLevel === 4 && detectCollision(player, powerUp)) {
            if (powerUp.type === "bomb") {
                powerUps.splice(i, 1); // Xóa vật phẩm khỏi mảng
                context.font = "20px sans-serif";
                context.fillText("Game Over: Press 'Space' to Restart", 250, 400);
                gameOver = true; // Kết thúc trò chơi
            }
        } else {
            // Vẽ quả bom nếu không có va chạm với người chơi
            if (powerUp.type === "bomb") {
                // Vẽ hình dạng của quả bom (hình tròn màu đỏ)
                context.beginPath();
                context.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width / 2, 0, Math.PI * 2);
                context.fillStyle = "red";
                context.fill();
                context.closePath();
            } else {
                // Vẽ các vật phẩm khác
                context.fillStyle = "white";
                context.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            }
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
        level.style.display = "flex";
        game.style.display = "flex";
        update();
    });
    const level1 = document.getElementById("level1");
    const level2 = document.getElementById("level2");
    const level3 = document.getElementById("level3");
    const level4 = document.getElementById("level4");
    const level5 = document.getElementById("level5");
    const level6 = document.getElementById("level6");
    const pause = document.getElementById("pause");
    level1.addEventListener("click", function() {
        changeLevel(1);
    });

    level2.addEventListener("click", function() {
        changeLevel(2);
    });

    level3.addEventListener("click", function() {
        changeLevel(3);
    });
    level4.addEventListener("click", function() {
        changeLevel(4);
    });
    level5.addEventListener("click", function() {
        changeLevel(5);
    });
    // Lấy tất cả các nút level
    const levelButtons = document.querySelectorAll(".buttonLevel button");
    // Lặp qua từng nút level
    levelButtons.forEach(button => {

        button.addEventListener("click", function() {
            // Loại bỏ "active"
            levelButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            // Thêm "active" vào nút đang được click
            this.classList.add("active");
        });
    });
    pause.addEventListener("click", function() {
        if (!gameOver) {
            if (!isPaused) {
                // Nếu trò chơi không được tạm dừng, tạm dừng trò chơi
                cancelAnimationFrame(update);
                isPaused = true;
                pauseButton.textContent = "Resume";
            } else {
                // Nếu trò chơi đã tạm dừng, tiếp tục trò chơi
                requestAnimationFrame(update);
                isPaused = false;
                pauseButton.textContent = "Pause";
            }
        }
    });
    const returnButton = document.getElementById("returnGame");

    // Quay về menu
    returnButton.addEventListener("click", function() {
        // Chuyển hướng canvas về trang "index.html"
        window.location.href = "index.html";
    });


    const settingButton = document.getElementById("setting");
    const popup = document.querySelector(".popup");

    // Gắn sự kiện click cho nút setting
    settingButton.addEventListener("click", function() {
        // Hiển thị popup
        popup.style.display = "block";
    });

    // Xử lý sự kiện click cho nút close trong popup
    const closeButton = document.getElementById("closeButton");
    closeButton.addEventListener("click", function() {
        // Ẩn popup khi click vào nút close
        popup.style.display = "none";
    });


    // Có thể di chuyển người chơi bằng chuột
    board.addEventListener("mousemove", movePlayerWithMouse);
}



function changeLevel(level) {
    obstacles = [];
    currentLevel = level;
    resetGame();
    if (currentLevel === 2) {
        // Clear balls array when moving to the next level
        balls = [];
        powerUps = [];
    }
    if (currentLevel === 3) {
        createBlocksLevel3();
    }
    if (currentLevel === 4) {
        createBlocksLevel4();
    }
    if(currentLevel === 5) {
        createBlocksLevel5();
    }
    // Đặt lại kích thước của board khi quay về level 1 hoặc level 2
    if (currentLevel === 1 || currentLevel === 2) {
        boardWidth = 500; // Khôi phục lại kích thước ban đầu
        boardHeight = 500; // Khôi phục lại kích thước ban đầu

        // Cập nhật kích thước của board trong HTML
        board.width = boardWidth;
        board.height = boardHeight;
        player = {
            x : boardWidth/2 - playerWidth/2,
            y : boardHeight - playerHeight - 5,
            width: playerWidth,
            height: playerHeight,
            velocityX : playerVelocityX
        }

    }
}


//thêm chức năng di chuyển người chơi bằng chuột
function movePlayerWithMouse(event) {
    // Lấy vị trí x của chuột trong canvas
    let mouseX = event.clientX - board.getBoundingClientRect().left;

    // Giới hạn vị trí x của player để không vượt ra khỏi board
    let nextPlayerX = mouseX - player.width / 2;
    if (nextPlayerX < 0) {
        nextPlayerX = 0;
    } else if (nextPlayerX + player.width > boardWidth) {
        nextPlayerX = boardWidth - player.width;
    }

    // Cập nhật vị trí x của player
    player.x = nextPlayerX;
}



function update() {
    requestAnimationFrame(update);
    //stop drawing
    if (gameOver || isPaused) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Người chơi
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    // định dạng quả bóng ở level 2
    if (currentLevel === 2) {
        context.fillStyle = "red";
    } else {
        context.fillStyle = "white";
    }
    // quả bóng gốc
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);



    // quả bóng phụ khi ăn vật phẩm
    context.fillStyle = "yellow";
    balls.forEach(function(ball) {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        // Kiểm tra va chạm với cạnh trái và phải của board
        if (ball.x <= 0 || ball.x + ball.width >= boardWidth) {
            ball.velocityX *= -1; // Đảo hướng di chuyển khi va chạm với cạnh trái hoặc phải
        }

        // Kiểm tra va chạm với phía trên của board
        if (ball.y <= 0) {
            ball.velocityY *= -1; // Đảo hướng di chuyển khi va chạm với phía trên
        }

        // Kiểm tra va chạm với người chơi (giả sử người chơi có chiều cao playerHeight)
        if (ball.y + ball.height >= boardHeight - playerHeight && ball.y + ball.height <= boardHeight) {
            // Nếu quả bóng chạm vào người chơi, nó sẽ nảy lên
            ball.velocityY *= -1;
        }

        // Vẽ quả bóng
        context.fillRect(ball.x, ball.y, ball.width, ball.height);
    });






    //bật bóng ra khỏi mái chèo của người chơi
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1;   // lật hướng y lên hoặc xuống
    }
    else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1;   // lật x hướng sang trái hoặc phải
    }

    if (ball.y <= 0) {
        // nếu quả bóng chạm vào board
        ball.velocityY *= -1; //hướng ngược lại
    }
    else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
        // nếu bóng chạm vào bên trái hoặc bên phải của canvas
        ball.velocityX *= -1; //hướng ngược lại
    }
    else if (ball.y + ball.height >= boardHeight) {
        // nếu quả bóng chạm vào đáy canvas
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
                if(!block.isObstacle){ // Nếu không phải là chướng ngại vật
                    block.break = true; //phá gạch
                    ball.velocityY *= -1; // đảo hướng di chuyển quả bóng
                    score += 100;   // cộng điểm
                    blockCount -= 1;    // giảm số block còn lại
                    createPowerUp(block.x + block.width / 2, block.y + block.height / 2, "doubleBall");
                } else { // Nếu là chướng ngại vật
                    block.break = false; // Không phá gạch
                    ball.velocityY *= -1; // Đổi hướng di chuyển theo trục y


                }
            }

            else if (leftCollision(ball, block) || rightCollision(ball, block)){
                if(!block.isObstacle){ // Nếu không phải là chướng ngại vật
                    block.break = true;
                    ball.velocityX *= -1;
                    score += 100;
                    blockCount -= 1;
                    createPowerUp(block.x + block.width / 2, block.y + block.height / 2, "doubleBall");
                } else { // Nếu là chướng ngại vật
                    block.break = false; // Không phá gạch
                    ball.velocityX *= -1; // Đổi hướng di chuyển theo trục x
                }
            }

            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }



    // Xử lý quả bóng phụ
    balls.forEach(function(ball) {
        // Xử lý va chạm giữa quả bóng phụ và block
        for (let i = 0; i < blockArray.length; i++) {
            let block = blockArray[i];
            if (!block.break && detectCollision(ball, block)) {
                block.break = true;     // phá vỡ block
                score += 100;           // cộng điểm
                blockCount -= 1;        // giảm số block còn lại
                createPowerUp(block.x + block.width / 2, block.y + block.height / 2, "doubleBall");
            }
        }
    });

    updatePowerUps();

    frameCount++;
    if (frameCount % (60 * 3) === 0) {
        let randomX = Math.floor(Math.random() * (boardWidth - powerUpWidth));
        createBomb(randomX, 0, "bomb");
    }
    if(currentLevel === 4) {
        updateObstacles();
    }

    if (playerHitPowerUp) {
        balls.forEach(function(ball) {
            if (topCollision(ball, player) || bottomCollision(ball, player)) {
                ball.velocityY *= -1;
            } else if (leftCollision(ball, player) || rightCollision(ball, player)) {
                ball.velocityX *= -1;
            }
        });
    }

    if(currentLevel === 5) {
        startAddingBlocks();s
    }
    //next level
    if (blockCount == 0) {
        score += 100 * blockRows * blockColumns; //điểm thưởng
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        gameOver = true; // Đặt trạng thái gameOver thành true

        // Hiển thị thông báo "You win"
        context.font = "50px sans-serif";
        context.fillStyle = "green"; // Màu chữ
        context.fillText("You win", 160, 200);
    }

    //điểm
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = "Score: " + score;

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
    if (e.code == "ArrowLeft" || e.key == "a"|| e.key == "A") {
        // player.x -= player.velocityX;
        let nextplayerX = player.x - player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
    }
    else if (e.code == "ArrowRight" || e.key == "d" || e.key == "D") {
        let nextplayerX = player.x + player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
        // player.x += player.velocityX;
    }
}

// Kiểm tra va chạm giữa 2 đối tượng bất kỳ
function detectCollision(a, b) {
    return a.x < b.x + b.width &&    // Kiểm tra xem góc trên bên trái của a có vượt qua góc trên bên phải của b không
        a.x + a.width > b.x &&    // Kiểm tra xem góc trên bên phải của a có vượt qua góc trên bên trái của b không
        a.y < b.y + b.height &&   // Kiểm tra xem góc trên bên trái của a có vượt qua góc dưới bên trái của b không
        a.y + a.height > b.y;     // Kiểm tra xem góc dưới bên trái của a có vượt qua góc trên bên trái của b không
}

function topCollision(ball, block) { //a ở trên b (bóng ở trên khối)
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) { //a ở trên b (bóng ở dưới khối)
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) { // a nằm bên trái b (bóng nằm bên trái khối)
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) { //a ở bên phải b (bóng ở bên phải khối)
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}


function createBlocks() {
    blockArray = []; //xóa tất cả khối
    let initialBlockWidth = 50; // Kích thước ban đầu của block
    let initialBlockHeight = 10; // Kích thước ban đầu của block
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x : blockX + c*initialBlockWidth + c*10, //c*10 khoảng cách các cột cách nhau 10 pixel
                y : blockY + r*initialBlockHeight + r*10, //r*10 khoảng cách các hàng cách nhau 10 pixel
                width : initialBlockWidth,
                height : initialBlockHeight,
                break : false,
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

//block của level 3
function createBlocksLevel3() {

    //Thay đổi kích thước của board
    boardWidth = 800;
    boardHeight = 600;

    // Cập nhật lại kích thước của board
    board.width = boardWidth;
    board.height = boardHeight;

    // Cập nhật các giá trị liên quan đến vị trí và kích thước của block dựa trên kích thước mới của board
    blockX = 10; // Có thể cần điều chỉnh lại vị trí ban đầu của block
    blockY = 45; // Có thể cần điều chỉnh lại vị trí ban đầu của block
    blockWidth = 30; // Có thể cần điều chỉnh lại kích thước của block
    blockHeight = 10; // Có thể cần điều chỉnh lại kích thước của block

    let playerY = boardHeight - playerHeight - 20; // Đặt player cách đáy của board 10 đơn vị

    // Cập nhật player
    player = {
        x : boardWidth/2 - playerWidth/2,
        y : playerY ,
        width: playerWidth,
        height: playerHeight,
        velocityX : playerVelocityX
    };
    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width: ballWidth,
        height: ballHeight,
        velocityX : ballVelocityX,
        velocityY : ballVelocityY
    }

    blockArray = []; // Xóa tất cả khối

    // Tạo tam giác cân với số lượng khối tăng dần từ hàng đầu tiên đến hàng thứ mười
    for (let i = 0; i < 10; i++) {
        let rowY = blockY + i * (blockHeight + 10); // Tính toán vị trí y của hàng hiện tại
        let rowBlocks = i + 1; // Số lượng khối trong hàng hiện tại
        let startX = (boardWidth - rowBlocks * (blockWidth + 10) + 10) /2; // Tính toán vị trí x của khối đầu tiên trong hàng

        // Tạo các block trong hàng
        for (let j = 0; j < rowBlocks; j++) {
            blockArray.push({
                x: startX + j * (blockWidth + 10), // Dịch khối sang phải
                y: rowY, // Giữ nguyên vị trí y của hàng
                width: blockWidth,
                height: blockHeight,
                break: false
                // Các thuộc tính khác của khối nếu cần
            });
        }
    }

    // Tạo các block không thể phá hủy ở hàng thứ 11
    let obstacleBlockWidth =40; // Chiều rộng của mỗi khối chướng ngại vật
    let obstacleBlockHeight = 5; // Chiều cao của khối chướng ngại vật
    let obstacleBlockY = blockY + 10 * (blockHeight + 10); // Vị trí y của hàng chướng ngại vật
    for (let k = 0; k < 10; k++) {
        let obstacleBlock = {
            x: obstacleBlockWidth*k + k*50 , // tính vị trí khối và k*50 là khoảng cách 50px
            y: obstacleBlockY, // Giữ nguyên vị trí y của hàng chướng ngại vật
            width: obstacleBlockWidth,
            height: obstacleBlockHeight,
            break: false,
            isObstacle: true // Đánh dấu khối là chướng ngại vật
        };
        blockArray.push(obstacleBlock); // Thêm khối chướng ngại vật vào mảng blockArray

    }

    blockCount = blockArray.length;

}
//level 4
function createBlocksLevel4() {
    // Số lượng hàng block
    let numRows = 7;

    // Định dạng board
    boardWidth = 800;
    boardHeight = 600;
    board.width = boardWidth;
    board.height = boardHeight;

    // Kích thước khối ban đầu
    let blockWidth = 50;
    let blockHeight = 20;

    // Khoảng cách giữa các khối trong hàng và hàng
    let blockSpacingX = 10;
    let blockSpacingY = 10;
    // Xóa tất cả các block hiện có
    blockArray = [];

    let playerY = boardHeight - playerHeight - 20; // Đặt player cách đáy của bảng 10 đơn vị

    player = {
        x : boardWidth/2 - playerWidth/2,
        y : playerY,
        width: playerWidth,
        height: playerHeight,
        velocityX : playerVelocityX
    };
    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width: ballWidth,
        height: ballHeight,
        velocityX : ballVelocityX,
        velocityY : ballVelocityY
    }


    // Tính toán tổng chiều rộng của tất cả các block trong hàng
    let totalRowWidth = numRows * blockWidth + (numRows - 1) * blockSpacingX;

    // Vị trí bắt đầu của hàng khối đầu tiên
    let startX = (boardWidth - totalRowWidth) / 2;
    let startY = 50;

    // Tạo các block theo hình dạng hình tam giác ngược
    for (let row = 0; row < numRows; row++) {
        // Số lượng khối trong hàng
        let numBlocks = numRows - row;

        // Vị trí y của hàng khối hiện tại
        let rowY = startY + row * (blockHeight + blockSpacingY);

        // Vị trí x của khối đầu tiên trong hàng
        let rowStartX = startX + (row * (blockWidth + blockSpacingX)) / 2;

        // Tạo các khối trong hàng
        for (let col = 0; col < numBlocks; col++) {
            let blockX = rowStartX + col * (blockWidth + blockSpacingX);
            let block = {
                x: blockX,
                y: rowY,
                width: blockWidth,
                height: blockHeight,
                break: false
            };
            blockArray.push(block);
        }
    }

    // Thêm chướng ngại vật
    let obstacleWidth = 100;
    let obstacleHeight = 10;
    let obstacleX = (boardWidth - obstacleWidth) / 2;
    let obstacleY = startY + numRows * (blockHeight + blockSpacingY) + 50; // Đặt chướng ngại vật phía dưới tam giác
    for (let i = 0; i < 3; i++) {
        let obstacle = {
            x: obstacleX*i + i*10,
            y: obstacleY,
            width: obstacleWidth,
            height: obstacleHeight,
            break: false,
            isObstacle: true
        };
        blockArray.push(obstacle);
    }

    blockCount = blockArray.length;
}

function resetGameLevel4() {
    // Thực hiện các thao tác cần thiết để bắt đầu lại level 4
    powerUps = [];
    // xoá tất cả vật phẩm
    clearInterval(powerUpInterval);
    resetGame();
}


function createBlocksLevel5() {
    blockArray = []; // Xóa blockArray

    // Thay đổi kích thước của board
    boardWidth = 800;
    boardHeight = 600;

    // Cập nhật lại kích thước của board
    board.width = boardWidth;
    board.height = boardHeight;

    let playerY = boardHeight - playerHeight - 20; // Đặt player cách đáy của board 10 đơn vị

    // Tạo người chơi dưới dạng hình tròn
    player = {
        x : boardWidth/2 - playerWidth/2,
        y : playerY,
        width: playerWidth,
        height: playerHeight,
        velocityX : playerVelocityX
    };

    let blockColumns = 13;
    let initialBlockWidth = 50; // Kích thước ban đầu của block
    let initialBlockHeight = 10; // Kích thước ban đầu của block

    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x: blockX + c * initialBlockWidth + c * 10, //c*10 space 10 pixels apart columns
                y: blockY + r * initialBlockHeight + r * 10, //r*10 space 10 pixels apart rows
                width: initialBlockWidth,
                height: initialBlockHeight,
                break: false,
            };
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
    balls = [];
    powerUps = [];
}
let timerId;
function addRowOfBlocks() {
    if (blockRows < blockMaxRows) {
        // Tăng số lượng hàng khối lên 1
        blockRows++;

        // Xóa hết block cũ
        blockArray = [];

        // Tạo lại các block với số lượng hàng khối mới
        createBlocksLevel5();
    }
}

// Bắt đầu vẽ thêm một hàng khối mới mỗi 5 giây
function startAddingBlocks() {
    timerId = setInterval(addRowOfBlocks, 5000); // 5000 milliseconds = 5 giây
}

// Dừng việc vẽ thêm hàng khối
function stopAddingBlocks() {
    clearInterval(timerId);
}
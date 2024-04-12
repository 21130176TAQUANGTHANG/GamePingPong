let boardwidth = 500;
let boardheight = 500;
let level;
let context;

let gameStatus = "menu";// cập nhập trạng thái game
//player
let playerWidth =80;
let playrerHeight =10;
let playerVelocityX = 10;// van toc di chuyen thanh ngang


let player = {
    //toa do x
    x : boardwidth/2 - playerWidth/2,
    //toa do y
    y :boardheight - playrerHeight -5,
    // cau hinh chieu dai va rong
    width : playerWidth,
    height : playrerHeight,
    //van toc di chuyen
    velocityX : playerVelocityX
}
// bóng 
let ballwidth =10;
let ballheight =10;
// chinh huong qua bong roi xuong duoi
let ballVelocityX =2; 
let ballVelocityY=3;


//khối
let blockArray = [];
let blockWidth = 50;
let blockHeigt = 10;
let blockColumns = 8;
let blockRows = 3; // tăng thêm khi qua level mới
let blockMaxRows =10; // giới hạn số dòng (tránh trường hợp hiều quá)
let blockCount =0; // biến đếm số lượng phá huỷ khối


//
let blockX = 15;
let blockY =45;

let score =0;
let gameOver = false;



let ball ={
    x : boardwidth/2,
    y: boardheight/2,
    width : ballwidth,
    height: ballheight,
    velocityX : ballVelocityX,
    velocityY : ballVelocityY
}


window.onload = function(){
    const menu = document.getElementById("menu");
    const startGame = document.getElementById("startGame");
    const returnGame = document.getElementById("returnGame");
    const canvas = document.getElementById("board-one");

    startGame.addEventListener("click", function(){
        canvas.style.display = "block";
        startGame.style.display = "none";
        returnGame.style.display = "block";
        menu.style.display = "none";
        gameStatus = "playing";
        update();
        
    });

    returnGame.addEventListener("click", function(){
        canvas.style.display = "none";
        startGame.style.display = "block";
        returnGame.style.display = "none";
        menu.style.display = "block";
        gameStatus = "menu";
        resetGame();
    });


    level = document.getElementById("board-one");
    level.height = boardheight;
    level.width = boardwidth;
    context = level.getContext("2d");

    //draw initial play
    context.fillStyle = "skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);
    
    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);

    // khởi tạo các khối
    createBlocks();

    // khởi tạo nút đóng
    const closeButton = document.createElement("button");
    // định dạng nút đóng 
    closeButton.innerText = "X";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.padding = "10px 20px";
    closeButton.style.fontSize = "16px";
    closeButton.style.backgroundColor = "darkred";
    closeButton.style.color = "white";
    closeButton.style.border = "none";
    closeButton.style.borderRadius = "5px";
    closeButton.style.display = "none";
    // chức năng hover cho nút đóng
    //--- mouseout: khi rời chuột "khỏi" nút đóng
    closeButton.addEventListener("mouseout", function() {
        closeButton.style.backgroundColor = "darkred";
    });
    //--- mouseover: khi di chuyển chuột "vào" nút đóng
    closeButton.addEventListener("mouseover", function() {
        closeButton.style.backgroundColor = "red";
    });
    //xử lý sự kiện click vào nút đóng
    closeButton.addEventListener("click", function() {
        // delete the game
        level.remove();
        closeButton.remove();
    });
    document.body.appendChild(closeButton);

    //chức năng bắt đầu game
    const startButton = document.getElementById(".start-button");
    startButton.addEventListener("click", function() {
        startButton.remove();
        gameStatus = "playing";
        menu.style.display = "none";
    });
    document.body.appendChild(startButton);
}


//trong game
function update(){
    if(gameStatus == "playing"){
    
        requestAnimationFrame(update); 
        
        if(gameOver){
             return;
        }
    
        context.clearRect(0,0,level.width,level.height);
    
    
        context.fillStyle="skyblue";
        context.fillRect(player.x, player.y, player.width, player.height);
    
        context.fillStyle="white";
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        context.fillRect(ball.x, ball.y, ball.width, ball.height);
    
    
        // bóng nảy bật khi va chạm tường
        if(ball.y <= 0 ){
            // nếu quả bóng va chạm vào phía trên canvas
            // thì * -1 để đảo ngược lại hướng bóng bay
            ball.velocityY *=-1;
        }
        //      đường viền bên trái    đường viền bên phải
        else if ( ball.x <=0 || (ball.x + ball.width) >= boardwidth){
           // thì * -1 để đảo ngược lại hướng bóng bay
            ball.velocityX *= -1;
        }
        //nếu quả bóng chạm đáy
        else if((ball.y + ball.height) >= boardheight){
            //trò chơi kết thúc
            context.font = "20px sans -serif";
            context.fillText("Game Over: Press 'SPACE' to restart", 100,400);
            gameOver = true;
    
        } 
        // va chạm bóng
        if(topCollision(ball,player) || bottomCollision(ball, player)){
            ball.velocityY *= -1;
        }
        else if(leftCollision(ball,player) || rightCollision(ball,player)){
            ball.velocityX *= -1;
        }
    
    
        // vẽ khối
        context.fillStyle = "skyblue";
        for (let index = 0; index < blockArray.length; index++) {
            let block = blockArray[index];
            if(!block.break){
                //kiểm tra sự va chạm quả bóng với khôi.
                // Nếu bóng chạm thì sẽ phá vỡ khối.
                if(topCollision(ball, block) || bottomCollision(ball, block)){
                    block.break = true;
                    ball.velocityY *=-1;
                    blockCount -=1;
                    score +=100;
                }
                else if (leftCollision(ball, block) || rightCollision(ball,block)){
                    block.break= true;
                    ballVelocityX *=-1;
                    blockCount -=1;
                    score +=100;
                }
                context.fillRect(block.x, block.y, block.width,block.height);
            }
            
        }
            // kiểm tra level
            if(blockCount ==0){
                score += 100*blockColumns; // điểm thưởng
                blockRows = Math.min(blockRows +1, blockMaxRows);
                createBlocks();
            }
    
    
            // điểm
            context.font = "20px sans-serif";
            context.fillText(score,10,25);
    }
}


// giới hạn chiều rộng
function outOfBonus(xPosition){
    return (xPosition < 0 || xPosition + playerWidth > boardwidth);
}


// di chuyen thanh ngang sang trai - phai
function movePlayer(e){
    if(gameOver){
        if(e.code == 'Space'){
            resetGame();
        }
    }

    if(e.code == "ArrowLeft"){
        // player.x -= player.velocityX;
        let nextPlayerX = player.x - player.velocityX;
        if(!outOfBonus(nextPlayerX)){
            player.x = nextPlayerX;
        }

    }else if(e.code == "ArrowRight"){
        // player.x += player.velocityX;
        let nextPlayerX = player.x + player.velocityX;
        if(!outOfBonus(nextPlayerX)){
            player.x = nextPlayerX;
        }
    }
}
// phát hiện sự va chạm
function detectCollision(a,b){
    return a.x < b.x + b.width && // góc bên trái của a không chạm vào góc bên phải của b
            a.x + a.width > b.x &&// góc trên cùng bên phải của a
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}
function topCollision (ball, block){
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;   
}
function bottomCollision (ball, block){
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y
}
function leftCollision(ball,block){
    return detectCollision(ball,block) && (ball.x + ball.width) >= block.x;
}
function rightCollision( ball, block){
    return detectCollision(ball, block) && (block.x + block.width) >= block.x;
}
function createBlocks(){
    blockArray = [];// tạo các block
    for (let index = 0; index < blockColumns; index++) {
       for(let r = 0; r < blockRows; r++){
        let block = {
            x : blockX + index*blockWidth + index*10,
            y : blockY + r*blockHeigt + r*10,
            width : blockWidth,
            height : blockHeigt,
            break : false
        }
        blockArray.push(block);
       }
        
    }
    blockCount = blockArray.length;
}
function resetGame(){
    gameOver = false;
    player = {
        //toa do x
        x : boardwidth/2 - playerWidth/2,
        //toa do y
        y :boardheight - playrerHeight -5,
        // cau hinh chieu dai va rong
        width : playerWidth,
        height : playrerHeight,
        //van toc di chuyen
        velocityX : playerVelocityX
    }
    ball ={
        x : boardwidth/2,
        y: boardheight/2,
        width : ballwidth,
        height: ballheight,
        velocityX : ballVelocityX,
        velocityY : ballVelocityY
    }
    blockArray = [];
    blockRows=3;
    score =0;
    createBlocks();
}
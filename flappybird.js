// High score
let highScore = localStorage.getItem('highScore') ? parseFloat(localStorage.getItem('highScore')) : 0;

// Image sources for dark mode
let db = "images/flappybird.png";
let dtp = "images/toppipe.png";
let dbp = "images/bottompipe.png";

// Board setup
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Bird setup
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

// Pipes setup
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Physics setup
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    // Load initial images
    loadImages();

    // Start the game loop
    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);
    board.addEventListener("touchstart", handleTouchStart); // Add touch control
    board.addEventListener("touchend", handleTouchEnd); // Add touch control

    // Display initial high score
    document.getElementsByClassName('highScore')[0].innerHTML = `High Score => ${highScore}`;

    // Add dark mode toggle button event listener
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
}

function loadImages() {
    // Load bird image
    birdImg = new Image();
    birdImg.src = db;
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    // Load top pipe image
    topPipeImg = new Image();
    topPipeImg.src = dtp;

    // Load bottom pipe image
    bottomPipeImg = new Image();
    bottomPipeImg.src = dbp;
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Bird movement
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // Pipes movement
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            document.getElementsByClassName('currentScore')[0].innerHTML = `Current Score => ${score}`;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore); // Save the new high score to local storage
                document.getElementsByClassName('highScore')[0].innerHTML = `High Score => ${highScore}`;
            }

            //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Clear pipes that are off screen
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    // Display score
    context.fillStyle = "white";
    context.font = "45px sans-serif";

    if (gameOver) {
        context.fillText("GAME OVER", 50, 50);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    // Random pipe placement
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    // Ensure the bird moves only for specific keys or touch events
    if (e.type === "keydown" && (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") || e.type === "touchstart") {
        console.log("Bird flying!");
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function handleTouchStart(e) {
    // Prevent the default behavior for touch events
    e.preventDefault();
    console.log("Touch start detected");
    moveBird({ type: "touchstart" });
}

function handleTouchEnd(e) {
    // Prevent the default behavior for touch events
    e.preventDefault();
    console.log("Touch end detected");
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function toggleDarkMode() {
    // Toggle between light and dark mode image sources
    if (db === "images/flappybird.png") {
        db = "images/lbg.png";
        dtp = "images/ltp.png";
        dbp = "images/lbp.png";
    } else {
        db = "images/flappybird.png";
        dtp = "images/toppipe.png";
        dbp = "images/bottompipe.png";
    }

    // Clear the canvas
    context.clearRect(0, 0, board.width, board.height);

    // Reload images and redraw canvas
    loadImages();
}

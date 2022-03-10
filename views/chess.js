const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

const TILE_SIZE = 62.5;
const GOLD_TILE_COLOR = "rgb(107, 107, 107)";
const SILVER_TILE_COLOR = "rgb(51, 51, 51)";
const HIGHLIGHT_COLOR = "rgb(56, 93, 56)";
const GOLD = 0;
const SILVER = 1;

const EMPTY = -1;
const PAWN = 0;
const KNIGHT = 1;
const BISHOP = 2;
const ROOK = 3;
const QUEEN = 4;
const KING = 5;

const INVALID = 0;
const VALID = 1;
const VALID_CAPTURE = 2;

const piecesCharacters = {
    0: '♙',
    1: '♘',
    2: '♗',
    3: '♖',
    4: '♕',
    5: '♔'
};

let chessCanvas;
let chessCtx;
let currentTeamText;
let GOLDCasualitiesText;
let SILVERCasualitiesText;
let totalVictoriesText;

let board;
let currentTeam;

let curX;
let curY;

let GOLDCasualities;
let SILVERCasualities;

let GOLDVictories;
let SILVERVictories;

document.addEventListener("DOMContentLoaded", onLoad);

function onLoad() {
    chessCanvas = document.getElementById("chessCanvas");
    chessCtx = chessCanvas.getContext("2d");
    chessCanvas.addEventListener("click", onClick);

    currentTeamText = document.getElementById("currentTeamText");

    GOLDCasualitiesText = document.getElementById("GOLDCasualities");
    SILVERCasualitiesText = document.getElementById("SILVERCasualities");

    totalVictoriesText = document.getElementById("totalVictories");
    GOLDVictories = 0;
    SILVERVictories = 0;
    
    startGame();
}

function startGame() {    
    board = new Board();
    curX = -1;
    curY = -1;

    currentTeam = GOLD;
    currentTeamText.textContent = "Gold's turn";

    GOLDCasualities = [0, 0, 0, 0, 0];
    SILVERCasualities = [0, 0, 0, 0, 0];

    repaintBoard();
    updateGOLDCasualities();
    updateSILVERCasualities();
    updateTotalVictories();
}

function onClick(event) {
    let chessCanvasX = chessCanvas.getBoundingClientRect().left;
    let chessCanvasY = chessCanvas.getBoundingClientRect().top;

    let x = Math.floor((event.clientX-chessCanvasX)/TILE_SIZE);
    let y = Math.floor((event.clientY-chessCanvasY)/TILE_SIZE);

    if (checkValidMovement(x, y) === true) {
        if (checkValidCapture(x, y) === true) {
            if (board.tiles[y][x].pieceType === KING) {
                if (currentTeam === GOLD) GOLDVictories++;
                else SILVERVictories++;

                startGame();
            }

            if (currentTeam === GOLD) {
                SILVERCasualities[board.tiles[y][x].pieceType]++;
                updateSILVERCasualities();
            } else {
                GOLDCasualities[board.tiles[y][x].pieceType]++;
                updateGOLDCasualities();
            }
        }

        moveSelectedPiece(x, y);

        changeCurrentTeam();
    } else {
        curX = x;
        curY = y;
    }

    repaintBoard();
}

function checkPossiblePlays() {
    if (curX < 0 || curY < 0) return;

    let tile = board.tiles[curY][curX];
    if (tile.team === EMPTY || tile.team !== currentTeam) return;

    drawTile(curX, curY, HIGHLIGHT_COLOR);

    board.resetValidMoves();

    if (tile.pieceType === PAWN) checkPossiblePlaysPawn(curX, curY);
    else if (tile.pieceType === KNIGHT) checkPossiblePlaysKnight(curX, curY);
    else if (tile.pieceType === BISHOP) checkPossiblePlaysBishop(curX, curY);
    else if (tile.pieceType === ROOK) checkPossiblePlaysRook(curX, curY);
    else if (tile.pieceType === QUEEN) checkPossiblePlaysQueen(curX, curY);
    else if (tile.pieceType === KING) checkPossiblePlaysKing(curX, curY);
}

function checkPossiblePlaysPawn(curX, curY) {
    let direction;

    if (currentTeam === GOLD) direction = -1;
    else direction = 1;

    if (curY+direction < 0 || curY+direction > BOARD_HEIGHT-1) return;

    // Advance one tile
    checkPossibleMove(curX, curY+direction);

    // First double move
    if(checkPossibleMove(curX, curY+direction)){
        if (curY === 1 || curY === 6) {
            onPassant = true;
            checkPossibleMove(curX, curY+2*direction);
        }
    }

    // Check diagonal left capture
    if (curX-1 >= 0) checkPossibleCapture(curX-1, curY+direction);

    // Check diagonal right capture
    if (curX+1 <= BOARD_WIDTH-1) checkPossibleCapture(curX+1, curY+direction);
}

function checkPossiblePlaysKnight(curX, curY) {
    // Far left moves
    if (curX-2 >= 0) {
        // Upper move
        if (curY-1 >= 0) checkPossiblePlay(curX-2, curY-1);

        // Lower move
        if (curY+1 <= BOARD_HEIGHT-1) checkPossiblePlay(curX-2, curY+1);
    }

    // Near left moves
    if (curX-1 >= 0) {
        // Upper move
        if (curY-2 >= 0) checkPossiblePlay(curX-1, curY-2);

        // Lower move
        if (curY+2 <= BOARD_HEIGHT-1) checkPossiblePlay(curX-1, curY+2);
    }

    // Near right moves
    if (curX+1 <= BOARD_WIDTH-1) {
        // Upper move
        if (curY-2 >= 0) checkPossiblePlay(curX+1, curY-2);

        // Lower move
        if (curY+2 <= BOARD_HEIGHT-1) checkPossiblePlay(curX+1, curY+2);
    }

    // Far right moves
    if (curX+2 <= BOARD_WIDTH-1) {
        // Upper move
        if (curY-1 >= 0) checkPossiblePlay(curX+2, curY-1);

        // Lower move
        if (curY+1 <= BOARD_HEIGHT-1) checkPossiblePlay(curX+2, curY+1);
    }
}

function checkPossiblePlaysRook(curX, curY) {
    // Upper move
    for (let i = 1; curY-i >= 0; i++) {
        if (checkPossiblePlay(curX, curY-i)) break;
    }

    // Right move
    for (let i = 1; curX+i <= BOARD_WIDTH-1; i++) {
        if (checkPossiblePlay(curX+i, curY)) break;
    }

    // Lower move
    for (let i = 1; curY+i <= BOARD_HEIGHT-1; i++) {
        if (checkPossiblePlay(curX, curY+i)) break;
    }

    // Left move
    for (let i = 1; curX-i >= 0; i++) {
        if (checkPossiblePlay(curX-i, curY)) break;
    }
}

function checkPossiblePlaysBishop(curX, curY) {
    // Upper-right move
    for (let i = 1; curX+i <= BOARD_WIDTH-1 && curY-i >= 0; i++) {
        if (checkPossiblePlay(curX+i, curY-i)) break;
    }

    // Lower-right move
    for (let i = 1; curX+i <= BOARD_WIDTH-1 && curY+i <= BOARD_HEIGHT-1; i++) {
        if (checkPossiblePlay(curX+i, curY+i)) break;
    }

    // Lower-left move
    for (let i = 1; curX-i >= 0 && curY+i <= BOARD_HEIGHT-1; i++) {
        if (checkPossiblePlay(curX-i, curY+i)) break;
    }

    // Upper-left move
    for (let i = 1; curX-i >= 0 && curY-i >= 0; i++) {
        if (checkPossiblePlay(curX-i, curY-i)) break;
    }
}

function checkPossiblePlaysQueen(curX, curY) {
    checkPossiblePlaysBishop(curX, curY);
    checkPossiblePlaysRook(curX, curY);
}

function checkPossiblePlaysKing(curX, curY) {
    for (let i = -1; i <= 1; i++) {
        if (curY+i < 0 || curY+i > BOARD_HEIGHT-1) continue;

        for (let j = -1; j <= 1; j++) {
            if (curX+j < 0 || curX+j > BOARD_WIDTH-1) continue;
            if (i == 0 && j == 0) continue;

            checkPossiblePlay(curX+j, curY+i);
        }
    }
}

function checkPossiblePlay(x, y) {
    if (checkPossibleCapture(x, y)) return true;

    return !checkPossibleMove(x, y);
}

function checkPossibleMove(x, y) {
    try {
    if (board.tiles[y][x].team !== EMPTY) return false;
    board.validMoves[y][x] = VALID;
    drawCircle(x, y, HIGHLIGHT_COLOR);
    return true;
    } catch (error) {
        console.log(`X: ${x} Y: ${y}`);
        return false;
    }
}

function checkPossibleCapture(x, y) {
    if (board.tiles[y][x].team !== getOppositeTeam(currentTeam)) return false;
    
    board.validMoves[y][x] = VALID_CAPTURE;
    drawCorners(x, y, HIGHLIGHT_COLOR);
    return true;
}

function checkValidMovement(x, y) {
    if (board.validMoves[y][x] === VALID || board.validMoves[y][x] === VALID_CAPTURE) return true;
    else return false;
}

function checkValidCapture(x, y) {
    if (board.validMoves[y][x] === VALID_CAPTURE) return true;
    else return false;
}

function moveSelectedPiece(x, y) { 
    board.tiles[y][x].pieceType = board.tiles[curY][curX].pieceType;
    board.tiles[y][x].team = board.tiles[curY][curX].team;

    board.tiles[curY][curX].pieceType = EMPTY;
    board.tiles[curY][curX].team = EMPTY;

    curX = -1;
    curY = -1;
    board.resetValidMoves();
}

function changeCurrentTeam() {
    if (currentTeam === GOLD) {
        currentTeamText.textContent = "Silver's turn";
        currentTeam = SILVER;
    } else {
        currentTeamText.textContent = "Gold's turn";
        currentTeam = GOLD;
    }
}

function repaintBoard() {
    drawBoard();
    checkPossiblePlays();
    drawPieces();
}

function drawBoard() {
    chessCtx.fillStyle = GOLD_TILE_COLOR;
    chessCtx.fillRect(0, 0, BOARD_WIDTH*TILE_SIZE, BOARD_HEIGHT*TILE_SIZE);
    
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if ((i+j)%2 === 1) {
                drawTile(j, i, SILVER_TILE_COLOR);
            }
        }
    }
}

function drawTile(x, y, fillStyle) {
    chessCtx.fillStyle = fillStyle;
    chessCtx.fillRect(TILE_SIZE*x, TILE_SIZE*y, TILE_SIZE, TILE_SIZE);
}

function drawCircle(x, y, fillStyle) {
    chessCtx.fillStyle = fillStyle;
    chessCtx.beginPath();
    chessCtx.arc(TILE_SIZE*(x+0.5), TILE_SIZE*(y+0.5), TILE_SIZE/5, 0, 2*Math.PI);
    chessCtx.fill();
}

function drawCorners(x, y, fillStyle) {
    chessCtx.fillStyle = fillStyle;

    chessCtx.beginPath();
    chessCtx.moveTo(TILE_SIZE*x, TILE_SIZE*y);
    chessCtx.lineTo(TILE_SIZE*x+15, TILE_SIZE*y);
    chessCtx.lineTo(TILE_SIZE*x, TILE_SIZE*y+15);
    chessCtx.fill();

    chessCtx.beginPath();
    chessCtx.moveTo(TILE_SIZE*(x+1), TILE_SIZE*y);
    chessCtx.lineTo(TILE_SIZE*(x+1)-15, TILE_SIZE*y);
    chessCtx.lineTo(TILE_SIZE*(x+1), TILE_SIZE*y+15);
    chessCtx.fill();

    chessCtx.beginPath();
    chessCtx.moveTo(TILE_SIZE*x, TILE_SIZE*(y+1));
    chessCtx.lineTo(TILE_SIZE*x+15, TILE_SIZE*(y+1));
    chessCtx.lineTo(TILE_SIZE*x, TILE_SIZE*(y+1)-15);
    chessCtx.fill();

    chessCtx.beginPath();
    chessCtx.moveTo(TILE_SIZE*(x+1), TILE_SIZE*(y+1));
    chessCtx.lineTo(TILE_SIZE*(x+1)-15, TILE_SIZE*(y+1));
    chessCtx.lineTo(TILE_SIZE*(x+1), TILE_SIZE*(y+1)-15);
    chessCtx.fill();
}

function drawPieces() {
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if (board.tiles[i][j].team === EMPTY) continue;
            
            if (board.tiles[i][j].team === GOLD) {
                chessCtx.fillStyle = "#FFD700"; //gold (w)
            } else {
                chessCtx.fillStyle = "#C0C0C0"; //silver (b)
            }
            
            chessCtx.font = "3.2vw Arial";
            let pieceType = board.tiles[i][j].pieceType;
            chessCtx.fillText(piecesCharacters[pieceType], TILE_SIZE*(j+1/8), TILE_SIZE*(i+4/5));
        }
    }
}

function updateGOLDCasualities() {
    updateCasualities(GOLDCasualities, GOLDCasualitiesText);
}

function updateSILVERCasualities() {
    updateCasualities(SILVERCasualities, SILVERCasualitiesText);
}

function updateCasualities(casualities, text) {
    let none = true;

    for (let i = QUEEN; i >= PAWN; i--) {
        if (casualities[i] === 0) continue;

        if (none) {
            text.textContent = casualities[i] + " " + piecesCharacters[i];
            none = false;
        } else {
            text.textContent += " - " + casualities[i] + " " + piecesCharacters[i];
        }
    }

    if (none) text.textContent = "No pieces captured.";
}

function updateTotalVictories() {
    totalVictoriesText.textContent = "Games won: gold " + GOLDVictories + " - silver " + SILVERVictories;
}

function getOppositeTeam(team) {
    if (team === GOLD) return SILVER;
    else if (team === SILVER) return GOLD;
    else return EMPTY;
}

class Board {
    constructor() {
        this.tiles = [];

        this.tiles.push([
            new Tile(ROOK, SILVER),
            new Tile(KNIGHT, SILVER),
            new Tile(BISHOP, SILVER),
            new Tile(QUEEN, SILVER),
            new Tile(KING, SILVER),
            new Tile(BISHOP, SILVER),
            new Tile(KNIGHT, SILVER),
            new Tile(ROOK, SILVER)
        ]);

        this.tiles.push([
            new Tile(PAWN, SILVER),
            new Tile(PAWN, SILVER),
            new Tile(PAWN, SILVER),
            new Tile(PAWN, SILVER),
            new Tile(PAWN, SILVER),
            new Tile(PAWN, SILVER),
            new Tile(PAWN, SILVER),
            new Tile(PAWN, SILVER)
        ]);

        for (let i = 0; i < 4; i++) {
            this.tiles.push([
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
            ]);
        }

        this.tiles.push([
            new Tile(PAWN, GOLD),
            new Tile(PAWN, GOLD),
            new Tile(PAWN, GOLD),
            new Tile(PAWN, GOLD),
            new Tile(PAWN, GOLD),
            new Tile(PAWN, GOLD),
            new Tile(PAWN, GOLD),
            new Tile(PAWN, GOLD)
        ]);

        this.tiles.push([
            new Tile(ROOK, GOLD),
            new Tile(KNIGHT, GOLD),
            new Tile(BISHOP, GOLD),
            new Tile(QUEEN, GOLD),
            new Tile(KING, GOLD),
            new Tile(BISHOP, GOLD),
            new Tile(KNIGHT, GOLD),
            new Tile(ROOK, GOLD)
        ]);

        this.validMoves = [];
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            this.validMoves.push([
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID
            ]);
        }
    }

    resetValidMoves() {
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            for (let j = 0; j < BOARD_WIDTH; j++) {
                this.validMoves[i][j] = INVALID;
            }
        }
    }
}

class Tile {
    constructor(pieceType, team) {
        this.pieceType = pieceType;
        this.team = team;
    }
}

const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('statusMessage');
const resetButton = document.getElementById('resetButton');
const playerVsPlayerBtn = document.getElementById('playerVsPlayerBtn');
const playerVsComputerBtn = document.getElementById('playerVsComputerBtn');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let isPlayerVsComputer = false; // true = PvP, false = PvC

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// --- ฟังก์ชันสำหรับ UI และการตั้งค่าเกม ---
function updateStatus(message) {
    statusMessage.textContent = message;
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    handlePlayerMove(clickedCell, clickedCellIndex);
    checkResult();

    if (gameActive && isPlayerVsComputer && currentPlayer === 'O') {
        setTimeout(computerMove, 500); // หน่วงเวลาให้ดูสมจริง
    }
}

function handlePlayerMove(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer);
}

function changePlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus(`ผู้เล่น ${currentPlayer} ตาเดิน`);
}

function checkResult() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        updateStatus(`ผู้เล่น ${currentPlayer} ชนะ!`);
        gameActive = false;
        return;
    }

    let roundDraw = !board.includes('');
    if (roundDraw) {
        updateStatus('เสมอ!');
        gameActive = false;
        return;
    }

    changePlayer();
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    updateStatus(`เริ่มเกม! ผู้เล่น X ตาเดิน`);
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('X', 'O');
    });

    if (isPlayerVsComputer && currentPlayer === 'O') {
        setTimeout(computerMove, 500);
    }
}

// --- ฟังก์ชันสำหรับโหมด AI (คอมพิวเตอร์) ---
function computerMove() {
    let bestMove = -1;
    let availableMoves = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            availableMoves.push(i);
        }
    }

    // AI Logic (ความยากปานกลาง)
    // 1. ตรวจสอบว่าคอมพิวเตอร์สามารถชนะได้หรือไม่
    for (let i = 0; i < availableMoves.length; i++) {
        const move = availableMoves[i];
        board[move] = 'O'; // ลองเดิน
        if (checkWin('O')) {
            bestMove = move;
            board[move] = ''; // คืนค่า
            break;
        }
        board[move] = ''; // คืนค่า
    }

    // 2. ถ้าคอมพิวเตอร์ไม่สามารถชนะได้, ตรวจสอบว่าผู้เล่นสามารถชนะได้หรือไม่ และบล็อก
    if (bestMove === -1) {
        for (let i = 0; i < availableMoves.length; i++) {
            const move = availableMoves[i];
            board[move] = 'X'; // ลองเดินของผู้เล่น
            if (checkWin('X')) {
                bestMove = move;
                board[move] = ''; // คืนค่า
                break;
            }
            board[move] = ''; // คืนค่า
        }
    }

    // 3. ถ้าไม่มีโอกาสชนะหรือบล็อก, เลือกช่องกลาง
    if (bestMove === -1 && board[4] === '') {
        bestMove = 4;
    }

    // 4. ถ้าไม่มีช่องกลาง, เลือกมุม
    if (bestMove === -1) {
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => board[index] === '');
        if (availableCorners.length > 0) {
            bestMove = availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
    }

    // 5. ถ้ายังไม่มี, เลือกสุ่มจากช่องที่เหลือ
    if (bestMove === -1) {
        bestMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    if (bestMove !== -1 && gameActive) {
        handlePlayerMove(cells[bestMove], bestMove);
        checkResult();
    }
}

// ฟังก์ชันช่วยสำหรับ AI เพื่อตรวจสอบว่าผู้เล่น 'player' ชนะหรือไม่
function checkWin(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];

        if (a === player && b === player && c === player) {
            return true;
        }
    }
    return false;
}

// --- Event Listeners ---
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);

playerVsPlayerBtn.addEventListener('click', () => {
    isPlayerVsComputer = false;
    playerVsPlayerBtn.classList.add('active');
    playerVsComputerBtn.classList.remove('active');
    resetGame();
});

playerVsComputerBtn.addEventListener('click', () => {
    isPlayerVsComputer = true;
    playerVsComputerBtn.classList.add('active');
    playerVsPlayerBtn.classList.remove('active');
    resetGame();
});

// เริ่มต้นเกมเมื่อโหลดหน้าเว็บ
resetGame();
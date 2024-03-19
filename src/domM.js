// Import the necessary classes from the main game file
const { Ship, isGameOver, Board, Player, ComputerPlayer, placeShipsRandomly } = require('./shipBoard');
document.addEventListener('DOMContentLoaded', function () {
  // Create user and computer players
  const userPlayer = new Player('User');
  const computerPlayer = new ComputerPlayer('Computer');

  // Example usage for user and computer boards
  const userContainerId = 'user-board-container';
  const computerContainerId = 'computer-board-container';
  const turnDisplayContainerId = 'turn-display-container';

  // Initialize game boards
  const userBoard = new Board(10);
  const computerBoard = new Board(10);

  // Set the initial turn to be the user's turn
  userPlayer.turn = true;

  // Function to create a grid for a player's board
  function createBoardGrid(board, containerId, clickHandler) {
    const container = document.getElementById(containerId);
  
    // Clear existing content and remove existing event listeners
    container.innerHTML = '';
    container.removeEventListener('click', clickHandler);
  
    // Create the grid
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
  
        // Add click event listener
        cell.addEventListener('click', () => {
          clickHandler(row, col);
        });
  
        container.appendChild(cell);
      }
    }
  }

  // Function to handle user clicks on the user board
  function handleUserBoardClick(row, col) {
    if (userPlayer.turn) {
      console.log(`User board clicked at ${row}, ${col}`);
      const result = userPlayer.playerAttack(computerBoard, row, col);
  
      // Use getShipAt to get the ship at the clicked cell
      const ship = computerBoard.getShipAt(row, col);
  
      console.log(`Attack result: ${result}, Ship:`, ship);
  
      updateBoardDisplay(computerBoard, computerContainerId, false);
      updateTurnDisplay(turnDisplayContainerId, result ? 'Hit!' : 'Miss!');
  
      // Disable further user clicks until it's their turn again
      disableUserClicks();
  
      setTimeout(() => {
        // Call handleTurnEnd after updating the display and disabling clicks
        handleTurnEnd();
      }, 1000); // Delay for visibility, adjust as needed
    }
  }
  
  function disableUserClicks() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
      cell.removeEventListener('click', handleUserBoardClick);
      cell.removeEventListener('click', handleComputerBoardClick); // Add this line to remove event listeners for the computer board
    });
  }
  
  function enableUserClicks() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
      cell.addEventListener('click', handleUserBoardClick);
    });
  }

  // Function to handle computer board clicks
  function handleComputerBoardClick(row, col) {
    // Computer player should not be handling clicks
    console.log('Ignoring computer board click');
  }

  function handleTurnEnd() {
    console.log('handleTurnEnd called');
    
    // If it's the user's turn, switch to the computer's turn after the user makes their attack
    if (userPlayer.turn) {
      userPlayer.turn = false;
      computerPlayer.turn = true;
  
      // Initiate the computer's attack after a short delay
      setTimeout(() => {
        handleComputerTurn();
      }, 1000); // Adjust delay as needed
    }
    // If it's the computer's turn, switch back to the user's turn after the computer makes its attack
    else if (computerPlayer.turn) {
      computerPlayer.turn = false;
      userPlayer.turn = true;
  
      // Clear the turn display after a short delay if the game is not over
      setTimeout(() => {
        updateTurnDisplay(turnDisplayContainerId, '');
      }, 1000);
  
      // Check if the game is over after each player has completed their turn
      if (isGameOver(userBoard.ships) || isGameOver(computerBoard.ships)) {
        console.log('Game is over. Calling handleGameOver...');
        handleGameOver(isGameOver(userBoard.ships) ? 'Computer' : 'User'); // The player whose board is not game over wins
      }
    }
  }

  
  function handleGameOver(winner) {
    console.log(`handleGameOver function called with winner: ${winner}`);
    // Display a message indicating the winner
    updateTurnDisplay(turnDisplayContainerId, `Game Over! ${winner} wins!`);

    // Disable further actions after the game is over
    // For example, remove event listeners from grid cells

    // Optionally, you can restart the game after a delay
    setTimeout(() => {
      // Reset the game state
      resetGame();
    }, 3000); // Adjust delay as needed
}
  
  function resetGame() {
    // Reset the game state here
    userPlayer.turn = true;
    userBoard.reset(); // Implement a reset method in the Board class to clear the grid and ships
    computerBoard.reset();
    
    // Place ships on the user and computer boards
    placeShipsRandomly(userBoard, numShips, shipLength);
    placeShipsRandomly(computerBoard, numShips, shipLength);
  
    // Update the display of the user and computer boards
    updateBoardDisplay(userBoard, userContainerId, true);
    updateBoardDisplay(computerBoard, computerContainerId, false);
  
    // Clear the turn display
    updateTurnDisplay(turnDisplayContainerId, '');
  
    // Log whose turn it is
    console.log(`Initial turn: ${userPlayer.turn ? 'User' : 'Computer'}`);
  }

  function handleComputerTurn() {
    if (computerPlayer.turn) {
        const result = computerPlayer.computerAttack(userBoard);

        // Check if the attack result is a hit
        const isHit = result && result.result === 'Hit';

        // Retrieve the ship object from the user board if it's a hit
        const ship = isHit ? userBoard.getShipAt(result.row, result.col) : null;

        console.log('Computer attack result:', result.result, 'Ship:', ship);

        // Update the display of the user board based on the attack result and ship object
        updateBoardDisplay(userBoard, userContainerId, true, result.row, result.col, isHit, ship);

        // Update the turn display with the attack result
        updateTurnDisplay(turnDisplayContainerId, result.result);

        setTimeout(() => {
            // Call handleTurnEnd after the delay
            handleTurnEnd();
        }, 1000); // Delay for visibility, adjust as needed
    }
}

  // Function to update the display of the player's board
  function updateBoardDisplay(board, containerId, isUserBoard) {
    const container = document.getElementById(containerId);
  
    // Clear existing content
    container.innerHTML = '';
  
    // Update the display
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
  
        // Add classes based on cell state (hit, miss, ship, etc.)
        if (board.grid[row][col] === 1 && isUserBoard) {
          cell.classList.add('ship'); // Visual representation of the ship for the user player
        } else if (board.grid[row][col] === 'X') {
          cell.classList.add('hit');
        } else if (board.grid[row][col] === 'O') {
          cell.classList.add('miss');
        }
  
        // Add click event listener
        if (isUserBoard && userPlayer.turn) {
          cell.addEventListener('click', () => {
            handleUserBoardClick(row, col);
          });
        } else if (!isUserBoard && userPlayer.turn) {
          // Add an event listener to the computer board for the user's turn
          cell.addEventListener('click', () => {
            handleUserBoardClick(row, col);
          });
        }

  
        container.appendChild(cell);
      }
    }
  }

  // Function to update the turn display
  function updateTurnDisplay(turnContainerId, message) {
    const turnContainer = document.getElementById(turnContainerId);
    turnContainer.textContent = message;
  }

  // Call the reset method in the resetGame function
function resetGame() {
  // Reset the game state here
  userPlayer.turn = true;
  userBoard.reset(); // Implement a reset method in the Board class to clear the grid and ships
  computerBoard.reset();
  
  // Place ships on the user and computer boards
  placeShipsRandomly(userBoard, numShips, shipLength);
  placeShipsRandomly(computerBoard, numShips, shipLength);

  // Update the display of the user and computer boards
  updateBoardDisplay(userBoard, userContainerId, true);
  updateBoardDisplay(computerBoard, computerContainerId, false);

  // Clear the turn display
  updateTurnDisplay(turnDisplayContainerId, '');

  // Log whose turn it is
  console.log(`Initial turn: ${userPlayer.turn ? 'User' : 'Computer'}`);
}

  // Log whose turn it is
  console.log(`Initial turn: ${userPlayer.turn ? 'User' : 'Computer'}`);

  // Create the initial grid for user and computer boards
  createBoardGrid(userBoard, userContainerId, handleUserBoardClick);
  createBoardGrid(computerBoard, computerContainerId, handleComputerBoardClick);

  // Place ships on the user and computer boards
  const numShips = 5;
  const shipLength = 2;

  placeShipsRandomly(userBoard, 'User');
  placeShipsRandomly(computerBoard, 'Computer');

  // Example usage:
  // Update the display of the user and computer boards after some game actions
  updateBoardDisplay(userBoard, userContainerId, true); // true indicates the user board
  updateBoardDisplay(computerBoard, computerContainerId, false); // false indicates the computer

  module.exports = {handleComputerBoardClick, handleComputerTurn, handleGameOver, handleTurnEnd, handleUserBoardClick, updateBoardDisplay, updateTurnDisplay, resetGame, createBoardGrid};
});
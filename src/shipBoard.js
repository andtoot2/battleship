class Ship {
  constructor(length, owner) {
    this.length = length;
    this.hits = 0;
    this.sunk = false;
    this.owner = owner;
    this.startRow = null;
    this.endRow = null;
    this.startCol = null;
    this.endCol = null;
    this.currentPlayerIndex = 0;
  }

  hit() {
    console.log(`Hits before hit: ${this.hits}`);
    if (this.hits < this.length) {
        this.hits++;
    }
    console.log(`Hits after hit: ${this.hits}`);
    if (this.hits === this.length) {
        this.sunk = true;
        console.log(`Ship sunk!`);
    }
    return this.hits;
}

  isSunk() {
    return this.hits === this.length;
  }

  equals(otherShip) {
    // Compare the relevant properties of the ships
    return (
      this.length === otherShip.length &&
      this.owner === otherShip.owner &&
      this.startRow === otherShip.startRow &&
      this.startCol === otherShip.startCol &&
      this.endRow === otherShip.endRow &&
      this.endCol === otherShip.endCol
    );
  }

  
}

class Board {
  constructor(size) {
    this.size = size;
    this.grid = Array.from({ length: size }, () => Array(size).fill(0));
    this.ships = [];
    this.players = [userPlayer, computerPlayer];
    this.players[0].turn = true;
    this.currentPlayer = userPlayer;
    this.currentPlayerIndex = 0;
    this.shipSunkThisTurn = [false, false]; // Initialize to false for both players
  }

  // Method to reset the shipSunkThisTurn property for the next turn
  resetShipSunkThisTurn() {
    this.shipSunkThisTurn = [false, false];
  }

  // Method to mark a ship as sunk during the current turn for the specified player
  markShipAsSunkThisTurn(playerIndex) {
    this.shipSunkThisTurn[playerIndex] = true;
  }

  // Method to check if a ship has been sunk during the current turn for the specified player
  isShipSunkThisTurn(playerIndex) {
    return this.shipSunkThisTurn[playerIndex];
  }

  placeShip(ship, row, col, orientation) {
    const shipVertices = this.getShipVertices(ship, row, col, orientation);

    if (this.isShipPlacementValid(shipVertices)) {
      // Set ship boundaries
      ship.startRow = row;
      ship.startCol = col;
      if (orientation === 'horizontal') {
        ship.endRow = row;
        ship.endCol = col + ship.length - 1;
      } else {
        ship.endRow = row + ship.length - 1;
        ship.endCol = col;
      }

      for (const vertex of shipVertices) {
        const [row, col] = this.getCoordinates(vertex);
        this.grid[row][col] = 1;
      }
      this.ships.push(ship);
      return true;
    }

    return false;
  }

  getShipAt(row, col) {
    // Iterate through all ships on the board
    for (const ship of this.ships) {
      // Check if the current cell (row, col) is within the ship's boundaries
      if (row >= ship.startRow && row <= ship.endRow && col >= ship.startCol && col <= ship.endCol) {
        return ship; // Return the ship if found
      }
    }
    return null; // Return null if no ship is found at the given coordinates
  }

  getShipVertices(ship, row, col, orientation) {
    const shipVertices = [];
  
    if (orientation === 'horizontal') {
      for (let i = 0; i < ship.length; i++) {
        const vertex = this.getVertex(row, col + i);
        shipVertices.push(vertex);
      }
    } else if (orientation === 'vertical') {
      for (let i = 0; i < ship.length; i++) {
        const vertex = this.getVertex(row + i, col);
        shipVertices.push(vertex);
      }
    } else {
      // If no orientation is provided, assume a default orientation
      for (let i = 0; i < ship.length; i++) {
        const vertex = this.getVertex(row, col + i);
        shipVertices.push(vertex);
      }
    }
  
    console.log(`Ship vertices for cell (${row}, ${col}):`, shipVertices);
    return shipVertices;
  }

  isShipPlacementValid(shipVertices) {
    for (const vertex of shipVertices) {
      const [row, col] = this.getCoordinates(vertex);
      if (row < 0 || row >= this.size || col < 0 || col >= this.size || this.grid[row][col] !== 0) {
        return false;
      }
    }
    return true;
  }

  receiveAttack(row, col) {
    console.log(`Received attack at ${row}, ${col}`);

    // Check if the cell contains a ship
    const cellValue = this.grid[row][col];
    console.log(`Cell value: ${cellValue}`);

    if (cellValue === 1) {
        // If the cell contains a ship, mark it as hit
        this.grid[row][col] = 'X';

        // Find the ship based on the attacked cell
        const ship = this.getShipAt(row, col);

        if (ship && !ship.isSunk()) { // Check if the ship exists and is not already sunk
            // If the ship is found and not sunk, mark it as hit
            ship.hit();

            // Check if the ship is sunk after the hit
            if (ship.isSunk()) {
                console.log(`Ship is sunk!`);
            } else {
                console.log(`Ship is not sunk. Hits: ${ship.hits}, Length: ${ship.length}`);
            }

            // Process the next player's attack
            if (ship.currentPlayerIndex === 0) {
                userPlayer.playerAttack(this, row, col, 'User');
            } else {
                // Call computerAttack directly for the computer player
                computerPlayer.playerAttack(this, row, col, 'Computer');
            }

            return true; // Attack was successful
        } else {
            console.log('Ship not found or already sunk for the attacked cell.');
        }
    } else if (cellValue !== 'O' && cellValue !== 'X') {
        // If the cell doesn't contain a ship and hasn't been attacked before, mark it as missed
        this.grid[row][col] = 'O';
    }

    return false; // Attack missed
}

switchTurn() {
  console.log(`Before switchTurn - currentPlayerIndex: ${this.currentPlayerIndex}`);
  this.currentPlayerIndex = 1 - this.currentPlayerIndex;
  console.log(`After switchTurn - currentPlayerIndex: ${this.currentPlayerIndex}`);

  this.players.forEach((player, index) => {
    player.turn = index === this.currentPlayerIndex;
    console.log(`${player.name}'s turn: ${player.turn}`);
  });

  this.currentPlayer = this.players[this.currentPlayerIndex];
}

  isPlayerTurn() {
    return this.currentPlayerIndex === 0;
  }

  getCoordinates(vertex) {
    return [Math.floor(vertex / this.size), vertex % this.size];
  }

  getVertex(row, col) {
    return row * this.size + col;
  }


  printGrid() {
    let result = '';
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        result += `${this.grid[row][col]} `;
      }
      result += '\n';
    }
    return result;
  }

  printBoard() {
    let result = '';
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        result += `${this.grid[row][col]} `;
      }
      result += '\n';
    }
    console.log(result);
  }

  // Add a reset method to the Board class
reset() {
  this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(0));
  this.ships = [];
  this.currentPlayer = null;
  this.currentPlayerIndex = 0;
}



}

class Player {
  constructor(name) {
    this.name = name;
    this.turn = false; // Initialize turn as false
    this.ships = [];
  }

  playerAttack(enemyBoard, targetRow, targetCol) {
    console.log(`${this.name}'s attack: ${targetRow}, ${targetCol}`);
    const result = enemyBoard.receiveAttack(targetRow, targetCol);

    if (result) {
      console.log('Successful attack!');
    } else {
      console.log('Attack missed.');
    }

    return result;
  }

  
}

class ComputerPlayer extends Player {
  constructor(name) {
    super(name);
  }

  computerAttack(enemyBoard) {
    let attackResult;

    // Generate random coordinates for the attack
    const row = Math.floor(Math.random() * enemyBoard.size);
    const col = Math.floor(Math.random() * enemyBoard.size);

    // Perform the attack on the enemy board
    const attackSuccess = enemyBoard.receiveAttack(row, col);

    // Construct the attack result based on the success of the attack
    attackResult = {
        success: attackSuccess,
        row: row,
        col: col,
        ship: attackSuccess ? enemyBoard.getShipAt(row, col) : null
    };

    console.log("Computer attack result:", attackResult);

    // Adjust the logging based on the attack result
    if (attackSuccess) {
        console.log("Successful attack!");
    } else {
        console.log("Attack missed.");
    }

    return attackResult; // Return the attack result
}
}

function isGameOver(ships) {
  console.log('Checking if game is over...');
  let userShipsRemaining = 5; // Assuming each player starts with 5 ships
  let computerShipsRemaining = 5;
  const sunkShips = new Set(); // Set to keep track of sunk ships

  ships.forEach(ship => {
    if (ship.isSunk() && !sunkShips.has(ship)) { // Check if the ship is sunk and not already counted
      console.log(`Ship sunk. Owner: ${ship.owner}`);
      sunkShips.add(ship); // Add the ship to the set of sunk ships
      if (ship.owner === 'User') {
        userShipsRemaining--;
        console.log('User ship sunk. Remaining:', userShipsRemaining);
      } else if (ship.owner === 'Computer') {
        computerShipsRemaining--;
        console.log('Computer ship sunk. Remaining:', computerShipsRemaining);
      }
    }
  });

  console.log('User ships remaining:', userShipsRemaining);
  console.log('Computer ships remaining:', computerShipsRemaining);

  return userShipsRemaining <= 0 || computerShipsRemaining <= 0;
}

function placeShipsRandomly(board, owner) {
  const shipLengths = [5, 4, 3, 3, 2];

  shipLengths.forEach(length => {
    let placed = false;
    while (!placed) {
      const startRow = Math.floor(Math.random() * board.size);
      const startCol = Math.floor(Math.random() * board.size);
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';

      const ship = new Ship(length, owner); // Pass owner parameter
      if (board.placeShip(ship, startRow, startCol, orientation)) {
        placed = true;
      }
    }
  });
}

// Create user and computer players
const userPlayer = new Player('User');
const computerPlayer = new ComputerPlayer('Computer');

// Create game boards for each player
const userBoard = new Board(10);
const computerBoard = new Board(10);

// Place ships on the user and computer boards
const numShips = 5;
const shipLength = 2;

// Set the current player for each board
userBoard.currentPlayer = userPlayer;
computerBoard.currentPlayer = computerPlayer;

placeShipsRandomly(computerBoard, 'Computer');

// Assign ships to the players
userPlayer.ships = userBoard.ships;
computerPlayer.ships = computerBoard.ships;

// Example usage:
console.log('User Board:');
console.log(userBoard.printGrid());

console.log('\nComputer Board:');
console.log(computerBoard.printGrid());

module.exports = {Ship, Board, Player, ComputerPlayer, placeShipsRandomly, isGameOver}
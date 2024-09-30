var deck, playerHand, dealerHand;
var balance = 1000;
var currentWager = 0;
var balanceBeforeWager = 1000;

var suitsSymbols = {
    'Hearts': '♥',
    'Diamonds': '♦',
    'Clubs': '♣',
    'Spades': '♠'
};

var ranksSymbols = {
    '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
    'Jack': 'J', 'Queen': 'Q', 'King': 'K', 'Ace': 'A'
};

var values = {  
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'Jack': 10, 'Queen': 10, 'King': 10, 'Ace': 11
};

document.getElementById('hit-button').addEventListener('click', hit);
document.getElementById('stand-button').addEventListener('click', stand);
document.getElementById('place-wager-button').addEventListener('click', placeWager);

function createDeck() {
    deck = [];
    for (var suit in suitsSymbols) {
        for (var rank in ranksSymbols) {
            deck.push({rank, suit});
        }
    }
    shuffleDeck(deck);
}

function shuffleDeck(deck) {
    for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function getCardDisplay(card) {
    var rank = ranksSymbols[card.rank];
    var suit = suitsSymbols[card.suit];

    return `
 ____________
|${rank.padEnd(2, ' ')}         |
|${suit}          |
|           |
|      ${suit}    |
|           |
|          ${suit}|
|_________${rank.padStart(2, ' ')}|`
}

function startGame() {
    document.getElementById('new-game-button').style.display = 'none';
    createDeck();
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stand-button').disabled = true;
    clearHands();
    updateBalanceDisplay();
}

function clearHands() {
    document.getElementById('player-cards').innerHTML = '';
    document.getElementById('dealer-cards').innerHTML = '';
    document.getElementById('player-total').textContent = 'Total: 0';
    document.getElementById('dealer-total').textContent = 'Total: ?';
}

function dealCards() {
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];

    document.getElementById('hit-button').disabled = false;
    document.getElementById('stand-button').disabled = false;

    updateHands();
    checkForBlackjack();
}

function updateHands() {
    var playerCardsElement = document.getElementById('player-cards');
    var dealerCardsElement = document.getElementById('dealer-cards');

    playerCardsElement.innerHTML = '';
    dealerCardsElement.innerHTML = '';

    playerHand.forEach(card => {
        var cardDisplay = document.createElement('pre');
        cardDisplay.className = 'card';
        cardDisplay.textContent = getCardDisplay(card);
        playerCardsElement.appendChild(cardDisplay);
    });

    dealerHand.forEach((card, index) => {
        var cardDisplay = document.createElement('pre');
        cardDisplay.className = 'card';
        if (index === 0 && !document.getElementById('hit-button').disabled) {
            cardDisplay.textContent = `
 ____________
|Hidden      |
|            |
|            |
|            |
|            |
|            |
|____________|`;
        } else {
            cardDisplay.textContent = getCardDisplay(card);
        }
        dealerCardsElement.appendChild(cardDisplay);
    });

    document.getElementById('player-total').textContent = `Total: ${calculateHandValue(playerHand)}`;
    document.getElementById('dealer-total').textContent = document.getElementById('hit-button').disabled ?
        `Total: ${calculateHandValue(dealerHand)}` : 'Total: ?';

    updateBalanceDisplay();
}

function checkForBlackjack() {
    var playerValue = calculateHandValue(playerHand);
    var dealerValue = calculateHandValue(dealerHand);

    if (playerValue === 21) {
        endGame('Blackjack! You win 1.5x your wager.');
    } else if (dealerValue === 21) {
        endGame('Dealer has Blackjack. You lose.');
    }
}

function hit() {
    playerHand.push(deck.pop());
    updateHands();

    if (calculateHandValue(playerHand) > 21) {
        endGame('You bust! Dealer wins.');
    }
}

function stand() {
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stand-button').disabled = true;

    dealerTurn();
}

function dealerTurn() {
    while (calculateHandValue(dealerHand) < 17) {
        dealerHand.push(deck.pop());
        updateHands();
    }

    if (calculateHandValue(dealerHand) > 21) {
        endGame('Dealer busts! You win!');
    } else {
        compareHands();
    }
}

function compareHands() {
    var playerValue = calculateHandValue(playerHand);
    var dealerValue = calculateHandValue(dealerHand);

    if (playerValue > dealerValue) {
        endGame('You win!');
    } else if (playerValue < dealerValue) {
        endGame('Dealer wins.');
    } else {
        endGame("It's a tie!");
    }
}

function calculateHandValue(hand) {
    var value = 0;
    var numAces = 0;

    for (var card of hand) {
        value += values[card.rank];
        if (card.rank === 'Ace') {
            numAces += 1;
        }
    }

    while (value > 21 && numAces > 0) {
        value -= 10;
        numAces -= 1;
    }

    return value;
}

function endGame(message) {
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stand-button').disabled = true;
    document.getElementById('message').textContent = message;

    if (message.includes('You win')) {
        if (message.includes('Blackjack')) {
            balance = balanceBeforeWager + currentWager * 1.5;
        } else {
            balance = balanceBeforeWager + currentWager;
        }
    } else if (message.includes('tie')) {
        balance = balanceBeforeWager;
    }

    currentWager = 0;
    updateHands();

    document.getElementById('new-game-button').style.display = 'inline-block';
    document.getElementById('place-wager-button').disabled = false;
    document.getElementById('wager-input').disabled = false;
}

function placeWager() {
    var wagerInput = document.getElementById('wager-input');
    var wagerAmount = parseInt(wagerInput.value, 10);

    if (isNaN(wagerAmount) || wagerAmount <= 0) {
        alert('Please enter a valid wager amount.');
        return;
    }

    if (wagerAmount > balance) {
        alert('Not enough balance!');
        return;
    }

    currentWager = wagerAmount;
    balanceBeforeWager = balance;
    balance -= currentWager; 
    wagerInput.value = ''; 

    document.getElementById('message').textContent = `Wager placed: $${currentWager}`;

    document.getElementById('place-wager-button').disabled = true;
    document.getElementById('wager-input').disabled = true;

    dealCards(); 
    updateBalanceDisplay();
}

document.getElementById('new-game-button').addEventListener('click', function() {
    startGame(); 
    document.getElementById('message').textContent = ''; 
});

function updateBalanceDisplay() {
    document.getElementById('balance').textContent = balance;
}

window.onload = function() {
    updateBalanceDisplay();
    startGame(); 
};
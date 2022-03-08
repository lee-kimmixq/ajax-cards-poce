let currentGame = null;

// ============================ DOM HELPERS =====================================

const createContainer = (conId, conColour, parent) => {
  const newDiv = document.createElement('div');
  newDiv.id = conId;
  newDiv.style.backgroundColor = conColour;
  parent.appendChild(newDiv);
  return newDiv;
};

const createButton = (btnId, btnText, btnCallback, parent) => {
  const newBtn = document.createElement('button');
  newBtn.id = btnId;
  newBtn.innerText = btnText;
  newBtn.addEventListener('click', btnCallback);
  parent.appendChild(newBtn);
  return newBtn;
};

const createCard = (card, parent) => {
  const newDiv = document.createElement('div');
  const { name, suit } = card;
  newDiv.innerText = `${name}${suit}`;
  parent.appendChild(newDiv);
  return newDiv;
};

// ============================ BUTTON CALLBACKS =====================================

const renderPlayerHand = (num, username, container, hand) => {
  container.innerText = `Player ${num} (${username}):`;
  createCard(hand[0], container);
  createCard(hand[1], container);
};

const refreshGame = () => {
  axios.get(`/games/${currentGame.id}`)
    .then((res) => {
      const { player1Hand, player2Hand, winner } = res.data;
      const cardsDiv = document.querySelector('#cards-container');
      cardsDiv.innerHTML = ''; // clear cards div
      // create div for each player and show cards
      const player1Div = createContainer('p1-container', 'rgb(250, 218, 221)', cardsDiv);
      const player2Div = createContainer('p2-container', 'rgb(173, 216, 230)', cardsDiv);
      renderPlayerHand(1, currentGame.user, player1Div, player1Hand);
      renderPlayerHand(2, currentGame.user, player2Div, player2Hand);
      cardsDiv.innerHTML += `<p>Winner: ${winner}`; // show winner
    })
    .catch((err) => { console.log(err); });
};

const dealCards = () => {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((res) => {
      const { player1Hand, player2Hand, winner } = res.data;
      const cardsDiv = document.querySelector('#cards-container');
      cardsDiv.innerHTML = ''; // clear cards div
      // create div for each player and show cards
      const player1Div = createContainer('p1-container', 'rgb(250, 218, 221)', cardsDiv);
      const player2Div = createContainer('p2-container', 'rgb(173, 216, 230)', cardsDiv);
      renderPlayerHand(1, currentGame.user, player1Div, player1Hand);
      renderPlayerHand(2, currentGame.user, player2Div, player2Hand);
      cardsDiv.innerHTML += `<p>Winner: ${winner}`; // show winner
    })
    .catch((err) => { console.log(err); });
};

// ====================================================================================

const startGame = () => {
  axios.post('/games')
    .then((res) => {
      currentGame = res.data; // store id and opponent in currentGame
      const gameDiv = document.querySelector('#game-container');
      gameDiv.innerHTML = ''; // clear container
      createButton('deal', 'Deal', dealCards, gameDiv); // deal button
      createButton('refresh', 'Refresh', refreshGame, gameDiv); // refresh button
      createContainer('cards-container', 'rgb(211, 211, 211)', gameDiv); // div to contain cards
    })
    .catch((err) => { console.log(err); });
};

const main = () => {
  createButton('start', 'Start Game', startGame, document.body); // start game button
  createContainer('game-container', 'rgb(255, 255, 224)', document.body);
};

main();

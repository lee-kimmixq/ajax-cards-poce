let currentGame = null;

const createContainer = (conId, conColour, parent) => {
  const newDiv = document.createElement('div');
  newDiv.id = conId;
  newDiv.style.backgroundColor = conColour;
  if (!parent) { parent = document.body; }
  parent.appendChild(newDiv);
  return newDiv;
};

const createButton = (btnId, btnText, btnCallback, parent) => {
  const newBtn = document.createElement('button');
  newBtn.id = btnId;
  newBtn.innerText = btnText;
  newBtn.addEventListener('click', btnCallback);
  if (!parent) { parent = document.body; }
  parent.appendChild(newBtn);
  return newBtn;
};

const createCard = (card, parent) => {
  const newDiv = document.createElement('div');
  const { name, suit } = card;
  newDiv.innerText = `${name}${suit}`;
  if (!parent) { parent = document.body; }
  parent.appendChild(newDiv);
  return newDiv;
};

const refreshGame = () => {
  axios.get(`/games/${currentGame.id}`)
    .then((res) => {
      const cardsDiv = document.querySelector('#cards-container');
      cardsDiv.innerHTML = '';
      createCard(res.data.playerHand[0], cardsDiv);
      createCard(res.data.playerHand[1], cardsDiv);
    })
    .catch((err) => { console.log(err); });
};

const dealCards = () => {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((res) => {
      const cardsDiv = document.querySelector('#cards-container');
      cardsDiv.innerHTML = '';
      createCard(res.data.playerHand[0], cardsDiv);
      createCard(res.data.playerHand[1], cardsDiv);
    })
    .catch((err) => { console.log(err); });
};

const startGame = () => {
  axios.post('/games')
    .then((res) => {
      currentGame = res.data;
      const gameDiv = document.querySelector('#game-container');
      gameDiv.innerHTML = '';
      const dealBtn = createButton('deal', 'Deal', dealCards, gameDiv);
      const refreshBtn = createButton('refresh', 'Refresh', refreshGame, gameDiv);
      const cardsDiv = createContainer('cards-container', 'rgb(211, 211, 211)', gameDiv);
    })
    .catch((err) => { console.log(err); });
};

createButton('start', 'Start Game', startGame);
createContainer('game-container', 'rgb(255, 255, 224)');

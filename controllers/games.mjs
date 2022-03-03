const getRandomIndex = (size) => Math.floor(Math.random() * size);

const shuffleCards = (cards) => {
  for (let i = 0; i < cards.length; i += 1) {
    const randomIndex = getRandomIndex(cards.length);
    const currentItem = cards[i];
    const randomItem = cards[randomIndex];
    cards[i] = randomItem;
    cards[randomIndex] = currentItem;
  }
  return cards;
};

const makeDeck = () => {
  const deck = [];

  const suits = ['♥️', '♦️', '♣️', '♠️'];
  for (let i = 0; i < suits.length; i += 1) {
    const currentSuit = suits[i];
    for (let j = 0; j <= 13; j += 1) {
      let cardName = j;

      if (cardName === 1) {
        cardName = 'A';
      } else if (cardName === 11) {
        cardName = 'J';
      } else if (cardName === 12) {
        cardName = 'Q';
      } else if (cardName === 13) {
        cardName = 'K';
      }

      const card = {
        name: cardName,
        suit: currentSuit,
        rank: j,
      };
      deck.push(card);
    }
  }

  return deck;
};

export default function initGamesController(db) {
  const create = async (req, res) => {
    const cardDeck = shuffleCards(makeDeck());

    const newGame = {
      gameState: {
        cardDeck,
        playerHand: [],
      },
    };

    try {
      const user = await db.User.findByPk(req.cookies.userId);
      // TODO error
      const game = await user.createGame(newGame); // create row in games and games_users table
      // TODO error
      res.send({
        id: game.id,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  };

  const get = async (req, res) => {
    try {
      const game = await db.Game.findByPk(req.params.id);
      // TODO error

      res.send({
        playerHand: game.gameState.playerHand,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  };

  const deal = async (req, res) => {
    const { id } = req.params;

    try {
      const game = await db.Game.findByPk(id);
      // TODO error

      const playerHand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];
      await game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          playerHand,
        },
      });

      res.send({
        playerHand: game.gameState.playerHand,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  };

  return { create, get, deal };
}

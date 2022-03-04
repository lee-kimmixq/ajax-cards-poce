import Sequelize from 'sequelize';

const { Op } = Sequelize;

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
    for (let j = 1; j <= 13; j += 1) {
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

const getWinner = (p1Hand, p2Hand) => {
  const p1Score = p1Hand[0].rank + p1Hand[1].rank;
  const p2Score = p2Hand[0].rank + p2Hand[1].rank;
  if (p1Score > p2Score) return 1;
  if (p1Score < p2Score) return 2;
  return 0;
};

export default function initGamesController(db) {
  const create = async (req, res) => {
    const cardDeck = shuffleCards(makeDeck());

    const newGame = {
      gameState: {
        cardDeck,
        player1Hand: [],
        player2Hand: [],
      },
    };

    try {
      const user = await db.User.findByPk(req.cookies.userId); // find current user
      // TODO error
      const game = await user.createGame(newGame); // create row in games and games_users table
      // TODO error
      const opponent = await db.User.findOne({ // find a random user that is NOT current user
        where: { id: { [Op.not]: req.cookies.userId } },
        order: Sequelize.literal('random()'),
      });
      // TODO error
      await game.addUser(opponent); // create row for opponent in games_users table

      res.send({
        id: game.id,
        opponent: opponent.email,
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
        player1Hand: game.gameState.player1Hand,
        player2Hand: game.gameState.player2Hand,
        winner: game.gameState.winner,
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

      // make sure that deck has at least 4 cards, if not make new deck
      if (game.gameState.cardDeck.length < 4) {
        game.gameState.cardDeck = shuffleCards(makeDeck());
      }

      const player1Hand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];
      const player2Hand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];
      const winner = getWinner(player1Hand, player2Hand);

      await game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          player1Hand,
          player2Hand,
          winner,
        },
      });

      res.send({
        player1Hand,
        player2Hand,
        winner,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  };

  return { create, get, deal };
}

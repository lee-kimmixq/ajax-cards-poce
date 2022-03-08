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

      let cardRank = j;

      if (cardRank > 10) {
        cardRank = 10;
      }

      const card = {
        name: cardName,
        suit: currentSuit,
        rank: cardRank,
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
      if (!user) throw new Error('cannot find user');

      const game = await db.Game.create(newGame); // create row in games table
      if (!game) throw new Error('cannot create new game');

      const opponent = await db.User.findOne({ // find a random user that is NOT current user
        where: { id: { [Op.not]: req.cookies.userId } },
        order: Sequelize.literal('random()'),
      });
      if (!opponent) throw new Error('cannot find opponent');

      // !!! PLAYER NUMBER AND SCORE NOT LOGGED IN DB !!!
      // create row in games_users table
      await game.addUser(user, { through: { playerNumber: 1, score: 0 } });
      // create row for opponent in games_users table
      await game.addUser(opponent, { through: { playerNumber: 1, score: 0 } });

      res.send({
        id: game.id,
        user: user.email,
        opponent: opponent.email,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  };

  const get = async (req, res) => {
    const { id } = req.params;

    try {
      const game = await db.Game.findByPk(id);
      if (!game) throw new Error('cannot find game');

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
      if (!game) throw new Error('cannot find game');

      // make sure that deck has at least 4 cards, if not make new deck
      if (game.gameState.cardDeck.length < 4) {
        game.gameState.cardDeck = shuffleCards(makeDeck());
      }

      // deal 2 cards to each player
      const player1Hand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];
      const player2Hand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];

      // calculate card ranks to get winner
      const winner = getWinner(player1Hand, player2Hand);

      // update db
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

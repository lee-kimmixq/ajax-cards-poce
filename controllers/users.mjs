import jsSHA from 'jssha';

const getHash = (input) => {
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(input);
  return shaObj.getHash('HEX');
};

export default function initUsersController(db) {
  const logIn = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await db.User.findOne({ where: { email } });

      if (!user || user.password !== getHash(password)) {
        res.status(403).redirect('/login?login=fail');
        return;
      }

      res.cookie('loggedIn', getHash(user.id.toString())); // rmb to put toString() here!
      res.cookie('userId', user.id);
      res.redirect('/');
    } catch (err) {
      console.log(err);
    }
  };

  const signUp = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await db.User.findOne({ where: { email } });

      if (user) {
        res.status(403).redirect('/login?signup=fail');
        return;
      }

      const hashedPw = getHash(password);
      await db.User.create({ email, password: hashedPw });

      res.redirect('/login');
    } catch (err) {
      console.log(err);
    }
  };

  return { logIn, signUp };
}

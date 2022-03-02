import jsSHA from 'jssha';
import db from './models/index.mjs';

// import your controllers here
import initUsersController from './controllers/users.mjs';

const getHash = (input) => {
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(input);
  return shaObj.getHash('HEX');
};

// if logged in, set req.isLoggedIn to true and next()
// if NOT logged in, set req.isLoggedIn to false and render login page
const checkAuth = (req, res, next) => {
  req.isLoggedIn = false; // default value

  // get user's cookies and check if authentic. if yes, set req.isLoggedIn to true
  if (req.cookies.loggedIn && req.cookies.userId) {
    const { loggedIn, userId } = req.cookies;
    if (getHash(userId) === loggedIn) {
      req.isLoggedIn = true;
    }
  }

  // if not logged in, render login page
  if (req.isLoggedIn === false) {
    console.log('not lgoged in');
    res.render('login');
    return;
  }

  next();
};

export default function bindRoutes(app) {
  // initialize the controller functions here
  // pass in the db for all callbacks
  const userController = initUsersController(db);

  // define your route matchers here using app
  app.get('/', checkAuth, (req, res) => { res.render('home'); }); // if logged in, render homepage

  app.get('/login', checkAuth, (req, res) => { res.redirect('/'); }); // if logged in, redirect to homepage
  app.post('/login', userController.logIn);
  app.post('/signup', userController.signUp);
  app.delete('/logout', (req, res) => {
    res.clearCookie('userId');
    res.clearCookie('loggedIn');
    res.redirect('login');
  });
}

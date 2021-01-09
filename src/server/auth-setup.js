const { auth } = require("express-openid-connect");
const Auth0 = require("./auth0");
const { User } = require("./orm");
/**
 * Retrieves the currently signed-in user id, if signed-in,
 * from the Express Response object.
 *
 * This mechanism is independent if the app is using Auth0 or not.
 *
 * @param {*} response Express Response object
 */
const getCurrentUserId = (response) => response.locals.currentUserId;

const findCurrentUserFrom = (loadUserIdFunc) => {
  return (req, res, next) => {
    const userId = loadUserIdFunc(req);
    res.locals.currentUserId = userId;
    next();
  };
};

/**
 * Ensures user record exists for a signed-in user.
 * Needed for incoming Auth0 users.
 */
const autoCreateSignedInUser = async (_, res, next) => {
  const userId = getCurrentUserId(res);
  if (userId) {
    const [user, created] = await User.findOrCreate({
      where: { id: userId },
    });
    if (created) {
      console.debug(`auto-created newly signed-in user: ${user.id}`);
    }
  }
  next();
};

const routeRequiresSignedIn = (_, res, next) => {
  if (!getCurrentUserId(res)) {
    return res.sendStatus(401);
  }
  next();
};

const setupAuth = (app) => {
  if (Auth0.authConfig) {
    console.debug("Using Auth0 auth");
    // auth router attaches /login, /logout, and /callback routes to the baseURL
    app.use(auth(Auth0.authConfig));
    app.use(findCurrentUserFrom(Auth0.userIdLoader));
    app.use("/", autoCreateSignedInUser);
  } else {
    console.debug("Using dev auth");
    const AuthDev = require("./auth-dev");
    AuthDev.setup(app);
    app.use(findCurrentUserFrom(AuthDev.userIdLoader));
  }
};

module.exports = { setupAuth, routeRequiresSignedIn, getCurrentUserId };

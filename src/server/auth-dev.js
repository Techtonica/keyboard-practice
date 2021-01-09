/**
 * Simple cookie session auth for local development when not testing with Auth0.
 * Uses Sequelize to store the sessions using an adapter.
 *
 *  - `/login` will automatically sign you in as a current $USER
 *       (this user will be created if it does not exist)
 *  - `/logout` will sign you out
 */

const { User, sequelize } = require("./orm");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const userIdLoader = (req) => req.session.userId;

const setup = (app) => {
  app.use(
    session({
      secret: "techtonica",
      store: new SequelizeStore({
        db: sequelize,
        tableName: "sessions",
        expiration: 1000 * 60 * 30, //30min
      }),
      unset: "destroy",
      resave: false,
      saveUninitialized: true,
    })
  );

  app.get("/login", async (req, res) => {
    const userId = process.env.USER || "local";
    await User.findOrCreate({
      where: { id: userId },
    });
    req.session.userId = userId;
    res.redirect("/");
  });

  app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
  });
};

module.exports = { setup, userIdLoader };

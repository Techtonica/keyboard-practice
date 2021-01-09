const { AUTH0_SECRET, AUTH0_CLIENT_ID, AUTH0_ISSUER_BASE_URL } = process.env;
const { port } = require("./config");

let authConfig = false;

if (AUTH0_SECRET && AUTH0_CLIENT_ID) {
  authConfig = {
    authRequired: false,
    auth0Logout: true,
    issuerBaseURL: AUTH0_ISSUER_BASE_URL,
    baseURL: "http://localhost:".concat(port),
    clientID: AUTH0_CLIENT_ID,
    secret: AUTH0_SECRET,
  };
} 

const userIdLoader = (req) => req.oidc.user && req.oidc.user.sub;

module.exports = {
  authConfig,
  userIdLoader,
};

const { DB_URL, NODE_ENV } = process.env;

const port = process.env.port || 3000;

const isProduction = () => NODE_ENV === "production";
const isDevelopment = () => NODE_ENV === "development";

const getDefaultDbUrl = () => {
  if (!isProduction()) {
    return "sqlite:dev-db.sqlite";
  }
};

module.exports = {
  isProduction,
  isDevelopment,
  port,
  DB_URL: DB_URL || getDefaultDbUrl(),
};

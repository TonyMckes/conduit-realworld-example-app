require("dotenv").config();
const env = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3001;
const { sequelize } = require("./models");
// The express app is defined on its own so tests can run it on any port
const app = require("./app");

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log(`Connection with ${env} database has been established.`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);

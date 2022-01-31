require("dotenv").config();
const PORT = process.env.PORT || 3001;
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");

const usersRoutes = require("./routes/users");
const userRoutes = require("./routes/user");
const articlesRoutes = require("./routes/articles");

const verifyToken = require("./middleware/authentication");

const app = express();
app.use(cors());
app.use(express.json());

(async () => {
  try {
    // await sequelize.sync({ alter: true });
    await sequelize.authenticate();
  } catch (error) {
    console.error(error);
  }
})();

app.get("/", (req, res) => res.json({ status: "API is running on /api" }));
app.use("/api/users", usersRoutes);
app.use("/api/user", verifyToken, userRoutes);
app.use("/api/articles", articlesRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);

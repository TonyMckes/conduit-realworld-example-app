const PORT = process.env.PORT || 3001;
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");

const usersRoutes = require("./routes/users");

const app = express();
app.use(cors());
app.use(express.json());

(async () => {
  // await sequelize.sync({ force: true });
  await sequelize.authenticate();
})();

app.get("/", (req, res) => res.json({ status: "API is running on /api" }));
app.use("/api/users", usersRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);

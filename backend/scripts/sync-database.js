const { sequelize } = require("../models");

async function main() {
  await sequelize.sync();
  const storage = sequelize.options.storage || "configured database";
  console.log(`Database schema is ready: ${storage}`);
}

main()
  .catch((error) => {
    console.error("Failed to initialize database schema:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });

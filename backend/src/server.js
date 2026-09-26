const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const userRoutes = require("./infrastructure/routes/UserRoutes");

dotenv.config();

const app = express();
const PORT = 3001;

app.use(express.json());

app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    mensaje: "Backend funcionando correctamente"
  });
});

connectDB();

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const plateRoute = require("./src/routes/plateRoute"); // remove .js if using CommonJS

const app = express();
app.use(express.json());

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET"],
  })
);

// Routes
app.use("/api", plateRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

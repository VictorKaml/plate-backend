const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const plateRoute = require("./src/routes/plateRoute"); // remove .js if using CommonJS
const billRoute = require("./src/routes/billRoutes");

const app = express();
app.use(express.json());

// CORS
app.use(
  cors({
   origin: ["https://xcvsapp.web.app", "http://localhost:3000"],
    methods: ["POST", "GET"],
  })
);

// Routes
// Use unique prefixes for each router
app.use("/api/plates", plateRoute);
app.use("/api/bills", billRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});




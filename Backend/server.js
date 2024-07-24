const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Set up routes
app.use("/", routes);

// Start the server
app.listen(4000, () => {
  console.log("Server started on port 4000");
});

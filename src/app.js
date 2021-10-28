// importing/ requiring packages
const express = require("express");

// creating express server
const app = express();

// set port to listen for requests
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`app listening at http://localhost:${PORT}`)
})

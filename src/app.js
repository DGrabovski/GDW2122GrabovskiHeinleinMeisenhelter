// importing/ requiring packages
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const Group = require("../models/group");

// setting up global variables
const apiKeyAlwin = '?apiKey=397d585aa35c4b1b8b27beda022fd95f';
const apiUrl = 'https://api.spoonacular.com/'

// creating express server
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.json())

// set port to listen for requests
const PORT = process.env.PORT || 8080;

// connection to database
const databaseUri = 'mongodb+srv://admin:nimda@gdw2122.7vzu6.mongodb.net/gdw2122?retryWrites=true&w=majority'
mongoose.connect(databaseUri)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`app listening at http://localhost:${PORT}`)
    })
  })
  .catch(err => console.log(err));

// request that creates a group
app.post('/group', authenticateUser, async (req, res) => {
  const userID = req.body.userID;
  const groupName = req.body.groupName;

  if (!userID || !groupName) {
    res.status(400).json({mesage: 'incorect syntax, please try again'});
  } else {
    new Group( {groupName: groupName, admin: userID}).save().then(() => {
      res.status(201).json({message: 'group was created'});
    })
  }
})

app.post('/produkt', async (req, res) => {
  const url = `${apiUrl}food/products/upc/${req.body.upc}${apiKeyAlwin}`;
  const fetch_response = await fetch(url);
  const json = await fetch_response.json();
  res.json(json);
})


// function that is used to verify is the user is logged in/ has verification
function authenticateUser(req, res, next) {
  // TODO: implement code that verifies the logged in user else throw 401 error
}

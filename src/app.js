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

/**
 * POST request that creates a group
 * @Param string userID: parameter in the body, the id of the user that creates the group
 * @Param string groupName: parameter in the body, name of the group
 */
app.post('/group', authenticateUser, async (req, res) => {
  const userID = req.body.userID;
  const groupName = req.body.groupName;

  if (!userID || !groupName) {
    res.status(400).json({mesage: 'incorect syntax, please try again'});
  } else {
    new Group({groupName: groupName, admin: userID}).save().then((group) => {
      res.status(201).json({message: group});
    })
  }
})

/**
 * GET function that returns a group by id
 * @Param string groupID: query parametert by which the group is searched
 */
app.get('/group/:groupID', authenticateUser, async (req, res) => {
  await Group.findById(req.params.groupID)
    .then((group) => res.status(200).json({message: group}))
    .catch(() => res.status(404).json({message: 'the group was not found'}));
})

/**
 * DELETE function that deletes a group by id and admin-userID
 * @Param string groupID: body parametert by which the group is searched
 * @Param string userID: body parametert by which the admin is verified
 * @Param string groupName: body parametert by which the group is verified
 */
app.delete('/group/:groupID', authenticateUser, async (req, res) => {
  Group.findOne({
    _id: req.params.groupID,
    groupName: req.body.groupName,
    admin: req.body.userID
  }).then((group) => {
    if (group) {
      Group.deleteOne({
        _id: req.params.groupID,
        groupName: req.body.groupName,
        admin: req.body.userID
      }).then(() => {
        res.status(200).json({message: 'group was deleted'})
      });
    } else {
      res.status(404).json({message: 'the group was not found'});
    }
  })
})

// Example call to the external API -> POC
app.post('/produkt', async (req, res) => {
  const url = `${apiUrl}food/products/upc/${req.body.upc}${apiKeyAlwin}`;
  const fetch_response = await fetch(url);
  const json = await fetch_response.json();
  res.json(json);
})


// middleware function that is used to verify is the user is logged in/ has verification
function authenticateUser(req, res, next) {
  next();
  // TODO: implement code that verifies the logged in user else throw 401 error
}

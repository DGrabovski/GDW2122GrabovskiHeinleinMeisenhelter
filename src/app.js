// importing/ requiring packages
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const Group = require("../models/group");
const User = require("../models/user");

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

// group calls

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
    new Group({groupName: groupName, admin: userID, members: [req.body.userID]}).save().then((group) => {
      res.status(201).json({message: group});
    })
  }
})

/**
 * GET function that returns a group by id
 * @Param string groupID: query parametert by which the group is searched
 */
app.get('/group/:groupID', authenticateUser, async (req, res) => {
  Group.findById(req.params.groupID)
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

/**
 * DELETE function that removes an user from a group
 * @Param string groupID: groupID to find the group
 * @Param string userID: userID to verify that the user is permitted to delete other users from group
 * @Param string deleteUserID: userID of the user that should be removed
 */
app.delete('/group/:groupID/:userID', authenticateUser, async (req, res) => {
  Group.findOne({_id: req.params.groupID, admin: req.params.userID}).then((group) => {
    if (group) {
      group.members.splice(group.members.indexOf(req.body.deleteUserID), 1);
      group.save();
      res.status(200).json({message: 'user was removed'})
    } else {
      res.status(404).json({message: 'the group was not found'});
    }
  })
})

// TODO: function to leave a group

// user calls

/**
 * POST request that creates a user
 * @userID: _id The userID is autogenerated by Mongodb
 * @Param string userName: parameter in the body, name of the user
 * @Param string userSurname: parameter in the body, Surname of the user
 * @Param string userEmail: parameter in the body, Email of the user
 * @Param string userPassword: parameter in the body, Email of the user
 */
app.post('/user', async (req, res) => {
  //const userID = _id autogenerated Object _Id by Mongodb 
  const userName = req.body.userName;
  const userSurname = req.body.userSurname;
  const userEmail = req.body.userEmail;
  const userPassword = req.body.userPassword;

  if (!userName || !userSurname || !userEmail || !userPassword) {
    res.status(400).json({message: 'incorrect syntax, please try again'});
  } else {
    new User({
      userName: userName,
      userSurname: userSurname,
      userEmail: userEmail,
      userPassword: userPassword
    }).save().then(() => {
      res.status(201).json({message: 'user was created'});
    })
  }
})

/**
 * PATCH function that patch a user by id
 * @Param string userID: query parameter by which the user is identified
 * @Param string name: parameter in the body, new Name of the User
 * @Param string surname: parameter in the body, new Surname of the User
 * @Param string Email: parameter in the body, new Email of the User
 * @Param string Password: parameter in the body, new passwort of the User
 *
 */
app.patch('/user/:userID', authenticateUser, async (req, res) => {
  const _id = req.params.userID;
  const userName = req.body.userName;
  const userSurname = req.body.userSurname;
  const userEmail = req.body.userEmail;
  const userPassword = req.body.userPassword;

  if (!userName || !userSurname || !userEmail || !userPassword) {
    res.status(400).json({message: 'incorrect syntax, please try again'});
  } else {
    User.findOne({
      _id: _id
    }).then((user) => {
      if (user) {
        user.updateOne({
          _id: _id,
          userName: userName,
          userSurname: userSurname,
          userEmail: userEmail,
          userPassword: userPassword
        }).then(() => {
          res.status(200).json({message: 'user is updated'})
        });
      } else {
        res.status(404).json({message: 'user not found'});
      }
    })
  }
})

/**
 * GET function that returns a user by id
 * @Param string userID: query parametert by which the user is searched
 */
app.get('/user/:userID', authenticateUser, async (req, res) => {
  User.findById(req.params.userID)
    .then((user) => res.status(200).json({message: user}))
    .catch(() => res.status(404).json({message: 'the user was not found'}));
});

/**
 * DELETE function that deletes a user by id
 * @Param string userID: query parameter by which the user is searched
 * @Param string password: parameter in the body, passwort of the User
 */
app.delete('/user/:userID', authenticateUser, async (req, res) => {
  User.findOne({
    _id: req.params.userID,
    userPassword: req.body.userPassword
  }).then((user) => {
    if (user) {
      User.deleteOne({
        _id: req.params.userID,
        userPassword: req.body.userPassword
      }).then(() => {
        res.status(200).json({message: 'user deleted'})
      });
    } else {
      res.status(404).json({message: 'user not found'});
    }
  })
})

/**
 * DELETE function that deletes the user from a group
 * @Param string groupID: id of the group
 * @Param string userID: id of the user
 */
app.delete('/user/:groupID/:userID', authenticateUser, async (req, res) => {
  Group.findOne({
    _id: req.params.groupID
  }).then((group) => {
    if (group) {
      group.members.splice(group.members.indexOf(req.params.userID), 1);
      group.save();
      res.status(200).json({message: 'User deleted from group'})

    } else {
      res.status(404).json({message: 'the group was not found'});
    }
  })
})

// list calls

// external api calls

// Example call to the external API -> POC
app.post('/produkt', async (req, res) => {
  const url = `${apiUrl}food/products/upc/${req.body.upc}${apiKeyAlwin}`;
  const fetch_response = await fetch(url);
  const json = await fetch_response.json();
  res.json(json);
})

// middleware and login/out calls

// middleware function that is used to verify is the user is logged in/ has verification
function authenticateUser(req, res, next) {
  next();
  // TODO: implement code that verifies the logged in user else throw 401 error
}

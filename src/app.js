// importing/ requiring packages
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const Group = require("../models/group");
const User = require("../models/user");
const Allergie = require("../models/allergies");
const Preference = require("../models/preferences");
const Dislike = require("../models/dislikes");

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
app.delete('/group/:groupID/:deleteUserID', authenticateUser, async (req, res) => {
  Group.findOne({_id: req.params.groupID, admin: req.body.userID}).then((group) => {
    if (group) {
      group.members.splice(group.members.indexOf(req.params.deleteUserID), 1);
      group.save();
      res.status(200).json({message: 'user was removed'})
    } else {
      res.status(404).json({message: 'the group was not found'});
    }
  })
})

/**
 * POST function that adds a member to a group
 * @Param string groupID: id by which the group is identified
 * @Param string userID: id by which the permission of the user to add another user is checked
 * @Param string addUserID: id of the user that should be added
 */
app.post('/group/:groupID/:addUserID', authenticateUser, async (req, res) => {
  Group.findOne({_id: req.params.groupID, admin: req.body.userID}).then((group) => {
    if (group) {
      group.members.push(req.params.addUserID);
      group.save();
      res.status(200).json({message: 'user was added to group'})
    } else {
      res.status(404).json({message: 'the group was not found'});
    }
  })
})

// user calls

/**
 * POST request that creates a user
 * @Param string userID: parameter in the body, the id of the user
 * @Param string userName: parameter in the body, name of the user
 * @Param string userSurname: parameter in the body, Surname of the user
 * @Param string userEmail: parameter in the body, Email of the user
 * @Param string userPassword: parameter in the body, Email of the user
 */
app.post('/user', async (req, res) => {
  const userID = req.body.userID; // need to be generated by System?
  const userName = req.body.userName;
  const userSurname = req.body.userSurname;
  const userEmail = req.body.userEmail;
  const userPassword = req.body.userPassword; // convert to Hashvalues?

  if (!userID || !userName || !userSurname || !userEmail || !userPassword) {
    res.status(400).json({mesage: 'incorect syntax, please try again'});
  } else {
    new User( {userID: userID, userName: userName, userSurname: userSurname, userEmail: userEmail, userPassword: userPassword}).save().then(() => {
      res.status(201).json({message: 'user was created'});
    })
  }
})

/**
 * GET function that returns a user by id
 * @Param string userID: query parametert by which the user is searched
 */
app.get('/user', authenticateUser, async (req, res) => {
  await User.findById(req.query.userID).then((user) => {
    res.status(200).json({message: user});
  });
})

// list calls

/**
 * Post function that adds all allergies
 * @Param String userID: query parameter of user posting allergies
 * @Param string allergie: allergie parameter
 */
app.post('/user/:userID/allergies', authenticateUser, async (req,res)=>{
  try {
      if(!req.params.userID || !req.body.allergies) throw Error('Incorect syntax, please try again');
      await new Allergie({userID: req.params.userID, allergies: req.body.allergies}).save().then((allergies) => {
        res.status(201).json({message: allergies});
      });
  } catch (error) {
      res.status(400).json({msg:error});
  }
});

/**
 * PATCH function that updates allergies
 * @Param String userID: query parameter of user updating allergies
 */
app.patch('/user/:userID/allergies', authenticateUser, async (req,res) => {
  Allergie.findOne({userID: req.params.userID}).then((allergie) => {
    if(allergie) {
        allergie.allergies = req.body.allergies;
        allergie.save().then(() => {
          res.status(200).json({message: 'allergies were updated'})
        })
    } else {
        res.status(404).json({message: 'no allergies were found'});
    }
})
});

/**
 * Delete function that deletes all allergies
 * @Param String userID: query parameter of user deleting allergies
 */
 app.delete('/user/:userID/allergies', authenticateUser, async (req,res) =>{
  Allergie.findOne({userID: req.params.userID}).then((allergie) => {
      if(allergie) {
          Allergie.deleteOne({userID: req.params.userID}).then(() => {
            res.status(200).json({message: 'allergies were removed'})            
          })
      } else {
          res.status(404).json({message: 'no allergies were found'});
      }
  })
});

/**
 * GET function that shows all allergies of one user
 * @Param String userID: query parameter of user geting his list of allergies
 * @Param string allergie: allergie parameter
 */
app.get('/user/:userID/allergies', authenticateUser, async (req,res) => {
  Allergie.findOne({userID: req.params.userID}).then((allergies) => {
    if(allergies) {
          res.status(200).json({message: allergies})            
    } else {
        res.status(404).json({message: 'no allergies were found'});
    }
})
});

/**
 * Post function that adds all preferences
 * @Param String userID: query parameter of user posting preferences
 * @Param string preferences: preference parameter
 */
 app.post('/user/:userID/preferences', authenticateUser, async (req,res)=>{
  try {
      if(!req.params.userID || !req.body.preferences) throw Error('Incorect syntax, please try again');
      await new Preference({userID: req.params.userID, preferences: req.body.preferences}).save().then((preferences) => {
        res.status(201).json({message: preferences});
      });
  } catch (error) {
      res.status(400).json({msg:error});
  }
});

/**
 * PATCH function that updates preferences
 * @Param String userID: query parameter of user updating preferences
 */
app.patch('/user/:userID/preferences', authenticateUser, async (req,res) => {
  Preference.findOne({userID: req.params.userID}).then((preference) => {
    if(preference) {
        preference.preferences = req.body.preferences;
        preference.save().then(() => {
          res.status(200).json({message: 'preferences were updated'})
        })
    } else {
        res.status(404).json({message: 'no preferences were found'});
    }
})
});

/**
 * Delete function that deletes all preferences
 * @Param String userID: query parameter of user deleting preferences
 */
 app.delete('/user/:userID/preferences', authenticateUser, async (req,res) =>{
  Preference.findOne({userID: req.params.userID}).then((preference) => {
      if(preference) {
          Preference.deleteOne({userID: req.params.userID}).then(() => {
            res.status(200).json({message: 'preferences were removed'})            
          })
      } else {
          res.status(404).json({message: 'no preferences were found'});
      }
  })
});

/**
 * GET function that shows all preferences of one user
 * @Param String userID: query parameter of user geting his list of preferences
 * @Param string preference: preference parameter
 */
app.get('/user/:userID/preferences', authenticateUser, async (req,res) => {
  Preference.findOne({userID: req.params.userID}).then((preferences) => {
    if(preferences) {
          res.status(200).json({message: preferences})            
    } else {
        res.status(404).json({message: 'no preferences were found'});
    }
})
});

/**
 * Post function that adds all dislikes
 * @Param String userID: query parameter of user posting dislikes
 * @Param string dislikes: preference parameter
 */
 app.post('/user/:userID/dislikes', authenticateUser, async (req,res)=>{
  try {
      if(!req.params.userID || !req.body.dislikes) throw Error('Incorect syntax, please try again');
      await new Dislike({userID: req.params.userID, dislikes: req.body.dislikes}).save().then((dislikes) => {
        res.status(201).json({message: dislikes});
      });
  } catch (error) {
      res.status(400).json({msg:error});
  }
});

/**
 * PATCH function that updates dislikes
 * @Param String userID: query parameter of user updating dislikes
 */
app.patch('/user/:userID/dislikes', authenticateUser, async (req,res) => {
  Dislike.findOne({userID: req.params.userID}).then((dislike) => {
    if(dislike) {
        dislike.dislikes = req.body.dislikes;
        dislike.save().then(() => {
          res.status(200).json({message: 'dislikes were updated'})
        })
    } else {
        res.status(404).json({message: 'no dislikes were found'});
    }
})
});

/**
 * Delete function that deletes all dislikes
 * @Param String userID: query parameter of user deleting dislikes
 */
 app.delete('/user/:userID/dislikes', authenticateUser, async (req,res) =>{
  Dislike.findOne({userID: req.params.userID}).then((dislike) => {
      if(dislike) {
          Dislike.deleteOne({userID: req.params.userID}).then(() => {
            res.status(200).json({message: 'dislikes were removed'})            
          })
      } else {
          res.status(404).json({message: 'no dislikes were found'});
      }
  })
});

/**
 * GET function that shows all dislikes of one user
 * @Param String userID: query parameter of user geting his list of dislikes
 * @Param string dislike: preference parameter
 */
app.get('/user/:userID/dislikes', authenticateUser, async (req,res) => {
  Dislike.findOne({userID: req.params.userID}).then((dislikes) => {
    if(dislikes) {
          res.status(200).json({message: dislikes})            
    } else {
        res.status(404).json({message: 'no dislikes were found'});
    }
})
});


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
// @Param string loginToken: the token that is used to verify the user
function authenticateUser(req, res, next) {
  next();
  // TODO: implement code that verifies the logged in user else throw 401 error
}

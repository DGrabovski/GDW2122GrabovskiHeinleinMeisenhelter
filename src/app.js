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
const Token = require("../models/token");
const cors = require("cors");

// setting up global variables
const apiKeyAlwin = '?apiKey=397d585aa35c4b1b8b27beda022fd95f';
const apiUrl = 'https://api.spoonacular.com/'

// creating express server
const app = express();

// use cors to allow all CORS requests
app.use(cors());

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
 * @Param string userName: parameter in the body, name of the user
 * @Param string userSurname: parameter in the body, Surname of the user
 * @Param string userEmail: parameter in the body, Email of the user
 * @Param string userPassword: parameter in the body, Email of the user
 */
app.post('/user', async (req, res) => {
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

// allergies

/**
 * Post function that adds all allergies
 * @Param String userID: query parameter of user posting allergies
 * @Param string allergie: allergie parameter
 */
app.post('/user/:userID/allergies', authenticateUser, async (req, res) => {
  const userID = req.params.userID;
  const allergies = req.body.allergies;

  if (!userID || !allergies) {
    res.status(400).json({mesage: 'incorect syntax, please try again'});
  } else {
    new Allergie({userID: userID, allergies: allergies}).save().then((allergies) => {
      res.status(201).json({message: allergies});
    });
  }
});

/**
 * PATCH function that updates allergies
 * @Param String userID: query parameter of user updating allergies
 */
app.patch('/user/:userID/allergies', authenticateUser, async (req, res) => {
  Allergie.findOne({userID: req.params.userID}).then((allergie) => {
    if (allergie) {
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
app.delete('/user/:userID/allergies', authenticateUser, async (req, res) => {
  Allergie.findOne({userID: req.params.userID}).then((allergie) => {
    if (allergie) {
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
app.get('/user/:userID/allergies', authenticateUser, async (req, res) => {
  Allergie.findOne({userID: req.params.userID}).then((allergies) => {
    if (allergies) {
      res.status(200).json({message: allergies})
    } else {
      res.status(404).json({message: 'no allergies were found'});
    }
  })
});

// preferences

/**
 * Post function that adds all preferences
 * @Param String userID: query parameter of user posting preferences
 * @Param string preferences: preference parameter
 */
app.post('/user/:userID/preferences', authenticateUser, async (req, res) => {
  const userID = req.params.userID;
  const preferences = req.body.preferences;

  if (!userID || !preferences) {
    res.status(400).json({mesage: 'incorect syntax, please try again'});
  } else {
    new Preference({userID: userID, preferences: preferences}).save().then((preference) => {
      res.status(201).json({message: preference});
    });
  }
});

/**
 * PATCH function that updates preferences
 * @Param String userID: query parameter of user updating preferences
 */
app.patch('/user/:userID/preferences', authenticateUser, async (req, res) => {
  Preference.findOne({userID: req.params.userID}).then((preference) => {
    if (preference) {
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
app.delete('/user/:userID/preferences', authenticateUser, async (req, res) => {
  Preference.findOne({userID: req.params.userID}).then((preference) => {
    if (preference) {
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
app.get('/user/:userID/preferences', authenticateUser, async (req, res) => {
  Preference.findOne({userID: req.params.userID}).then((preferences) => {
    if (preferences) {
      res.status(200).json({message: preferences})
    } else {
      res.status(404).json({message: 'no preferences were found'});
    }
  })
});

// dislikes

/**
 * Post function that adds all dislikes
 * @Param String userID: query parameter of user posting dislikes
 * @Param string dislikes: preference parameter
 */
app.post('/user/:userID/dislikes', authenticateUser, async (req, res) => {
  const userID = req.params.userID;
  const dislikes = req.body.dislikes;

  if (!userID || !dislikes) {
    res.status(400).json({mesage: 'incorect syntax, please try again'});
  } else {
    new Dislike({userID: userID, dislikes: dislikes}).save().then((dislike) => {
      res.status(201).json({message: dislike});
    });
  }
});

/**
 * PATCH function that updates dislikes
 * @Param String userID: query parameter of user updating dislikes
 */
app.patch('/user/:userID/dislikes', authenticateUser, async (req, res) => {
  Dislike.findOne({userID: req.params.userID}).then((dislike) => {
    if (dislike) {
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
app.delete('/user/:userID/dislikes', authenticateUser, async (req, res) => {
  Dislike.findOne({userID: req.params.userID}).then((dislike) => {
    if (dislike) {
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
app.get('/user/:userID/dislikes', authenticateUser, async (req, res) => {
  Dislike.findOne({userID: req.params.userID}).then((dislikes) => {
    if (dislikes) {
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

/**
 * POST function thats logs in the user
 * @Param string email: the email to get an user
 * @Param string password: to verify the user
 */
app.post('/login', async (req, res) => {
  User.findOne({userEmail: req.body.email, userPassword: req.body.password}).then((user) => {
    if (user) {
      const token = Math.random().toString(36).substr(2, 5);
      new Token({userID: user._id, token: token}).save().then(() => {
        res.status(200).json({loginToken: token, userID: user._id})
      })
    } else {
      res.status(404).json({message: 'email or password incorrect'})
    }
  })
})

/**
 * POST function that logs out the user
 * @Param string userID: id of the user that should be logged out
 * @Param string token: the token to identify the user
 */
app.post('/logout', authenticateUser, async (req, res) => {
  Token.deleteOne({userID: req.body.userID, token: req.body.token}).then(() => {
    res.status(200).json({message: 'you have been logged out'})
  })
})

// middleware function that is used to verify is the user is logged in/ has verification
// @Param string loginToken: the token that is used to verify the user
function authenticateUser(req, res, next) {
  Token.findOne({userID: req.body.userID, token: req.body.token}).then((token) => {
    if (token) {
      next();
    } else {
      res.status(403).json({message: 'you dont have permission for this action'})
    }
  })
}

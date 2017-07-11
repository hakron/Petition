const spicedPg = require('spiced-pg');
const bodyParser = require('body-parser');
var secrets = require('./secrets.json');
var dbUrl = process.env.DATABASE_URL ||`postgres:${secrets.dbUser}:${secrets.password}@localhost:5432/petition`;
var db = spicedPg(dbUrl);
// <======== check if the email exists when the user register ========>
function checkIfEmailExists(email) {
  const q = `SELECT email
  FROM users
  WHERE email = $1`
  ;
  return db.query(q,[email]).then(function(results){
    console.log(results.rows, "this is the exited email");
    var exists = false;
    var data =  results.rows;
    for (var i = 0; i < data.length; i++) {
      if (data[i].email === email) {
        exists = true;
      }
    }
    return exists;
  }).catch(function (err) {
    console.log(err);
  });
}
// <===== insert user in db users in /register ====>
function insertUser(firstname, lastname, email, hash){
  const q = `INSERT INTO users
  (firstname, lastname, email, hashpassword)
  VALUES ($1, $2, $3, $4) RETURNING id;`
  ;
  const params = [
    firstname,
    lastname,
    email,
    hash
  ];
  return db.query(q, params).then(function (results) {
    // console.log(results.rows[0], " hello");
    return results.rows[0];

  }).catch(function (err) {
    console.log("there was an error", err);
  });
}

// <======= insert userprofile in db user_profiles in /profile=========>
function insertProfile(user_id, age, city, webpage) {
  const q = `INSERT INTO user_profiles
  (user_id, age, city, webpage)
  VALUES ($1, $2, $3, $4)`
  ;
  const params = [
    user_id,
    age,
    city,
    webpage
  ];
  return db.query(q, params).then(function (results) {
    return results.rows[0];
  }).catch(function (e) {
    console.log(e);
  });
}

// <====== insert the signature in db signature in /petition ========>
function insertSignature(user_id, saveSignature) {
  const q = `INSERT INTO signature
  (user_id, signature)
  VALUES ($1, $2)`
  ;
  const params = [
    user_id,
    saveSignature
  ];
  return  db.query(q, params).then(function(results) {
    console.log(results.rows, "results.rows after the query");
    return results.rows;

  });
}

// <======== get all users who signed the petition ========>
function getUsers() {
  const q = `SELECT users.firstname, users.lastname, user_profiles.age, user_profiles.city, user_profiles.webpage
  FROM users
  JOIN user_profiles
  ON users.id = user_profiles.user_id `
  ;
  return db.query(q, []).then(function (results) {

    return results.rows;

  }).catch(function (err) {
    console.log(err);
  });
}

// <========= get all users who signed in each city ========>
function getCitizens(city){
  const q = `SELECT users.lastname, users.firstname, user_profiles.age, user_profiles.city, user_profiles.webpage
  FROM users
  JOIN user_profiles ON users.id = user_profiles.user_id
  WHERE user_profiles.city = $1;`
  ;
  const params = [
    city
  ];
  return db.query(q, params).then(function(results){
    return results.rows;
  }).catch(function(err){
    console.log(err);
  });
}

// <======= update profile in db users and user_profiles in /edit ==========>
function updateProfile(firstname, lastname, email, id) {
  const q = ` UPDATE users
  SET firstname = $1, lastname = $2, email = $3
  WHERE id = $4;`
  ;
  const params = [
    firstname,
    lastname,
    email,
    id
  ];

  return db.query(q, params).then(function (results) {
    return results.rows;
  });
}
function updateProfile2(age, city, web, id) {
  const q = `UPDATE user_profiles
  SET age = $1, city = $2, webpage= $3
  WHERE id = $4`
  ;
  const params = [
    age,
    city,
    web,
    id
  ];
  return db.query(q, params).then(function (results) {
    return results.rows;
  });
}

// <======== get the password to hash it in /register =======>
function getPassword(email) {
  const q = `SELECT hashpassword FROM users WHERE email = '${email}'`;
  return db.query(q, []).then(function(results){
    return results.rows[0].hashpassword;
  }).catch(function (e) {
    console.log("there was an error", e);
  });
}

// <======= fn to get the require user data to build req.session.user =========>
function getUser(email) {
  return new Promise(function (res, rej) {
    const q = `SELECT users.id, users.firstname, users.lastname, signature.signature
    FROM users
    JOIN signature
    ON users.id = signature.user_id WHERE users.email = $1`
    ;
    console.log(email, "this is email");
    db.query(q, [email]).then(function(results) {
      // console.log(results.rows[0], "this is the results right before we resolve the promise in getUser");
      res(results.rows[0]);
    }).catch(function(err){
      rej(err);
    });
  });
}

// <======= fn to delete the signature from signature =======>
// function deleteSignature(id) {
//   const q = `DELETE signature
//   FROM signature
//   WHERE user_id = $1
//   `
//   ;
//   return db.query(q, [id]).then(function (results) {
//     return results.rows;
//   }).catch(function (err) {
//     console.log(err);
//   });
// }
module.exports.insertSignature = insertSignature;
module.exports.insertUser = insertUser;
module.exports.getUser = getUser;
module.exports.getUsers = getUsers;
module.exports.getCitizens = getCitizens;
module.exports.getPassword = getPassword;
module.exports.insertProfile = insertProfile;
module.exports.updateProfile = updateProfile;
module.exports.updateProfile2 = updateProfile2;
module.exports.checkIfEmailExists = checkIfEmailExists;

// module.export.deleteSignature = deleteSignature;

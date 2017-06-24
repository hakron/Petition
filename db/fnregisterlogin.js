const bcrypt = require('bcryptjs');
// <======== hash password in register  =======>
function hashPassword(password) {
  return new Promise(function(res, rej){
    bcrypt.genSalt(function (err, salt) {
      if (err) {
        rej(err);
      }
      bcrypt.hash(password, salt, function(err, hash){
        if (err){
          rej(err);
        }
        // console.log(hash);
        res(hash);
      });
    });
  });
}

// <=========== and check the password in login ===========>
function checkPassword(password, hashpassword) {
  return new Promise(function (res, rej) {
    bcrypt.compare(password, hashpassword, function(err, doesMatch) {
      if (err) {
        rej(err);
      }
      res(doesMatch);
    });
  });
}
module.exports.hashPassword = hashPassword;
module.exports.checkPassword = checkPassword;

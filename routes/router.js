const dbdata = require('../db/dbspiced');
const auth = require('../db/fnregisterlogin');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const express = require('express'),
router = express.Router();
const csrfProtection = csrf({cookie:true});
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());

router.get('/', function(req, res){
  if(!req.session.user){
    console.log("GET / .. session.user not found");
    res.redirect('/register');
  }else {
    res.redirect('/login');
  }
});

// <============= register user =================>

router.route('/register')
.get(csrfProtection, function(req, res){
  if(req.session.user){
    res.redirect('/login');
  }else {
    res.render('register',{
      title:'Petition Againts socks with Sandals',
      csrfToken: req.csrfToken()
    });
  }
})
.post(csrfProtection, function(req, res){
  if (req.body.firstname === "" && req.body.lastname === "" && req.body.email ==="" && req.body.password === ""){
    res.render('register',{
      title:'Petition Againts socks with Sandals',
      error: "You need to fill your name, last name, email and password to continue"
    });

  } else {
    ///check if email exists
    dbdata.checkIfEmailExists(req.body.email).then(function(exists) {
      console.log("email from checkIfEmailExists is", exists);
      if (exists){
        res.render('register',{
          title:'Petition Againts socks with Sandals',
          error: "That email already exists! Choose another one"
        });
      } else {
        //hash the password
        auth.hashPassword(req.body.password).then(function(hash){
          //insert the user in the db
          dbdata.insertUser(req.body.firstname, req.body.lastname, req.body.email, hash).then(function(results) {
            req.session.user = {
              id : results.id,
              firstname : req.body.firstname,
              lastname : req.body.lastname,
              email : req.body.email
            };
            console.log(req.session.user.id, "req.session.id");
          }).then(function () {
            res.redirect('/profile');
          });
        }).catch(function (err) {
          console.log("there was an error in  POST /register", err);
          res.redirect('/register');
        });
      }
    }).catch(function (err) {
      console.log(err);
    });
  }
});

// <============= user profile =================>

router.route('/profile')
.get(csrfProtection,function (req, res) {
  if(!req.session.user){
    res.redirect('/register');
  }else {
    res.render('profile',{
      title:'Petition Againts socks with Sandals',
      csrfToken: req.csrfToken()

    });
  }
})
.post(csrfProtection,function (req, res) {
  dbdata.insertProfile(req.session.user.id, req.body.age, req.body.city, req.body.web).then(function (results) {
    res.redirect('/petition');
  }).catch(function (err) {
    console.log(err);
  });
});

// <============= login =================>

router.route('/login')
.get(csrfProtection, function(req, res) {
  res.render('login',{
    title:'Petition Againts socks with Sandals',
    csrfToken: req.csrfToken()
  });

})
.post(csrfProtection, function(req, res){
  dbdata.checkIfEmailExists(req.body.email).then(function(exists) {
    console.log("email from checkIfEmailExists is", exists);
    if (!exists){
      res.render('login',{
        title:'Petition Againts socks with Sandals',
        erroremail: `That email does not exists! You need to register`
      });
    } else {
      dbdata.getPassword(req.body.email).then(function(results){
        auth.checkPassword(req.body.password, results).then(function (doesMatch) {
          if (doesMatch == true){
            dbdata.getUser(req.body.email)
            .then(function(results){
              return new Promise(function (resolve, reject) {
                req.session.user={
                  id : results.id,
                  firstname : results.first_name,
                  lastname : results.last_name,
                  email : req.body.email
                };
                resolve(req.session.user);
              });
            }).then(function(user){
              res.redirect('/thanks');
            })

          } else {
            res.json({
              success:false
            });
          }
        });
      });
    }
  });
});
// <============= sign petition =================>

router.route('/petition')
.get(csrfProtection, function (req, res) {
  if(!req.session.user){
    res.redirect('/register');
  }else{
    res.render('petition',{
      title:'Petition Againts socks with Sandals',
      csrfToken: req.csrfToken()
    });
  }
})
.post(csrfProtection, function(req, res) {
  if (!req.body.saveSignature){
    res.render('petition',{
      title:'Petition Againts socks with Sandals',
      error: "You need to fill with sour signature to continue"
    });
    // console.log(req.body);
  } else {
    dbdata.insertSignature(req.session.user.id, req.body.saveSignature).then(function(results) {
      res.redirect('/thanks');
    }).catch(function (err) {
      console.log(err);
    });
  }

});
// router.route('delete-signature')
// .get(function (req, res) {
//   if(!req.session.user){
//     console.log("user session found");
//     return res.redirect('/register');
//
//   } else {
//     res.render('delete-signature',{
//       title:'Petition Againts socks with Sandals'
//       msg: 'Your signature has been deleted'
//     });
//   }
// })
// .post(function (req, res) {
//   if(!req.session.user){
//     res.redirect('/register')
//   }else{
//   dbdata.deleteSignature(req.session.user.id).then(function (results) {
//     return results.rows;
//     req.session.user.signature = null
//     res.redirect("/petition");
//   }).catch(function (err) {
//     console.log(err);
//   });
//   }
// });

// <============= thanks =================>

router.route('/thanks')
.get(function(req, res) {
  if(!req.session.user){
    console.log("GET /thanks .. session.user not found", req.session.user);

    res.redirect('/register');
  }else {
    dbdata.getUser(req.session.user.email).then(function(results) {
      console.log(results, "hola");
      res.render('thanks', {
        title:'Petition Againts socks with Sandals',
        results: results
      });
    }).catch(function(err) {
      console.log(err);
    });
  }
});

// <============= users who signed =================>

router.route('/signers')
.get(function (req, res) {

  if(!req.session.user){
    console.log("GET /signers .. session.user not found");

    res.redirect('/register');
  } else {
    dbdata.getUsers().then(function (rows) {
      console.log(rows);
      res.render('signers', {
        title:'Petition Againts socks with Sandals',
        rows: rows
      });
    }).catch(function (err) {
      console.log(err);
    });
  }
});

// <============= users who signed in each city =================>

router.route(`/signers/:city`)
.get(function(req, res){
  dbdata.getCitizens(req.params.city).then(function(rows){
    console.log(rows,"im here");
    res.render('signers', {
      city : req.params.city,
      rows : rows
    });
  });
});

// <============= edit profile =================>

router.route('/profile/edit')
.get(csrfProtection, function(req, res){
  if(!req.session.user){
    res.redirect('/register');
  } else {
    res.render('edit', {
      title: 'Petition Againts socks with Sandals',
      csrfToken: req.csrfToken()

    });
  }
})
.post(csrfProtection, function(req, res){
  if (req.body.firstname === "" && req.body.lastname === "" && req.body.email ==="" && req.body.password === ""){
    res.render('edit', {
      title:'Petition Againts socks with Sandals',
      error: "You need to fill name, last name and password to continue"
    });
  }else{
    dbdata.updateProfile(req.body.firstname, req.body.lastname, req.body.email, req.session.user.id).then(function(results){
      res.render('edit', {
        title:'Petition Againts socks with Sandals',
        update: 'Your profile had been updated'
      });
    }).catch(function (err) {
      console.log(err);
    });
    dbdata.updateProfile2(req.body.age, req.body.city, req.body.web, req.session.user.id).then(function (results) {
    }).catch(function (err) {
      console.log(err);
    });
  }
});
router.get('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/login');
});
module.exports = router;

const express = require('express');
const hb = require('express-handlebars');
const router = require('./routes/router')
const session = require('express-session');
// var Store = require('connect-redis')(session);
const cookieParser = require('cookie-parser');
var port = process.env.PORT || 8080;
const app = express();
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: " give me a donner"
}));
app.use("/static", express.static(__dirname+"/public"));
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
// app.use(function(req, res, next){
//   if(!req.session.user){
//     console.log("user session not found");
//    res.redirect('/register');
//     // next();
//   }
// })
app.use('/', router);
app.listen(port, function () {
  console.log("hi there", port);
});

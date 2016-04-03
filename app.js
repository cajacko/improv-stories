var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var config = require('./config');
var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : config.MySql.host,
  user     : config.MySql.user,
  password : config.MySql.password,
  database : config.MySql.database
});

connection.connect();


        // Configure the Facebook strategy for use by Passport.
        //
        // OAuth 2.0-based strategies require a `verify` function which receives the
        // credential (`accessToken`) for accessing the Facebook API on the user's
        // behalf, along with the user's profile.  The function must invoke `cb`
        // with a user object, which will be set at `req.user` in route handlers after
        // authentication.
        passport.use(new Strategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: 'http://localhost:5000/login/facebook/return',
            profileFields: ['id', 'displayName', 'email', 'first_name', 'last_name']
          },
          function(accessToken, refreshToken, profile, cb) {
            // In this example, the user's Facebook profile is supplied as the user
            // record.  In a production-quality application, the Facebook profile should
            // be associated with a user record in the application's database, which
            // allows for account linking and authentication with other identity
            // providers.
            return cb(null, profile);
          }));


        // Configure Passport authenticated session persistence.
        //
        // In order to restore authentication state across HTTP requests, Passport needs
        // to serialize users into and deserialize users out of the session.  In a
        // production-quality application, this would typically be as simple as
        // supplying the user ID when serializing, and querying the user record by ID
        // from the database when deserializing.  However, due to the fact that this
        // example does not have a database, the complete Twitter profile is serialized
        // and deserialized.
        passport.serializeUser(function(user, cb) {
          cb(null, user);
        });

        passport.deserializeUser(function(obj, cb) {
          cb(null, obj);
        });






// var routes = require('./routes/index');
// var users = require('./routes/users');
// var login = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));





// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});





      // Initialize Passport and restore authentication state, if any, from the
      // session.
      app.use(passport.initialize());
      app.use(passport.session());

// app.use('/', routes);
// app.use('/users', users);
// app.use('/login', users);


app.get('/', function(req, res, next) {
  if(req.user) {
    connection.query('SELECT * from users WHERE facebook_id = "' + req.user._json.id + '"', function(err, rows, fields) {
      console.log(rows);

      connection.query('SELECT stories.codename, stories.id FROM stories INNER JOIN story_authors ON story_authors.story_id = stories.id WHERE story_authors.user_id = "' + rows[0].id + '"', function(err, stories, fields) {
        if(stories.length) {
          res.render('dashboard', { stories: stories });
        } else {
          res.render('dashboard', { stories: false });
        }
      });
    });
  } else {
    res.render('login');
  }  
});

app.post('/insert-story', function(req, res, next) {
  console.log(req.body);
  res.send('post');
});

function addStoryPage(req, res, next) {
  if(req.user) {
    if(req.body.action == 'addStory') {
      connection.query('INSERT INTO stories (codename, entry_time, visibility) VALUES (?, ?, ?)', [req.body.codename, req.body.entryTime, req.body.visibility], function(err, result) {
        
        for (i = 0; i < req.body.authors.length; i++) { 
          connection.query('INSERT INTO story_authors (story_id, user_id) VALUES (?, ?)', [result.insertId, req.body.authors[i]]);
        }

        connection.query('SELECT * from users WHERE facebook_id = "' + req.user._json.id + '"', function(err, rows, fields) {
          connection.query('INSERT INTO story_authors (story_id, user_id) VALUES (?, ?)', [result.insertId, rows[0].id], function(err, rows, fields) {
            res.redirect('/story/' + result.insertId);
          });
        });

      });
    } else {
      connection.query('SELECT * from users WHERE facebook_id != "' + req.user._json.id + '" ORDER BY rand()', function(err, rows, fields) {
        res.render('add_story', {users: rows});
      });
    }
  } else {
    res.render('login');
  } 
}

app.post('/add-story', function(req, res, next) {
   addStoryPage(req, res, next);
});

app.get('/add-story', function(req, res, next) {
   addStoryPage(req, res, next);
});

app.get('/login/facebook',
  passport.authenticate('facebook', { scope: ['email'] }));   

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { scope: ['email'], failureRedirect: '/login' }),
  function(req, res) {
    connection.query('SELECT * from users WHERE facebook_id = "' + req.user._json.id + '"', function(err, rows, fields) {
      if(!rows.length) {
        connection.query('INSERT INTO users (facebook_id, display_name, first_name, last_name, email) VALUES (' + req.user._json.id + ', "' + req.user._json.name + '", "' + req.user._json.first_name + '", "' + req.user._json.last_name + '", "' + req.user._json.email + '")');
      }

      res.redirect('/');
    });  
});

app.get('/new',function(req, res, next) {
  if(req.user) {
    res.render('new', { user: req.user });
  } else {
    res.redirect('/');
  }  
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// connection.end();

module.exports = app;

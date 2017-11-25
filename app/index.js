const http = require('http')
const express = require('express')
const passport = require('passport')
const app = express()
const port = 3000
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: '333736509560-id8si5cbuim26d3e67s4l7oscjfsakat.apps.googleusercontent.com',
    clientSecret: 'ZCMQ511PhvMEQqozMGd5bmRH',
    callbackURL: 'http://moosen.im:3000/auth/google/callback'
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile)
        return cb(null, profile)
    }
))

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
    function (req, res) {
        res.render('home', { user: req.user })
    }
)

app.get('/login',
    function (req, res) {
        res.render('login')
    }
)

app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        res.render('profile', { user: req.user })
    }
)

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
)

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/fail' }),
    function (req, res) {
        res.post('Logged in successfully')
    }
)

app.listen(port)
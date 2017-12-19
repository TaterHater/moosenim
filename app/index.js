const http = require('http')
var express = require('express')
const passport = require('passport')

const port = 3000
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const redis = require("redis")
const session = require('express-session')
var redisStore = require('connect-redis')(session)
var client = redis.createClient();
const sessionStore = new redisStore(options)
const cookieParser = require('socket.io-cookie-parser')()
var cookieParser2 = require('cookie-parser')()
const sioc = require('socket.io-client')
const sio = require('socket.io')

var app = express()
app.use(cookieParser)
app.use(cookieParser2)


app.use(session({
    key: 'keyboard cat',
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    store: new redisStore({host : localhost, port : 6379, client : client, ttl : 260})
}))

var server = http.createServer(app).listen(port, function () {
    console.log(`server up and running at port ${port}`)
})

// initialize our modules
var io = require("socket.io")(server),
    passportSocketIo = require("passport.socketio")



function onAuthorizeSuccess(data, accept) {
    console.log('success connection to socket.io')
    console.log(data)
    accept()
}

function onAuthorizeFail(data, message, error, accept) {
    if (error) {
        throw new Error(message)
    }
    console.log('failed connection to socket.io:', message)
    // this error will be sent to the user as a special error-package
    // see: http://socket.io/docs/client-api/#socket > error-object
}

//app.use(require('morgan')('combined'))
app.use(require('body-parser').urlencoded({ extended: true }))

io.use(passportSocketIo.authorize({
   cookieParser: require('cookie-parser'),       // the same middleware you registrer in express
    key: 'keyboard cat',       // the name of the cookie where express/connect stores its session_id
    secret: 'keyboard cat',    // the session_secret to parse the cookie
    store: new redisStore({ host: localhost, port: 6379, client: client, ttl: 260 })      // we NEED to use a sessionstore. no memorystore please
    fail: onAuthorizeFail,     // *optional* callback on fail/error - read more below
}))

function onAuthorizeFail(data, message, error, accept) {
    if (error) throw new Error(message)
    return accept()
}

passport.use(new GoogleStrategy({
    clientID: '333736509560-id8si5cbuim26d3e67s4l7oscjfsakat.apps.googleusercontent.com',
    clientSecret: 'ZCMQ511PhvMEQqozMGd5bmRH',
    callbackURL: 'http://moosen.im:3000/auth/google/callback'
},
    function (accessToken, refreshToken, profile, cb) {
        //console.log(profile)
        return cb(null, profile)
    }
))

//redis setup and test
var client = redis.createClient()
client.on('connect', function () {
    console.log("redis server connected test")
})
client.set('test', 'successful')

client.get('test', function (err, reply) {
    console.log(`test reply: ${reply}`)
})
var socket


    console.log('is this running?')
    var URL_SERVER = 'http://moosen.im:3000'
    socket = sioc.connect(URL_SERVER)
   




io.on('connection', function(){
   // console.log(socket.request.user)
    console.log("socket request")
    
    socket.on('test', function (s) {
        console.log(s)
    })

    console.log(socket.request.user.logged_in)
    
    
    io.emit('test', 'testingio-onconnection')





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
    client.set('users', user.id)
    client.sadd('online', user.displayName)
    socket.emit('test', 'testing')
    io.emit('test', 'testingio-serialize. display name = ' + user.displayName)
    cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
    socket.emit('test', 'testing')
    io.emit('test', 'testingio-deserialize')
    cb(null, obj)
})



})
// Configure view engine to render EJS templates.
app.set('views', __dirname + '/../views')
app.set('view engine', 'ejs')

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize())
app.use(passport.session())


// Define routes.
app.get('/',
    function (req, res) {
        res.render('home', { user: req.user })
    }
)

app.get('/login',
    function (req, res) {
        socket.emit('test', 'testing')
        res.render('login')
    }
)

app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        socket.emit('test', 'testing')
        io.emit('test', 'testingio-profile')
        client.get('users', function (err, reply) {
            console.log(`uid reply: ${reply}`)
        })
        client.smembers('online', function (err, reply) {
            console.log(`users online: ${reply}`)
        })
        res.render('profile', { user: req.user }) 
    }
)

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
)

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', failureFlash: true }),
    function (req, res) {
        res.redirect('/profile')
    }
)
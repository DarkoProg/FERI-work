"use strict";

var express = require("express"), 
	mongoose = require("mongoose"), 
	passport = require("passport"), 
	bodyParser = require("body-parser"), 
	LocalStrategy = require("passport-local"), 
	passportLocalMongoose = require("passport-local-mongoose"), 
    User = require("./models/user"), 
    http = require("http").Server(app),
    net = require("net");

var port = process.env.PORT || 3000;

mongoose.set('useNewUrlParser', true); 
mongoose.set('useFindAndModify', false); 
mongoose.set('useCreateIndex', true); 
mongoose.set('useUnifiedTopology', true); 
mongoose.connect("mongodb://localhost/usr_data"); 

var app = express(); 
app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({ extended: true })); 



app.use(express.static("public"));

app.use(passport.initialize()); 
app.use(passport.session()); 

passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

app.get("/", function (req, res) { 									//showing home page 
	res.render("home"); 
}); 
 
app.get("/control", isLoggedIn, function (req, res) { 				//showing car control page
	res.render("control"); 
}); 

app.get("/register", function (req, res) { 							//showing register form 
	res.render("register"); 
}); 

app.post("/register", function (req, res) { 						//handling user signup 
	var username = req.body.username 
	var password = req.body.password 
	User.register(new User({ username: username }), 
			password, function (err, user) { 
		if (err) { 
			console.log(err); 
			return res.render("register"); 
		} 

		passport.authenticate("local")( 
			req, res, function () { 
			res.render("control"); 
		}); 
	}); 
});


app.get("/login", function (req, res) { 							//showing login form 
	res.render("login"); 
}); 

app.post("/login", passport.authenticate("local", { 				//handling user login
	successRedirect: "/control", 
	failureRedirect: "/login"
}), function (req, res) { 
}); 

app.get("/logout", function (req, res) { 							//handling user logout
	req.logout(); 
	res.redirect("/"); 
}); 

function isLoggedIn(req, res, next) { 
	if (req.isAuthenticated()) return next(); 
	res.redirect("/login"); 
} 

var port = process.env.PORT || 3000; 
app.listen(port, function () { 
	console.log("Server Has Started!"); 
}); 

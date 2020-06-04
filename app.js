var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    User        = require("./models/user");


mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine","ejs");

app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var campgroundSchema = new mongoose.Schema({
    name: String,
    image:String,
    description: String
});

var Campground = mongoose.model("Campground", campgroundSchema)

// Campground.create(
//     {
//         name : "As Protests Engulf the United States, China Revels in the Unrest",
//         image: "https://static01.nyt.com/images/2020/06/02/world/02unrest-china-topsub/merlin_173048415_580ac3b6-371a-41bb-a977-b1b6a9c4ba84-superJumbo.jpg?quality=90&auto=webp",
//         description: "As protests over police violence engulf hundreds of cities in the United States, China is reveling in the moment, seizing on the unrest to tout the strength of its authoritarian system and to portray the turmoil as yet another sign of American hypocrisy and decline. It is a narrative that conveniently ignores many of the country’s own problems, including its history of ethnic discrimination, its record on human rights and its efforts to suppress protests in Hong Kong. Chinese officials are trolling their American counterparts with protest slogans like “Black lives matter” and “I can’t breathe.” The state-run media is featuring stories about the “double standards” of the United States for supporting the Hong Kong demonstrators. Prominent Chinese commentators are arguing that American-style democracy is a sham, pointing to the country’s bungled response to the coronavirus pandemic and ongoing racial tensions. “This situation in the U.S. will make more Chinese people support the Chinese government in its efforts to denounce and counter America,” Song Guoyou, a scholar at Fudan University in Shanghai, said in an interview. “The moral ground of the United States is indeed greatly weakened.”"
//     }, function(err, campground){
//             if(err){
//                 console.log("ERROR!!!!!!!")
//             }
//             else{
//                 console.log("DONEEEE BITCHHHH");
//                 console.log(campground);
//             }
//         }
// );


app.get("/",function(req,res){
    res.render("home")
});

app.get("/news", function(req,res){
    
    Campground.find({},function(err,allcampgrounds){
        if(err){
            console.log("Error");
        }else{
            res.render("campgrounds",{campground:allcampgrounds});
        }
    })
    
});

app.post("/news",function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name:name,image:image,description:description};

    Campground.create(newCampground,function(err,newlyCreated){
        if(err){
            console.log("Unable to add")
        }
        else{
            res.redirect("/news")
        }
    })    
});

app.get("/news/new",function(req,res){
    res.render("newCamp");
})

app.get("/news/:id",function(req,res){
    Campground.findById(req.params.id,function(err,foundCampground){
        if(err){
            console/log("Error")
        }
        else{
           res.render("show",{campground: foundCampground}); 
        }
    })
})

// AUTH ROUTES

app.get("/register",function(req,res){
    res.render("register");
})

app.post("/register",function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser,req.body.password, function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
            }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/news");
        });    
    });
});

app.get("/login",function(req,res){
    res.render("login");
})
app.post("/login",passport.authenticate("local" ,{
    successRedirect: "/news",
        failureRedirect: "/login"
    } ), function(req,res){
    res.send("Login tadaa")
});

app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/news");
});

app.listen(3000,function(){
    console.log("News now has started");
});
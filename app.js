if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}
const express=require('express')
const app=express()
const path=require('path')
const mongoose=require('mongoose')
const Joi=require('joi')
const Review=require('./models/review')
const mongoSanitize = require('express-mongo-sanitize');
const helmet=require('helmet')

const ExpressRoute=require('./routes/campground')
const reviews=require('./routes/reviews')
const userRoutes=require('./routes/user')


const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const passport=require('passport')
const LocalStrategy=require('passport-local')
const User=require('./models/user')

const session = require('express-session');
const flash = require('connect-flash');


// const { campgroundSchema,reviewSchema } = require('./schema.js');
const ejsMate=require('ejs-mate')
const methodOverride=require('method-override')


mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
const Campground=require('./models/campground')
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected")
})


app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');


app.use(express.urlencoded({ extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvp0qucoq/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


const sessionConfig = {
    name:'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser=req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
app.use('/campgrounds',ExpressRoute);
app.use('/campgrounds/:id/reviews',reviews)
app.use('/',userRoutes);





app.get('/',(req,res)=>{
    res.render('home');
})
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next)=>{
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})
// app.use((err,req,res,next)=>{
//     const {status=500, message='something went wrong'}=err
//     res.status(status).send(message);
//     //res.send("some thing went wrong")
// })
// // app.get('/makecampground', async (req,res)=>{
//     const camp=new Campground({title:'my backyard',description:'cheap camping'})
//     await camp.save()
//     res.send(camp)
// })
app.listen(8000,()=>{
    console.log("listening to the port 8000!!!")
})

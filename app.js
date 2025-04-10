const express=require("express");
const app=express();
const port=3000;
const mongoose=require("mongoose");
let path=require("path");
let methodOverride=require("method-override")
let engine=require("ejs-mate");
let ExpressError=require("./public/js/ExpressError.js")

let listingRouter=require("./routes/listing.js");
let reviewRouter=require("./routes/review.js")
const userRouter=require("./routes/user.js")

let session=require("express-session")
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local")
const User=require("./models/user.js")

main().then(()=>{console.log("connected")}).catch(err=>console.log(err))

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
}


app.use(methodOverride("_method"))
app.use(express.urlencoded({extended:true}))
app.use('/static', express.static(path.join(__dirname, 'public')))
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.engine("ejs",engine);

const sessionOptions={
    resave:false,
    saveUninitialized:true,
    secret:"secretcode",
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
}

app.use(flash())
app.use(session(sessionOptions))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})

app.get("/",(req,res)=>{
    res.render("./listing/home.ejs")
})

app.get("/demouser",async (req,res)=>{
    let fakeuser=new User({
        email:"fake@gmail.com",
        username:"fake17"
    })
    let newuser=await User.register(fakeuser,"fake17");
    res.send(newuser);
})

app.use("/listings/:id/reviews",reviewRouter)
app.use("/listings",listingRouter);
app.use("/user",userRouter);

app.all("*",(req,res,next)=>{
    next(new ExpressError(500,"no such route found !"))
})

app.use((err,req,res,next)=>{
    let {status=300,message="Something went wrong !!"}=err
    res.render("./listing/err.ejs",{message})
})

app.listen(port,()=>{
    console.log("server started on port 3000")
})
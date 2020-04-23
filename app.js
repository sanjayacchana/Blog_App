var express    = require('express'),
	mongoose   = require('mongoose'),
	bodyParser = require('body-parser'),
	expressSanitizer = require('express-sanitizer'),
	methodOverride = require('method-override');

//app Config

mongoose.connect("mongodb://localhost:27017/blogApp",{useUnifiedTopology: true, useNewUrlParser: true});
mongoose.set('useFindAndModify', false);
var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());


//define schema

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body:	String,
	created: {type: Date, default: Date.now}
});

//define model for scchema 

var blogPost = mongoose.model("blogPost",blogSchema);

//RESTFULL ROUTES

app.get("/",function(req,res){
	res.redirect("/blogs");
});

//show all blog post
app.get("/blogs",function(req,res){
	blogPost.find({},function(err,foundedBlog){
		if(err){
			console.log(err);
		} else{
			res.render("index",{blogs:foundedBlog});
		}
	});
	
});

// enables user to add new blog
app.get("/blogs/new",function(req,res){
	res.render("new");
});


// create blog and renders to blogs page
app.post("/blogs",function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	blogPost.create(req.body.blog,function(err,createdBlog){
		if(err){
			res.redirect("/blogs/new");
		}else{
			res.redirect("/blogs");
		}
	});

});

// shows blogs based on there id 

app.get("/blogs/:id",function(req,res){
	blogPost.findById(req.params.id,function(err,foundedBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show",{foundedBlog:foundedBlog});
		}
	});
});


//edit  route
app.get("/blogs/:id/edit",function(req,res){
	blogPost.findById(req.params.id,function(err,foundedBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit",{foundedBlog:foundedBlog});
		}
	});
});

//update route
app.put("/blogs/:id",function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	blogPost.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
		if(err){
			res.redirect("/blogs/"+req.params.id+"/edit");
		} else{
			res.redirect("/blogs/"+req.params.id);
		}
	});
});

//delete blog route
app.delete("/blogs/:id",function(req,res){
	blogPost.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/blogs");
		} else{
			res.redirect("/blogs");
		}
	});
});

app.listen(3000,function(){
	console.log("Blog app server started...");
});
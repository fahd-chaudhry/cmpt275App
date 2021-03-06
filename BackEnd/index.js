var express   = require('express');
var config  = require('./config');
var http      = require('http');
var util      = require('util');
var path = require('path');
var async = require('async');
var colors  = require('colors');
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var cors = require('cors');
var fs = require('fs');

var Schema = mongoose.Schema;
const MONGO_URL = 'mongodb://admin:admin@ds121535.mlab.com:21535/gotalkdev';

let rawDataUserConfig = fs.readFileSync('userConfigDefault.json');
let defaultConfigJson = JSON.parse(rawDataUserConfig);

//User schema
var users = new Schema({
		userName : String,
		userEmail : String,
		userPassword : String,
		userConfig : [{
			likedButtons : [Boolean],
			title : String,
			userEmail: String,
			categoryName: String,
			imageNames: [String]
		}]
	},
	{
		collection: 'users'
	});

	//User schema time plugin
users.plugin(timestamps);

var Model = mongoose.model('Model', users);

mongoose.connect(MONGO_URL);

console.log(('Server time: ').yellow, (new Date()).toString());
require('log-timestamp')(function() { return '[' + new Date() + '] %s' });

let app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname + '/public'));


//Save data api Which takes the username password and email as input
app.post('/save/', cors(), function(req, res) {
	console.log("Came to save!!!!!!!!!!!!");
	var data = req.body;

	var userName = null;
	var userEmail = null; 
	var userPassword = null;
	if (data.userName){
		userName = data.userName;
	}
	if (data.userEmail){
		userEmail = data.userEmail;
	}
	if (data.userPassword){
		userPassword = data.userPassword;
	}

	var isInDB = false;

	Model.find({
		'userEmail': userEmail
	}, function(err, result) {
		if (err) throw err;
		if (result != "") {
			console.log('Result :' + result);
			var jsonObj = {"result" : "exist"};
			console.log("Sending : "+ JSON.stringify(jsonObj));
			res.json(jsonObj);
		} else {
			let rawDataUserConfig = fs.readFileSync('userConfigDefault.json');
			let tempJson = JSON.parse(rawDataUserConfig);
			tempJson[0].userEmail = userEmail

			var saveUserData = new Model({
				'userName': userName,
				'userEmail': userEmail,
				'userPassword': userPassword,
				'userConfig' : tempJson
			}).save(function(err, result) {
				if (err) throw err;
				if(result) {
					var jsonObj = {"result" : "Saved"};
					console.log("Sending : "+ JSON.stringify(jsonObj));
					res.json(jsonObj);
				}
			});
		};
	});
	
});

app.post('/find/', cors(), function(req, res) {
	var data = req.body;
 	
 	var userEmail = "";
 	var userPwd =  "";

 	if (data.userEmail){
 		//console.log("I came: "+ data.userName)
		userEmail = data.userEmail;
	}
	if (data.userPassword){
		userPassword = data.userPassword;
	}

	console.log("Data came in : User email: "+ userEmail + " userPassword: " + userPassword);
	var responseData = 'false';
	Model.find({
		'userEmail': userEmail
	}, function(err, result) {
		if (err) throw err;
		if (result) {
			//res.json(result);
			console.log("Data found : "+ result);
			var dbPwd = "";

			if (result != ""){
				if (result[0].userPassword){
					dbPwd = result[0].userPassword;
				}
				console.log(result[0].userPassword + " dbpwd: "+dbPwd + " is = :"+ userPassword);
				//console.log(result[0].userPassword);
				if (userPassword == dbPwd){
					responseData = 'true';
					var jsonObj = {"result" : responseData};
					console.log("Sending : "+ JSON.stringify(jsonObj));
					res.json(jsonObj);
				}else {
					var jsonObj = {"result" : responseData};
					res.json(jsonObj);
					console.log("Sending : "+ JSON.stringify(jsonObj));
				}
			}else {
				var jsonObj = {"result" : responseData};
				res.json(jsonObj);
				console.log("Sending : "+ JSON.stringify(jsonObj));
			};

		} else {
			res.send(JSON.stringify({
				error : responseData
			}))
		};
	});
});

app.post('/api/email',cors(),function(req,res){
	var data = req.body;
 	var userEmail = "";
 	if (data.userEmail) userEmail = data.userEmail;

 	console.log("user email recived : " +userEmail);
 	Model.find({
		'userEmail': userEmail
	}, function(err, result) {
		if (err) throw err;
		if (result != "") {
			console.log('Result :' + result);
			var jsonObj = {"result" : "sentEmail"};
			res.json(jsonObj);

			var pwd = result[0].userPassword;
			console.log("User password :" + pwd + " | "+ userEmail);
			var emailText = "Hi,\n Your password is \""+  pwd + "\"  Keep it with you. Do not forget it!\n Thank you. \nGoTalk Team"
			sendEmail(userEmail, emailText);
			console.log("Sending : "+ JSON.stringify(jsonObj));
			

		} else {
			var jsonObj = {"result" : "notFound"};
			console.log("Sending : "+ JSON.stringify(jsonObj));
			res.json(jsonObj);
		};
	});
});


function sendEmail(email, stringToPass){

	// using SendGrid's v3 Node.js Library
	// https://github.com/sendgrid/sendgrid-nodejs
	console.log("@@@@@@ email: "+email+" pwd: "+ stringToPass);
	const sgMail = require('@sendgrid/mail');
	sgMail.setApiKey("Public key");
	var msg = {
	  to: email,
	  from: 'noreply@gotalk.com',
	  subject: 'Password reset',
	  text: stringToPass,	
	};
	sgMail.send(msg);
}

app.post('/api/saveConfig', cors(), function(req,res){
	var data = req.body;
	var userEmail = "";
	if (data[0].userEmail){
 		console.log("Data userName: "+ data[0].userEmail)
		userEmail = data[0].userEmail;
	}

	Model.update( { userEmail : userEmail } , { userConfig: data}, function(err){
		console.log("this should not happen");
		var jsonObj = {"result" : "Done"};
		console.log("Sending : "+ JSON.stringify(jsonObj));
		res.json(jsonObj);
	});

});

app.post('/api/getConfig', cors(), function(req,res){
	var data = req.body;
	var userEmail = "";
	if (data.userEmail){
 		console.log("Data userName: "+ data.userEmail)
		userEmail = data.userEmail;
	}
	console.log(userEmail);
	Model.findOne({ 'userEmail': userEmail }, 'userConfig' ,function (err, config) {
  		if (err) return handleError(err);
	  	//console.log(config);
	  	console.log(config["_id"]);
	  	config = config.toObject(); 
	  	delete config._id;

	  	for (let i =0 ;i<config['userConfig'].length; i++){
	  		delete config['userConfig'][i]._id;
	  	}
	  	console.log(config);
	  	res.json(config.userConfig);
	 });

});


app.post('/api/getUser', cors(), function(req,res){
	var data = req.body;
	var userEmail = "";
	if (data.userEmail){
 		console.log("Data userName: "+ data.userEmail)
		userEmail = data.userEmail;
	}
	console.log(userEmail);
	Model.findOne({ 'userEmail': userEmail }, 'userName' ,function (err, config) {
  		if (err) return handleError(err);
	  	//console.log(config);
	  	console.log(config["_id"]);
	  	config = config.toObject(); 

	  	var jsonObj = {"userName" : config.userName ,
							"userEmail" : data.userEmail};
						
	  	console.log(jsonObj);
	  	res.json(jsonObj);
	 });

});



//For all other api send public

app.get('*', function(req, res) {
	console.log("Sending the index.html");
    res.status(200).sendFile(path.resolve('public/index.html'));
});


app.set('port', (process.env.PORT || 5000));

//MARK::::: HEROKU does not listen in any other port than 5000
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


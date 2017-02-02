var express = require('express')
var app = express()
var mongo = require('mongodb').MongoClient
var validUrl = require('url-valid');
var api = require('./App/app.js');
var cur=require("cur.lv")();


// Connection URL
var url = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/url-shortener';

mongo.connect(url, function(err,db){
    if (err) {
        throw err;
    }
    
    // Create collection
    var options = {
        server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
        replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
    };
    
    db.createCollection("short_urls",options);
    
    //Set the html 
    app.use(express.static(__dirname + "/../Public"));
    
    //call the app
    api(app, validUrl, cur, db);
});


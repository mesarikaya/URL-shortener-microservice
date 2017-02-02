'use strict';

var express = require('express');
var app = express();
var path = require('path');
var mongo = require('mongodb');
var validUrl = require('url-valid');
var api = require('./App/app.js');
var cur=require("cur.lv")();

// Connection URL
var url = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/url-shortener';

mongo.MongoClient.connect(url, function(err,db){
    if (err) {
        throw err;
    }
    
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
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
    
    
    var port = process.env.PORT || 8000;
    
    app.listen(port, function() {
        console.log('Node.js listening on port ' + port);
    });
    
});


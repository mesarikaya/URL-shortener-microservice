'use strict';

module.exports = function(app,  validUrl, cur, db) {
    // Check the /newurl/:url combination
    var hostwebsite = "https://url-shortener-microservices.herokuapp.com/";
    app.get('/new/:url*', function (req, res) {
        var collection = db.collection('short_urls');
        
        //Check if url is valid via using valid url package
        var url = req.originalUrl.split('/new/')[1];
        console.log(req.originalUrl.split('/new/')[1]);
        
        validUrl(url, function (err, valid) {
          console.log('Url valid? is: ' , valid);
          if (err){
             throw err; // if function gives error, share error message
          }
          else if (!valid){// if url is invalid share error message
             //console.log('url isss: ', valid);
             res.send({'Error':'Please enter a valid url.'});
          }
          else{//Generate a short url and save to the database
             cur.short(url,function(val){
                val = val + '';
                val = val.slice(14); // remove the parts of the url with curl.lv
                console.log('updating the database with document: ', {'original_url':url, 'short_url':hostwebsite+""+val} );
                var addition = {'original_url':url, 'short_url':hostwebsite+""+val};
                collection.insertOne(addition);
                res.send({'original_url':url, 'short_url':hostwebsite+""+val});
             });
          }
        });
    });
    
    // Check extension with short url
    app.get('/:shortURL',function (req, res) {
        var collection = db.collection('short_urls');
        // Check if URL is in the database
        var url = hostwebsite + "" + req.params.shortURL
        collection.findOne({'short_url':url},function(err,doc){
            if (err) throw err
            //console.log(doc)
            if (typeof doc !== 'undefined'){
                console.log(doc.original_url);
                //res.writeHead(302, {Location: "http" + (req.socket.encrypted ? "s" : "") + "://" + doc[0].original_url});
                //res.end(console.log('Redirecting to webpage') + '\n');
                /* res.statusCode = 301;
                res.setHeader("Location","http" + (req.socket.encrypted ? "s" : "") + "://" + doc.original_url);
                res.end();*/
                console.log('Found ' + doc);
                console.log('redirecting to: ',doc.original_url);
                res.redirect(302,doc.original_url);
            }
            else {
                res.send({'Error':'Url is not in the database.'});
            }
        });
    })
    
    // Check home page on open
    app.get('/', function (req, res) {
        res.sendFile(process.cwd() + '/Public/index.html');
    })
    
};
'use strict';

module.exports = function(app,  validUrl, cur, db) {
    // Check the /newurl/:url combination
    var collection = db.collection('short_urls');
    
    app.get('/new/:url*', function (req, res) {
        
        // Retrieve and format host website
        if (typeof process.env.API_URL !== undefined){
            if (req.protocol === "https"){
                var hostwebsite = req.protocol + '://' + req.get('host');
            }
            else{
                var hostwebsite = req.protocol + 's://' + req.get('host');
            }
            
        }
        else{
            var hostwebsite = process.env.API_URL;
        }
        
        // format url
        var url = req.originalUrl.split('/new/')[1];
        
        if (url.slice(0,4)!=='http' || url.slice(0,5)!=='https'){
            url = "https://"+url;
        }
        
        //Check if url is valid via using valid url package using url-valid package
        validUrl(url, function (err, valid) {
          console.log('Url valid? is: ' , valid);
          if (err){
             throw err; // if function gives error, share error message
          }
          else if (!valid){// if url is invalid share error message
             //console.log('url isss: ', valid);
             res.send({'Error':'Please enter a valid url.'});
          }
          else{//Generate a short url using curl package and save to the database
             cur.short(url,function(val){
                val = val + '';
                val = val.slice(14); // remove the parts of the url with curl.lv
                console.log('updating the database with document: ', {'original_url':url, 'short_url':hostwebsite+"/"+val} );
                var addition = {'original_url':url, 'short_url':hostwebsite+"/"+val};
                collection.insertOne(addition);
                res.send({'original_url':url, 'short_url':hostwebsite+"/"+val});
             });
          }
        });
    });
    
    // Check extension with short url
    app.get('/:shortURL',function (req, res) {
        // Check if URL is in the database
        if (req.params.shortURL !== "favicon.ico" ){//c9 open it with favicon.ico extension. report this as error and only seacrh databse when user adds an extension
           if (typeof process.env.API_URL !== undefined){
            if (req.protocol === "https"){ //Check the prottocol to see if it is https
                var hostwebsite = req.protocol + '://' + req.get('host');
            }
            else{
                var hostwebsite = req.protocol + 's://' + req.get('host');
            }
            }
            else{
                var hostwebsite = process.env.API_URL;
            }
            
            var url = hostwebsite + "/" + req.params.shortURL;
            
            collection.findOne({'short_url':url},function(err,doc){
                if (err) throw err
                if (typeof doc !== 'undefined'){
                    console.log('Found ' + doc);
                    console.log('redirecting to: ',doc.original_url);
                    res.redirect(302,doc.original_url);
                }
                else {
                    res.send({'Error':'Url is not in the database.'});
                }
            }); 
        }
        else{
            res.send({'Error':'Url is not in the database.'});
        }
        
    })
    
    // Check home page on open
    app.get('/', function (req, res) {
        res.sendFile(process.cwd() + '/Public/index.html');
    })
    
};
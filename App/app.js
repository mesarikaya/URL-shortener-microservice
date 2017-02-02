module.exports = function(app,  validUrl, cur, db) {
    // Check the /newurl/:url combination
    var collection = db.collection('short_urls');
    
    app.get('/newurl/:url*', function (req, res) {
        //Check if url is valid via using valid url package
        if (req.params.url.slice(4) === 'http' || req.params.url.slice(5) === 'https'){
            var url = req.params.url + '';
        }
        else{
            var url = 'http://' + req.params.url;
        }
        
        validUrl(url, function (err, valid) {
          if (err){
             throw err; // if function gives error, share error message
          }
          else if (!valid){//if url is invalid share error message
             console.log('url isss: ', valid);
             res.send({'Error':'Please enter a valid url.'});
          }
          else{//Generate a short url and save to the database
             cur.short(url,function(val){
                val = val +'';
                val = val.slice(14); // remove the parts of the url with curl.lv
                console.log('updating the database with document: ', {'original_url':req.params.url, 'short_url':val} );
                var addition = {'original_url':req.params.url, 'short_url':val};
                collection.insertOne(addition);
                res.send({'original_url':req.params.url, 'short_url':val});
             });
             
          }
          
        });
    });
    
    // Check extension with short url
    app.route('/:shortURL')
        .get(function (req, res) {
            // Check if URL is in the database
            collection.find({'short_url':req.params.shortURL}).toArray(function(err,doc){
                if (err) throw err
                
                if (typeof doc[0] !== 'undefined'){
                    console.log("https" + (req.socket.encrypted ? "s" : "") + "://" + doc[0].original_url);
                    res.redirect("https" + "://" + doc[0].original_url);
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
    
    app.listen(process.env.PORT || 8080, function () {
      console.log('Example app listening on port 8080!')
    })
    
    
    
    
};
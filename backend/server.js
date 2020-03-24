// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var dbTools = require('./app/tools/db_tools');
var port = process.env.PORT || 8080;

dbTools.DBConnectMongo()
    .then(() => {
        // get all data/stuff of the body (POST) parameters
        // parse application/json 
        app.use(bodyParser.json()); 
        
        // parse application/vnd.api+json as json
        app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
        
        // parse application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({ extended: true })); 
        
        // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
        app.use(methodOverride('X-HTTP-Method-Override')); 
        
        require('./app/routes')(app); // configure our routes
        
        app.listen(port);
        
        console.log('http://localhost:' + port + '/api/test');
        
        // expose app    
        exports = module.exports = app;
    })
    .catch(err => console.log('Error: ' + err))
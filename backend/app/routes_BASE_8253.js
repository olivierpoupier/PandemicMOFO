var Example = require('./models/example');

module.exports = function(app) {
    app.get('/api/test', function(req, res) {
        console.log("test");
        res.json(Example);
    });

    // default
    app.get('/api/*', function(req, res) {
        res.json(Example);
    });
};
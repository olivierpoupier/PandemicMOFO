var Example = require('./models/example');

module.exports = function(app) {
    app.get('/api/test', function(req, res) {
        res.json(Example.getExamples());
    });

    // default
    app.get('/api/*', function(req, res) {
        res.json(Example);
    });
};
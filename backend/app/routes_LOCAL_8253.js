var Example = require('./models/example');
var imageProcessing = require('../imageProcessing.js')
module.exports = function(app) {
    app.get('/train', function(req, res) {
      var imagePath = req.query.path;
      var answer = req.query.result;
      if (imagePath && answer){
        imageProcessing.resizeImage("some.png", (imageName) => {
          imageProcessing.train(imageName, answer);
        });
        res.send("done");
      }else{
        res.error("invalid arguments");
      }

    });

    // default
    app.get('/feed', function(req, res) {
        var imagePath = req.query.path;
        if (imagePath){
          imageProcessing.resizeImage(imagePath, (imageName) => {
            imageProcessing.feed(imageName, (result) => {
              res.send(result);
            });
          });
        }else{
          res.error("invalid arguments")
        }
    });
};

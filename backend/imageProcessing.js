var convnetjs = require("convnetjs");
var {Vol} = convnetjs;
var PNG = require('png-js');
var sizeOf = require('image-size');
var Clipper = require('image-clipper');
var fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
Clipper.configure({
    canvas: require('canvas')
});
var neuralNet = createNeuralNet();
var modules = {}
modules.resizeImage = function(imageName, callback){
  Clipper("images/" + imageName, function() {
    this.crop(0, 0, sizeOf("images/" + imageName).width, sizeOf("images/" + imageName).height)
    .resize(200, 100)
    .quality(80)
    .toFile('images/cropper' + imageName, function() {
        fs.unlinkSync("images/" + imageName);
        callback("images/cropper" + imageName)
     });
   })
}

modules.train = function train(imagePath, withToiletPaper){
  var dimension = sizeOf(imagePath)
  var W = dimension.width;
  var H = dimension.height;
  var pv = []
  var x = new Vol(W, H, 1, 0.0); //input volume (image)
  PNG.decode(imagePath, function(pixels) {
    for (var i = 0; i < pixels.length; i+= 4){
      var arr = [pixels[i], pixels[i + 1], pixels[i + 1]]
      var average = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
      pv.push(average/255.0-0.5);
    }
    var trainer = new convnetjs.Trainer(neuralNet, {method: 'sgd', learning_rate: 0.5,
                                    l2_decay: 0.001, momentum: 0.9, batch_size: 10,
                                    l1_decay: 0.001});
    for (var i = 0; i < 100; i++){
      trainer.train(x, (withToiletPaper)?0:1);
    }
    var json = neuralNet.toJSON();
    var str = JSON.stringify(json);
    fs.writeFile("saved.json", str, (err)=>{
      fs.unlinkSync(imagePath);
    });
  });
}
modules.feed = function feed(imagePath, callback){
  console.log(neuralNet);
  if (!neuralNet){
    callback("still loading boyy");
    return;
  }
  var dimension = sizeOf(imagePath)
  var W = dimension.width;
  var H = dimension.height;
  var pv = []
  var x = new Vol(W, H, 1, 0.0); //input volume (image)
  PNG.decode(imagePath, function(pixels) {
    for (var i = 0; i < pixels.length; i+= 4){
      var arr = [pixels[i], pixels[i + 1], pixels[i + 1]]
      var average = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
      pv.push(average/255.0-0.5);
    }
    let res = neuralNet.forward(x);
    callback(res.w)
    fs.unlinkSync(imagePath);
  });
}
function createNeuralNet(){
  let content = fs.readFileSync("saved.json", "utf8");
  if (content != ""){
    var net2 = new convnetjs.Net(); // create an empty network
    net2.fromJSON(JSON.parse(content));
    return net2;
  }
  var layer_defs = [];
  layer_defs.push({type:'input', out_sx:32, out_sy:32, out_depth:3}); // declare size of input
  // output Vol is of size 32x32x3 here
  layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
  // the layer will perform convolution with 16 kernels, each of size 5x5.
  // the input will be padded with 2 pixels on all sides to make the output Vol of the same size
  // output Vol will thus be 32x32x16 at this point
  layer_defs.push({type:'pool', sx:2, stride:2});
  // output Vol is of size 16x16x16 here
  layer_defs.push({type:'conv', sx:5, filters:20, stride:1, pad:2, activation:'relu'});
  // output Vol is of size 16x16x20 here
  layer_defs.push({type:'pool', sx:2, stride:2});
  // output Vol is of size 8x8x20 here
  layer_defs.push({type:'conv', sx:5, filters:20, stride:1, pad:2, activation:'relu'});
  // output Vol is of size 8x8x20 here
  layer_defs.push({type:'pool', sx:2, stride:2});
  // output Vol is of size 4x4x20 here
  layer_defs.push({type:'softmax', num_classes:2});
  // output Vol is of size 1x1x10 here

  net = new convnetjs.Net();
  net.makeLayers(layer_defs);
  return net;
}
module.exports = modules

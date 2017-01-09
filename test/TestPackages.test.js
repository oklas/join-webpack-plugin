var fs = require("fs");
var path = require("path");
var should = require("should");
var webpack = require("webpack");

var packages = fs.readdirSync(path.join(__dirname, "packages"));

var packagesDir = path.join(__dirname, "packages");
var distsDir = path.join(__dirname, "dists");

function fileContent(path) {
  try {
    return fs.readFileSync(path, "utf-8");
  } catch(e){}
  return "";
}

function compareFiles(actual,expected) {
  actual = fileContent(actual);
  expected = fileContent(expected);
  var eq = actual === expected;
  if( ! eq ) try {
    actual = JSON.parse(actual);
    expected = JSON.parse(expected);
  } catch(e){}
  actual.should.be.deepEqual(expected, " should be deep eqaual");
}

describe("TestPackages", function() {
  packages.forEach(function(testCase) {
    it(testCase, function(done) {
      var caseDir = path.join(packagesDir, testCase);
      var distDir = path.join(distsDir, testCase);

      var options = { entry: { test: "./index.js" } };
      var webpackConfig = path.join(caseDir, "webpack.config.js");
      if(fs.existsSync(webpackConfig))
        options = require(webpackConfig);
      options.context = caseDir;
      if(!options.output) options.output = { filename: "[name].js" };
      if(!options.output.path) options.output.path = distDir;

      webpack(options, function(err, stats) {
        if(err) return done(err);
        if(stats.hasErrors()) return done(new Error(stats.toString()));

        var expectedDirectory = path.join(caseDir, "expected");
        fs.readdirSync(expectedDirectory).forEach(function(file) {
          var filePath = path.join(expectedDirectory, file);
          var actualPath = path.join(distDir, file);
          compareFiles(actualPath,filePath);
        });
        done();
      });
    });
  });
});

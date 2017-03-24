var should = require("should");
var rewire = require('rewire');

var loader = rewire('../loader');

namePreTmpl = loader.__get__('namePreTmpl'); 

describe("loader asserts on", function() {
  it("too much hashes", function() {
    (function(){
      namePreTmpl('', '[hash][hash]');
    }).should.throw(/^only one hash supported/);
  });

  it("have no associated plugin", function() {
    var self = { options: { plugins: [] } };
    (function(){
      loader.call(self);
    }).should.throw(/webpack plugin not found/);
  });
});

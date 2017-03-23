var should = require("should");

var plugin = require('../index');

describe("plugin options asserts on it", function() {
  it("is not object", function() {
    (function(){
      plugin('');
    }).should.throw(/be object of key:values/);
  });

  it("have not join() function", function() {
    var options = {};
    (function(){
      plugin(options);
    }).should.throw(/'join' option must be function/);
  });

  it("have not save() function", function() {
    var options = {
      join: function(){}
    };
    (function(){
      plugin(options);
    }).should.throw(/'save' option must be function/);
  });

  it("does not assert when search omited", function() {
    var options = {
      join: function(){},
      save: function(){}
    };
    (function(){
      plugin(options);
    }).should.not.throw();
  });

  it("search is not string or array", function() {
    var options = {
      join: function(){},
      save: function(){},
      search: {}
    };
    (function(){
      plugin(options);
    }).should.throw(/'search' option must be string or array/);
  });
});

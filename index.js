
//! @file
//! @date 2017.01.09
//! @author Serguei Okladnikov <oklaspec@gmail.com>

var NEXT_ID = 0;

function JoinPlugin(options) {
  this.id = options.id != null ? options.id : ++NEXT_ID;
  this.options = options;
}
module.exports = JoinPlugin;

JoinPlugin.prototype.apply = function (compiler) {
};

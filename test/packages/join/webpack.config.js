var JoinPlugin = require("../../../");
module.exports = {
  entry: "./index",
  plugins: [
    new JoinPlugin({
      filename: "file.json",
    })
  ]
};

var JoinPlugin = require("../../../");

module.exports = {
  entry: "./index",
  module: {
    loaders: [
      {
        test: /\.(json)$/i,
        loaders: [
          JoinPlugin.loader()
        ]
      }
    ]
  },
  plugins: [
    new JoinPlugin({
      searchGlobs: './src/**/*.json'
    })
  ]
};

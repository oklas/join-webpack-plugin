var JoinPlugin = require("../../../");

module.exports = {
  entry: "./index",
  module: {
    loaders: [
      {
        test: /\.(json)$/i,
        loaders: [
          JoinPlugin.loader({group:'[name]', name: '[name].[ext]'})
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

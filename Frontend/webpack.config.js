const path = require("path")

module.exports = {
  entry:  "./logic/index.js",
  output:  {
    path: `${__dirname}/../Backend/static`,
    filename: "app.js"
  },
 module: {
  rules: [
    {
      test: /\.jsx?$/,
      use: {
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/preset-env",
            "@babel/react"
          ],
          plugins: [

          ]
        }
      }
    },
    {
      test: /\.sass$/,
      use: [
          "style-loader",
          "css-loader",
          "sass-loader"
      ]
    }
  ]
 }
}

// {
//     test: /\.jsx?$/,
//     loader: ["babel"],
//     include: [
//         path.resolve(__dirname, "logic")
//     ],
//     query: {
//         plugins: ["transform-runtime"],
//         presets: ["es2015", "stage-0", "react"]
//     }
// },
// {
//     test: /\.s[a|c]ss$/,
//     loaders: [
//         "style",
//         "css",
//         "postcss",
//         "sass"
//     ]
// }

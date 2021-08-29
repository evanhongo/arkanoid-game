const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const StylelintPlugin = require("stylelint-webpack-plugin");

//thread-loader
const threadLoader = require("thread-loader");

const cssWorkerPool = {
  workerParallelJobs: 2,
  poolTimeout: 2000,
};

threadLoader.warmup(cssWorkerPool, ["css-loader", "sass-loader"]);

const config = {
  mode: "development",
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "js/[name].[hash].bundle.js",
    publicPath: ""
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  devServer: {
    static: path.resolve(__dirname, "src"),
    port: 3000,
  },
  // optimization: {
  //   runtimeChunk: "single",
  //   splitChunks: {
  //     cacheGroups: {
  //       reactVendor: {
  //         name: "reactVendor",
  //         test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
  //         chunks: "all",
  //         enforce: true,
  //         priority: 10,
  //         reuseExistingChunk: true,
  //       },
  //     },
  //   },
  // },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.json'
        },
      },
      {
        test: /\.s?css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../",
            },
          },
          {
            loader: "thread-loader",
            options: cssWorkerPool,
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 2, // 2 => postcss-loader, sass-loader
              // modules: {
              //   localIdentName: "[name]__[local]___[hash:base64:5]",
              // },
            }
          },
          // {
          //   loader: "postcss-loader",
          //   options: {
          //     postcssOptions: {
          //       plugins: [
          //         "postcss-preset-env"
          //       ],
          //     },
          //   }
          // },
          // "sass-loader"
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: {
          loader: "url-loader",
          options: {
            name: "img/[name].[ext]",
            limit: 8192,
            fallback: require.resolve("file-loader"),
          },
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "font/[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].[hash:3].css",
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.ejs",
      templateParameters: {
        title: "Arkanoid Game",
      },
      filename: "index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/favicon.ico", to: "favicon.ico" },
        { from: "src/asset", to: "asset" },
      ]
    })
  ]
};

module.exports = (env, argv) => {
  if (argv.mode === "development") {
    config.devtool = "source-map";
    config.plugins.push(new BundleAnalyzerPlugin({ analyzerPort: 3001 }));
    config.plugins.push(new StylelintPlugin());
  } else {
    config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    config.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
    config.plugins.push(new webpack.NoEmitOnErrorsPlugin());
  }
  // const dllFiles = fs.readdirSync(path.resolve(__dirname, "dll"));
  // dllFiles.forEach((file) => {
  //   if (/.*\.dll\.js$/.test(file)) {
  //     config.plugins.push(
  //       new AddAssetHtmlWebpackPlugin({
  //         filepath: path.resolve(__dirname, "dll", file),
  //       })
  //     );
  //   } else if (/.*\.manifest\.json$/.test(file)) {
  //     config.plugins.push(
  //       new webpack.DllReferencePlugin({
  //         context: path.resolve(__dirname, "dll"),
  //         manifest: path.resolve(__dirname, "dll", file),
  //       })
  //     );
  //   }
  // });

  const smp = new SpeedMeasurePlugin();
  return smp.wrap(config);
};

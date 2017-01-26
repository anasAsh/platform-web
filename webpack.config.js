var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: "./src//www/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/lib/dist"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        loaders: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" }
        ],

        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDOM"
    // },

    plugins: [
        new CopyWebpackPlugin([
          { from: './src/www/index.html', to: __dirname + "/lib/dist" },
          { from: './node_modules/react-fbmessenger/dist/out.scss', to: __dirname + "/lib/dist/messenger.css" },
        ]),
    ],
};
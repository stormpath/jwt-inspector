var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    quiet: false,
    entry: [
        './src/js/'
    ],
    output: {
        library: 'JwtInspector',
        libraryTarget: 'umd',
        path: __dirname + '/build/',
        filename: '/js/app.min.js'
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
    },
    module: {
        preLoaders: [{
            test: /\.json$/,
            loader: 'json'
        }],
        loaders: [{
            test: /\.js$/,
            loaders: ['babel'],
            include: path.join(__dirname, './src/js/')
        }, {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader'),
            include: path.join(__dirname, './src/css/')
        }]
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new ExtractTextPlugin('/css/app.min.css', {
            allChunks: true
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false
            }
        })
    ]
};

const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

const config = {
	context: path.join(__dirname, '/frontend'),
	entry: {
		'index': './ts/views/Index.ts',
	},
	output: {
		path: path.join(__dirname, '/frontend/js'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'ts-loader'
				},
			},
			{
				test: /\.s?[ac]ss$/i,
				use: [
					// Creates `style` nodes from JS strings
					'style-loader',
					// Translates CSS into CommonJS
					'css-loader',
					// Compiles Sass to CSS
					'sass-loader'
				]
			},
			{
				test: /\.hbs/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'handlebars-loader',
						query: {
							knownHelpers: ['hyphenate', 'eq', 'noteq', 'includes']
						}
					}
				]
			}
		]
	},
	externals: [
		{'jQuery': 'jQuery'},
	],
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	plugins: [
		new webpack.EnvironmentPlugin({
			REQUEST_PREFIX: '',
		})
	]
};

module.exports = (env, options) => {
	if (options.mode !== 'production') {
		config.devtool = 'source-map';
	}

	return config;
};

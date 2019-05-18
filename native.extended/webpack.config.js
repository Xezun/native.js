module.exports = {
	entry: "./js/index.js", // __dirname + "/js/native.js",  // 已多次提及的唯一入口文件
	output: {
		path: __dirname + "/../Products", 		// 打包后的文件存放的地方
		filename: "native.extended.js" 				// 打包后输出文件的文件名
	},
	mode: 'production'  					// development/production

	// devtool: 'eval-source-map',
	// devServer: {
	// 	contentBase: "./public", //本地服务器所加载的页面所在的目录
	// 	historyApiFallback: true, //不跳转
	// 	inline: true //实时刷新
	// },

	// module: {
	// 	rules: [{
	// 		test: /(\.jsx|\.js)$/,
	// 		use: {
	// 			loader: "babel-loader",
	// 			options: {
	// 				presets: [
	// 					"env", "react"
	// 				]
	// 			}
	// 		},
	// 		exclude: /node_modules/
	// 	}]
	// }
}
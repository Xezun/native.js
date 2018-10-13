var path = require('path');  //加载nodejs的路径处理模块
module.exports = {
    entry: './es6/js.js',
    output: {
        path: './app/js', //__dirname,        //__dirname是一个nodejs变量，表示当前js文件所在的目录
        filename: 'js.js'
    },
    module: {
        loaders: [
            {
                test: path.join(__dirname, 'es6'),    //配置文件目录下的es6文件夹作为js源代码文件夹，所有源代码一定要放在该文件夹下
                loader: 'babel-loader' ,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};
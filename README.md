# native.js API 文档

## 简介

`native.js` 旨在规范 JavaScript 与原生 native 的交互过程，以方便研发和维护。

## HTML

### 安装

`native.js` 支持使用 npm 安装，也可以直接下载 `Products` 目录下[压缩好源码文件](./Products)。

```bash
# 核心模块
$ npm install @mlibai/native.js
# 带拓展的模块（包括上面的核心部分）
$ npm install @mlibai/native.extended.js
```

### 引用

1. [@mlibai/native.js](./native/README.md)

```javascript
var native = require('@mlibai/native.js');
// 或者
import '@mlibai/native.js'
```

2. [@mlibai/native.extended.js](./native.extend/README.md)

```javascript
var native = require('@mlibai/native.extended.js');
// 或者
import '@mlibai/native.extended.js'
```

## 研发计划




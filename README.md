# native.js API 文档

## 简介

`native.js` 旨在规范 JavaScript 与原生 native 的交互过程，以方便研发和维护。

## HTML

### 安装

`native.js` 支持使用 npm 安装，也可以直接下载 `Products` 目录下[压缩好源码文件](./Products)。

```bash
# 核心模块
$ npm i @mlibai/native.js

# 带拓展功能的模块
$ npm i @mlibai/native.extended.js
```

### 引用

1. 核心模块 [@mlibai/native.js](./native/README.md)

核型模块只包含基础功能，开发者可以在此基础上，根据自身业务需求进行拓展。

```javascript
import native from '@mlibai/native.js'
// 或者
import { Native, native } from '@mlibai/native.js'
```

2. 拓展模块 [@mlibai/native.extended.js](./native.extend/README.md)

自带了部分拓展功能的模块。

```javascript
import native from '@mlibai/native.extended.js'
// 或者
import { Native, native } from '@mlibai/native.extended.js'
```

## 研发计划

1. 拓展 native 增加执行本地 js 的能力，以解决低版本安卓手机不能执行超长 js 的问题：native.evaluate("file:///tmp/js.js", callbak);


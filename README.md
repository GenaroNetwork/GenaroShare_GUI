
<h1 align="center">eden-share.js-gui </h1>
<h2 align="center">Share hard drive to Genaro network</h2>
<h4 align="center">Version 1.0.3 </h4>

## 目录

* [简介](#简介)
* [提前了解](#提前了解)
* [构建开发环境](#构建开发环境)
* [编译和运行](#编译和运行)
  * [获取源码](#获取源码)
  * [安装依赖](#安装依赖)
  * [运行测试](#运行测试)
  * [程序打包](#程序打包)
* [开发概述](#开发概述)
  * [系统配置](#系统配置)
  * [web3配置](#web3配置)
  * [新建分享默认配置](#新建分享默认配置)
  * [genaroSharer-daemon](#genaroSharer-daemon)
* [官方网站](#官方网站)

# 简介

Genaro Eden Sharer（简称Genaro Sharer），分享者可以分享指定的存储空间，当Genaro Eden使用者上传的文件碎片存储过来时，获得对应GNX奖励；分享者进行PoS押注，并获得PoS奖励。通过共享经济原理建立通证模型，释放社会闲置存储空间并产生价值。

# 提前了解

开发Genaro Sharer，您需要提前了解以下基础知识：

* 区块链
* 智能合约
* 以太坊
* web3

# 构建开发环境

确保您已安装以下依赖：

* Git
* Node.js LTS(8.x.x)
* NPM
* Python 2.7
* C++编译器（Windows系统下）

# 编译和运行
## 获取源码

```shell
$ git clone https://github.com/GenaroNetwork/GenaroShare_GUI.git
```

## 安装依赖

```shell
$ npm install
```

## 运行测试

```shell
# serve with hot reload at localhost:9080
$ npm run dev
```

## 程序打包

```shell
$ npm run build
```

# 开发概述

## 配置

程序运行以后，相应链接路径以及一些系统变量的配置存放在`src\config.js`中，主要包括：

1. BRIDGE_API_URL: 连接eden-bridge的url地址；

2. CHECK_MAC_UPDATE_URL：检验mac版本是否为最新版本的url地址；

3. CHECK_WIN_UPDATE_URL：检验windows版本是否为最新版本的url地址；

## web3配置

与web3相关的变量配置均存放在`src\wallet\web3Util.js`中，分为开发环境和生产环境两部分，主要包括：

1. web3Provider：web3 http privider；

2. chainId：chainId；

3. GNXAddr：支付GNX的地址；

4. EtherscanURL：检验以太坊交易的url路径；

5. EMUAddr：用户进行押注和获取收益时，使用的智能合约的地址；

## 新建分享默认配置

sharer用户新建分享节点后，默认的节点配置在`src\lib\config.js`中，同样分为开发环境和生产环境两部分，主要包括：

1. paymentAddress：用户支付钱包；

2. bridges：连接eden-bridge的相关配置；

3. rpcAddress：RPC地址，正常情况不需修改；

4. rpcPort： RPC端口；

5. storagePath： 用户选择的共享空间的路径；

6. storageAllocation： 用户指定的共享空间的大小；

大部分配置都是提供genaroSharer-daemon使用的，请不要随意删除。

## genaroSharer-daemon

用户所有的分享节点的启动、暂停、重启等方法都由genaroSharer-daemon提供，主要提供了以下操作：

1. start：节点启动（强制需要用户先进行stake押注，否则不能启动）；

2. stop：节点停止（与destroy不同，停止的节点依旧存在于节点列表中）；

3. restart：节点重启；

4. status：查看所有节点状态；

5. killall：结束所有节点，并停止genaroSharer-daemon进程；

6. destroy：停止节点，并从列表中移除；

7. checkReward：查看节点的收益；

8. getReward：获取节点收益（获取的收益存放在用户新建节点是押注所使用的钱包中）；

# 官方网站

- https://genaro.network/

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[1c165f7](https://github.com/SimulatedGREG/electron-vue/tree/1c165f7c5e56edaf48be0fbb70838a1af26bb015) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
# GenaroShare_GUI
# GenaroShare_GUI

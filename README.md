# Wx2Taro
wx 小程序代码转换为 taro 代码

## 本地开发
安装依赖，不建议使用 npm 或者 yarn
```sh
pnpm i
```

本地调试
将测试的待编译小程序4个文件放到 demo 目录下

```sh
// link 到全局 node_modules
pnpm link --global

// watch 文件
npm run dev

// 调试
wx2taro 
```

## 注意点
- component 中 properties 定义的 observer 全部改成 observers 来实现
- this 当做参数的情况目前未处理，如：getFp(this, wx.getStorageSync('userId') || '');


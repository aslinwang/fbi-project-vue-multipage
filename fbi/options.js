const path = require('path')
const package = require('../package.json')
const __CDN__ = `cdn.com`

module.exports = {
  name: package.name,
  version: package.version,
  server: {
    // 生产文件生成的目标目录
    root: 'dst/',
    tempRoot: 'dst/.temp/',
    ssrRoot: 'dst/ssrBundle/',
    host: 'localhost',
    port: 8899,
    proxy: {
      '/proxy': 'http://localhost:3000'
    },
  },
  cdnPath: __CDN__,
  webpack: {
    // 模板引擎
    tmpl: 'handlebars',
    // 热更新
    hot: true,
    // 是否生成版本戳(用于非覆盖式发布)
    hash: false,
    // css、js是否内联
    inline: false,
    // 是否生成公共文件
    commons: true,
    // 是否混淆/压缩代码
    compress: true,
    // 模板数据(编译时数据)
    data: {
      // 所有环境
      all: {
        // CDN路径前缀（用于webpack打包）
        __CDN__: '//' + __CDN__,
        // PC打开时跳转的URL
        PC_URL: 'http://www.qq.com/',
        VERSION: 'v1.0.1',
        COPYRIGHT: '@2019'
      },
      // 开发环境
      dev: {
        __CDN__: './',//CDN路径前缀（用于代码中的全局变量）    
        __APIROOT__: '//cgi.test',
        __DEV__: true,
        __SSR__: false,
        __SENTRY_VERSION__: 'dev',
        __VERSION__: 'dev'
      },
      // 测试环境
      test: {
        __APIROOT__: 'http://cgi.test',
        __DEV__: false
      },
      // 测试环境
      ssr: {
        __CDN__: '//' + __CDN__,    //CDN路径前缀（用于代码中的全局变量）    
        __APIROOT__: '//cgi.test',
        __DEV__: false,
        __SSR__: true,
        __VERSION__: package.version + '-ssr'
      },
      // 生产环境
      beta: {
        __CDN__: '//' + __CDN__,//CDN路径前缀（用于代码中的全局变量）    
        __APIROOT__: 'cgi.test',
        __SSR__: false,
        __DEV__: false,
        __SENTRY_VERSION__: 'production', // 这里理论上应该使用hash后的字符串，不过因为我们的js文件名本身已经加了hash，简单起见不做修改
        __VERSION__: package.version 
      },
      // 生产环境
      prod: {
        __CDN__: '//' + __CDN__,//CDN路径前缀（用于代码中的全局变量）    
        __APIROOT__: '//cgi.test',
        __SSR__: false,
        __DEV__: false,
        __SENTRY_VERSION__: 'production', // 这里理论上应该使用hash后的字符串，不过因为我们的js文件名本身已经加了hash，简单起见不做修改
        __VERSION__: package.version 
      }
    },
    // 定义外部依赖
    externals: [
      // {
      //   fetch: true
      // }
    ],
    // 用别名做重定向
    alias: {
      components: path.join(process.cwd(), 'src/components'),
      views: path.join(process.cwd(), 'src/views'),
      vue: path.join(process.cwd(), 'node_modules/vue/dist/vue.js'),
      vuex: path.join(process.cwd(), 'node_modules/vuex/dist/vuex.min.js'),
      'vue-router': path.join(process.cwd(), 'node_modules/vue-router/dist/vue-router.min.js'),
      'vue-resource': path.join(process.cwd(), 'node_modules/vue-resource/dist/vue-resource.common.js'),
      'vuex-router-sync': path.join(process.cwd(), 'node_modules/vuex-router-sync/index.js')
    },
    // js css文件头部文案
    banner: `
Project name - [description]

Authors: [name, ...]
Built: ${new Date().toLocaleString()} via fbi

Copyright @2019 [organization]`
  }
}

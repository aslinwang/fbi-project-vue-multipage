// module.exports = (require, ctx) => {
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlInlineWebpackPlugin = require('../plugins/html-inline-webpack-plugin')
const nodeModulesPath = ctx.nodeModulesPaths[1] || './node_modules'
const eslintConfig = require('./eslint.config')
const webpackOpts = ctx.options.webpack
const prod = ctx.isProd
const hash = webpackOpts.hash
const hot = !prod && webpackOpts.hot
const extractCss = !hot || prod
const cdn = webpackOpts.cdn || './'
const noop = function () { }

let hasFavicon = false
if (ctx.isProd) {
  hasFavicon = ctx.utils.fs.existSync(path.join(process.cwd(), 'src/favicon.ico'))
}

const ver = {
  hash: '[hash:6]',
  chunkhash: '[chunkhash:6]',
  contenthash: '[contenthash:6]'
}

// vue html 模板文件存放目录（即 vue-html-loader 使用的目录）
const vueHtmlPath = [
  path.join(process.cwd(), './src/components'),
  path.join(process.cwd(), './src/views')
]

// get entries
let entryNames = []

function entries() {
  let entries = {}
  const files = glob.sync(`src/pages/**/index.js`)
  files.map(item => {
    const name = item.match(/\/([^\/]*)\/index.js$/)[1] //path.basename(item, '.js')
    entryNames.push(name)
    entries[name] = []
    if (webpackOpts.es7) {
      entries[name] = entries[name].concat([nodeModulesPath + '/babel-polyfill'])
    }
    if (hot) {
      entries[name] = entries[name].concat([nodeModulesPath + '/webpack-hot-middleware/client?reload=true'])
    }
    entries[name] = entries[name].concat(['./' + item])
  })
  const commons = glob.sync(`src/pages/common/*.js`)
  if (commons.length) {
    entries['common'] = glob.sync(`src/pages/common/*.js`).map(item => './' + item)
    entryNames.push('common')
  }
  return entries
}

function templates(plugins) {
  const exts = webpackOpts.tmpl === 'handlebars' ? 'html|hbs|handlebars' : 'html'
  const files = glob.sync(`src/*.@(${exts})`)
  files.map(item => {
    const filename = path.basename(item)
    const chunkname = filename.replace(/.(html|hbs|handlebars)/, '') // path.basename(item, `.html`)
    let hasJs = false
    try {
      fs.accessSync('src/pages/' + chunkname + '/index.js')
      hasJs = true
    } catch (e) { }
    console.log(chunkname, hasJs, entryNames)
    const chunks = hasJs ? ['common', chunkname] : ['common']
    plugins.push(new HtmlWebpackPlugin({
      data: DataForDefinePlugin(),
      filename: chunkname + '.html',
      template: item,
      // cache: !webpackOpts.inline,
      cache: false,
      inject: !webpackOpts.inline,
      chunks: chunks,
      chunksSortMode: (a, b) => {
        let aIndex = chunks.indexOf(a.names[0]),
          bIndex = chunks.indexOf(b.names[0])
        return aIndex - bIndex
      },
      excludeChunks: [],
      minify: (webpackOpts.compress && prod) ? {
        minifyJS: true,
        minifyCSS: true,
        removeComments: true,
        collapseWhitespace: true,
        preserveLineBreaks: false,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true
      } : false,
      inline: webpackOpts.inline
    }))
  })

  if (webpackOpts.inline) {
    plugins.push(new HtmlInlineWebpackPlugin({
      env: prod ? 'production' : '',
      len: files.length
    }))
  }
}

function DataForDefinePlugin(parse) {
  const data = Object.assign({},
    webpackOpts.data.all || {},
    webpackOpts.data[ctx.env]
  )

  data.PRODUCTION = prod ? true : false
  if (parse) {
    const copy = JSON.parse(JSON.stringify(data))
    Object.keys(copy).map(item => {
      switch (typeof item) {
        case 'string':
          copy[item] = JSON.stringify(copy[item])
          break
      }
    })
    return copy
  } else {
    return data
  }
}

const postcss = [
  require('autoprefixer')({
    browsers: ['last 2 versions', 'iOS 7', 'Android >= 4.0']
  }),
  require('precss')
]

const config = {
  entry: entries(),
  output: {
    filename: hash ?
      (prod ? `js/[name]-${ver.chunkhash}.js` : `./js/[name].js?${ver.hash}`) : 'js/[name].js',
    path: prod ? ctx.utils.path.cwd(ctx.options.server.tempRoot) : '/',
    publicPath: prod ? webpackOpts.data.all.__CDN__ : ''
  },
  cache: true,
  externals: webpackOpts.externals,
  resolve: {
    modules: ctx.nodeModulesPaths,
    extensions: ['*', '.js', '.vue', '.css', '.json'],
    unsafeCache: true,
    alias: webpackOpts.alias
  },
  resolveLoader: {
    modules: ctx.nodeModulesPaths
  },
  devtool: !prod ? 'source-map' : false,
  module: {
    rules: [
    // {
    //   test: /\.js$/,
    //   enforce: 'pre', // enforce: 'pre', enforce: 'post',
    //   loader: 'eslint-loader',
    //   exclude: /node_modules/,
    //   query: eslintConfig
    // }, 
    {
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.html$/,
      loader: 'vue-html-loader',
      include: vueHtmlPath,
      exclude: [
        path.join(process.cwd(), './src/*.html') //src根目录下的html不使用该loader
      ]
    }, {
      test: /\.js$/,
      include: [
        path.join(process.cwd(), './src')
      ],
      exclude: function (path) {
        // 路径中含有 node_modules 或 lib 的就不去解析。
        const isNpmModule = !!path.match(/node_modules|lib/)
        return isNpmModule
      },
      use: [{
        loader: 'babel-loader',
        query: {
          presets: [
            'babel-preset-es2015',
            'babel-preset-stage-0'
          ],
          plugins: [
            'babel-plugin-transform-async-to-generator'
          ],
          cacheDirectory: true
        }
      }]
    },
    (webpackOpts.tmpl === 'handlebars') ? {
      test: /\.(html|hbs)$/i,
      exclude: vueHtmlPath,
      use: [{
        loader: 'handlebars-loader',
        options: {
          extensions: ['.hbs', '.html'],
          inlineRequires: '\/img\/',
          partialDirs: [path.join(process.cwd(), 'src/tmpl/partials')],
          helperDirs: [path.join(process.cwd(), 'src/tmpl/helpers')],
          debug: false
        }
      }]
    } : {
        test: /\.html$/,
        exclude: vueHtmlPath,
        use: [{
          loader: 'html-loader'
        }]
      }, {
      test: /\.css$/,
      // bug of ExtractTextPlugin, can't use 'use'
      loader: extractCss ?
        ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: 'css-loader!postcss-loader',
          publicPath: webpackOpts.inline ? (prod ? webpackOpts.data.all.__CDN__ : './') : '../'
        }) : 'style-loader!css-loader!postcss-loader'
    }, {
      test: /\.scss$/,
      // bug of ExtractTextPlugin, can't use 'use'
      loader: extractCss ?
        ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: 'css-loader!sass-loader',
          publicPath: webpackOpts.inline ? (prod ? webpackOpts.data.all.__CDN__ : './') : '../'
        }) : 'style-loader!css-loader!sass-loader'
      }, {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [
          path.join(process.cwd(), './src/icons')
        ],
        options: {
          symbolId: '[name]'
        }
      },{
      test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?v=\d+\.\d+\.\d+)?$/,
      exclude: [
        path.join(process.cwd(), './src/icons')
      ],
      use: [{
        loader: 'url-loader',
        options: {
          limit: '10000',
          name: 'img/' + ((hash && prod) ? `[name]-${ver.hash}.[ext]` : '[name].[ext]')
        }
      }]
    }
    ]
  },
  plugins: [
    // Webpack 2.1.0-beta23 之后的config里不能直接包含自定义配置项
    new webpack.LoaderOptionsPlugin({
      options: {
        babel: {
          babelrc: false,
          presets: [
            ['babel-preset-es2015', {
              modules: false
            }],
            'babel-preset-stage-1'
          ]
        },
        postcss,
        vue: {
          loaders: {
            css: ctx.isProd ?
              ExtractTextPlugin.extract({
                loader: 'css-loader',
                fallbackLoader: 'vue-style-loader',
                publicPath: webpackOpts.inline ? (prod ? webpackOpts.data.all.__CDN__ : './') : '../'
              }) : 'style-loader!css-loader!postcss-loader',
            scss: ['vue-style-loader', 'css-loader', 'sass-loader'].join('!')
          },
          postcss
        }
      }
    }),
    new webpack.DefinePlugin(DataForDefinePlugin(true)),
    prod ? new webpack.BannerPlugin(webpackOpts.banner) : noop,
    hot ? new webpack.HotModuleReplacementPlugin() : noop,
    prod ? noop : new webpack.NoErrorsPlugin(),
    extractCss ?
      new ExtractTextPlugin({
        filename: hash ?
          (prod ? `css/[name]-${ver.contenthash}.css` : `./css/[name].css?${ver.contenthash}`) : './css/[name].css',
        disable: false,
        allChunks: false
      }) :
      noop,
    webpackOpts.commons ?
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: hash ?
          (prod ? `js/[name]-${ver.chunkhash}.js` : `./js/[name].js?${ver.hash}`) : './js/[name].js',
        chunks: entryNames,
        minChunks: 3
      }) :
      noop,
    hasFavicon ? new CopyWebpackPlugin([{
      from: 'src/lib',
      to: 'lib'
    }, {
      from: 'src/favicon.ico'
    }]) :
      new CopyWebpackPlugin([{
        from: 'src/lib',
        to: 'lib'
      }]),
    (webpackOpts.compress && prod) ? new webpack.optimize.UglifyJsPlugin({ // js ugllify
      sourceMap: true,
      compress: {
        warnings: false
      }
    }) : noop
  ],
  performance: {
    hints: ctx.isProd ? "warning" : false
  },
}

templates(config.plugins)

module.exports = config

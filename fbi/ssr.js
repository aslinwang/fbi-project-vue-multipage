const webpack = require('webpack')
const rm = require('rimraf')
const http = require('http')
const Koa = require('koa')

// get env match config
ctx.isProd = true
require('./helpers/getEnv.js')(ctx, 'ssr')
const webpackConfig = require('./config/webpack.ssr.config.js')

// remove dst folder
rm.sync(ctx.options.server.ssrRoot)
ctx.logger.log(`${ctx.options.server.ssrRoot} was removed`)

// run webpack
webpack(webpackConfig, (err, stats) => {
  if (err) {
    ctx.logger.log(err, 0)
  }

  console.log(`
${stats.toString({
      chunks: false,
      colors: true
    })}
    `)
})



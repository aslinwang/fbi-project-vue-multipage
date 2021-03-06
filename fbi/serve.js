const http = require('http')
const Koa = require('koa')
const koaStatic = require('koa-static')
const convert = require('koa-convert')
const webpack = require('webpack')
const devMiddleware = require('koa-webpack-dev-middleware')
const hotMiddleware = require('koa-webpack-hot-middleware')
const bs = require('browser-sync').create()

const serveDst = ctx.taskParams && ctx.taskParams[0] === 'p' // fbi s -p

// get env match config
require('./helpers/getEnv.js')(ctx, serveDst ? '' : 'test')
const webpackConfig = require('./config/webpack.config.js')

const compile = webpack(webpackConfig)
let start = require('./helpers/getPort.js')(ctx, ctx.options.server.port)

// auto selected a valid port & start server
function autoPortServer(start, app, cb) {
  let port = start
  start += 1
  const server = http.createServer(app.callback())

  server.listen(port, err => {
    server.once('close', () => {
      server.listen(port, err => {
        if (err) {
          ctx.logger.log(err)
          return
        }
        cb(port)
      })
    })
    server.close()
  })

  server.on('error', err => {
    autoPortServer(start, app, cb)
  })
}

function server() {
  const app = new Koa()

  if (serveDst) {
    // static
    app.use(koaStatic(ctx.options.server.root))

    // listen
    autoPortServer(start, app, port => {
      ctx.logger.log(`Server Addr: ${ctx.utils.style.yellow('http://' + ctx.options.server.host + ':' + port)}`, 1)
      ctx.logger.log(`Serving '${ctx.options.server.root}'`)
    })
  } else {
    // dev
    const devMiddlewareInstance = devMiddleware(compile, {
      publicPath: webpackConfig.output.publicPath,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      stats: {
        colors: true,
        chunks: false,
        modules: false,
        children: false
      }
    })

    app.use(convert(devMiddlewareInstance))

    // static
    app.use(koaStatic('./src'))

    // hot
    if (ctx.options.webpack.hot) {
      app.use(convert(hotMiddleware(compile)))
    }

    // listen
    const bsPort = start
    start = start + 1
    autoPortServer(start, app, port => {
      bs.init({
        // logLevel: 'silent',
        open: false,
        ui: false,
        notify: false,
        proxy: `${ctx.options.server.host || 'localhost'}:${port}`,
        files: ['./src/*.html', './src/hbs/**'],
        port: bsPort
      }, () => { })
    })
  }
}

server()
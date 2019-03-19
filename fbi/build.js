const webpack = require('webpack')
const rm = require('rimraf')
const glob = require('glob')
const fs = require('fs-extra')

module.exports = function () {
  return new Promise(function (resolve, reject) {

    // get env match config
    ctx.isProd = true
    require('./helpers/getEnv.js')(ctx, 'prod')
    const webpackConfig = require('./config/webpack.config.js')

    // remove dst folder
    rm.sync(ctx.options.server.root)
    ctx.logger.log(`${ctx.options.server.root} was removed`)

    // run webpack
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        ctx.logger.log(err, 0)
      }

      console.log(`${stats.toString({ chunks: false, colors: true })}`)

      // 复制 html 到 html 目录
      glob('./dst/.temp/*.html', {}, function (err, files) {
        files.forEach((path) => {
          let toPath = path.replace('./dst/.temp/', './dst/html/')
          console.log(`copy ${path} -> ${toPath}`)
          fs.copySync(path, toPath)
        })
      })

      // 复制 map 到 map 目录，并删除原始文件防止打包到cdn
      glob('./dst/.temp/js/*.js.map', {}, function (err, files) {
        files.forEach((path) => {
          let toPath = path.replace('./dst/.temp/js', './dst/source-map/')
          console.log(`copy ${path} -> ${toPath}`)
          fs.copySync(path, toPath)
          console.log(`del ${path}  `)
          fs.unlinkSync(path)
        })
      })

      // 删除css map
      glob('./dst/.temp/css/*.map', {}, function (err, files) {
        files.forEach((path) => {
          console.log(`del ${path}  `)
          fs.unlinkSync(path)
        })
      })
      resolve()
    })
  })
}
/**
 * 根据命令行参数获取环境名称
 * 如：fbi b -prod
 * config里有定义prod的data
 *
 * @param {any} ctx
 * @param {any} def
 */
module.exports = ( def, dft) => {
  ctx.env = dft || 'dev'
  const envData = ctx.options.webpack.data
  const envDataItemArr = Object.keys(envData)
  const params = ctx.task.getParams()

  if (params) {
    for (var key in params) {
      for (var env in params[key]) {
        if (envDataItemArr.includes(env)) {
          ctx.env = env
        }
      }
    }
  }
  ctx.env && ctx.logger.log(`Environment: ${ctx.utils.style.yellow(ctx.env)}`)
}
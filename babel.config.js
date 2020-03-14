// 项目开发阶段的 babel 插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production'){
  prodPlugins.push('transform-remove-console')
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 移除 console 对应的函数调用
    // 发布产品时候的插件
    ...prodPlugins
  ]
}

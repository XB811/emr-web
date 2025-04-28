const getters = {
  sidebar: state => state.app.sidebar, // 取出app模块的sidebar属性
  device: state => state.app.device, // 取出app模块的device属性
  token: state => state.user.token, // 取出user模块的token属性
  avatar: state => state.user.avatar, // 取出user模块的avatar属性
  name: state => state.user.name // 取出user模块的name属性
}
// gatters便捷访问
export default getters

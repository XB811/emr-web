const getters = {
  sidebar: state => state.app.sidebar, // 取出app模块的sidebar属性
  device: state => state.app.device, // 取出app模块的device属性
  token: state => state.user.token, // 取出user模块的token属性
  realName: state => state.user.realName, // 取出user模块的realName属性
  userId: state => state.user.userId, // 取出user模块的userId属性
  userType: state => state.user.userType, // 取出user模块的userType属性
  username: state => state.user.username, // 取出user模块的username属性
  avatar: state => state.user.avatar, // 取出user模块的avatar属性
  routes: state => state.dynamicRouting.routes, // 取出permission模块的router属性
}
// gatters便捷访问
export default getters

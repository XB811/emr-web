// store/modules/permission.js

import { constantRoutes, roleRoutes } from '@/router'
import router from '@/router'

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    // 保存动态路由到vuex中
    state.addRoutes = routes
    // 将动态路由和静态路由合并
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, role) {
    return new Promise(resolve => {
      // 根据角色获取对应路由
      const accessedRoutes = roleRoutes[role] || []

      // 添加404页面在最后
      accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })

      // 保存路由
      commit('SET_ROUTES', accessedRoutes)

      // 动态添加路由
      router.addRoutes(accessedRoutes)
      //this.$router.addRoutes(accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

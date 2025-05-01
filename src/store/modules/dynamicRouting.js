// store/modules/dynamicRouting.js

import { constantRoutes, roleRoutes } from '@/router'
import router from '@/router'
import store from "@/store";
import _ from 'lodash'
const getDefaultState = () => {
  return {
    routes: [],
    addRoutes: []
  }
}

const state = getDefaultState()

const mutations = {
  // 重置路由
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_ROUTES: (state, routes) => {
    // 保存动态路由到vuex中
    state.addRoutes = routes
    // 将动态路由和静态路由合并
    // 深拷贝隔离数据
    state.routes = _.cloneDeep(constantRoutes).concat(routes)
  },
  UPDATE_ROUTE: (state, routes) => {
    // 更新路由
    state.routes =routes
  }

}

const actions = {
  // 重置路由
  resetRoutes({ commit }) {
    commit('RESET_STATE')
  },
  generateRoutes({ commit }, role) {
    return new Promise(resolve => {
      // 根据角色获取对应路由
      // 做深拷贝隔离数据
      const accessedRoutes =_.cloneDeep(roleRoutes[role] || [])
      //console.log(accessedRoutes[0])
      //console.log(accessedRoutes[1])
      // 添加404页面在最后
      accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })

      // 保存动态路由路由
      commit('SET_ROUTES', accessedRoutes)
      //更新路由中需要更改的数据
      store.dispatch('dynamicRouting/updateRoutes',store.getters.routes).then(routers => {
        // 更新路由
        commit('UPDATE_ROUTE', routers)
      })
      // 动态添加路由
      router.addRoutes(accessedRoutes)
      //this.$router.addRoutes(accessedRoutes)
      resolve(accessedRoutes)
    })
  },
  // 根据配置需求更改路由
  updateRoutes({ commit }, routers) {
    routers = store.dispatch('dynamicRouting/adminUserRoutes',routers)
    return routers
  },

  // admin用户 user相关路由
  adminUserRoutes({ commit }, routers) {
    //admin 中 只有root用户可以查看 /user/admin
    if(store.getters.userType === 'admin' ) {
      // 如果是 admin用户
      if(store.getters.username === 'root'){
        // 重定向/user到/user/admin
        routers.forEach((item) => {
          if(item.path === '/user') {
            item.redirect = '/user/admin'
          }
        })
      }else{
        //如果部署admin用户，删除 /user/admin
        routers.forEach((item) => {
          if(item.path === '/user') {
            item.children = item.children.filter(child => child.path !== 'admin')
          }
        })
      }
    }
    return routers
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

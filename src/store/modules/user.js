import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import store from '@/store'

const getDefaultState = () => {
  return {
    token: getToken(),
    realName: '',
    userId: '',
    userType: '',
    username: '',
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_REAL_NAME: (state, realName) => {
    state.realName = realName
  },
  SET_USER_ID: (state, userId) => {
    state.userId = userId
  },
  SET_USER_TYPE: (state, userType) => {
    state.userType = userType
  },
  SET_USER_NAME: (state, username) => {
    state.username = username
  },
  SET_AVATAR: (state, avatar) => {
    // 如果avatar为空,使用默认头像
    state.avatar = avatar
  }
}

const actions = {
  // 用户登录
  login({ commit }, userInfo) {
    const { usernameOrPhone, password, userType } = userInfo
    return new Promise((resolve, reject) => {
      // 调用 src/api/user.js 中的 login 方法, 请求后端接口
      login({ usernameOrPhone: usernameOrPhone.trim(), password: password, userType }).then(response => {
        // 将后端响应写入data变量中
        const { data } = response
        // console.log('data', data)
        // 调用set方法将data存入vuex中
        commit('SET_TOKEN', data.accessToken)
        commit('SET_USER_TYPE', userInfo.userType)

        // 将参数全部存入vuex中
        commit
        // 调用 src/utils/auth.js中的setToken方法将data存入cookie中
        setToken(data.accessToken)
        // 调用 Promise 的 resolve 方法，通知调用方登录成功。
        resolve()
      }).catch(error => {
        // 如果登录失败，调用 Promise 的 reject 方法，通知调用方登录失败。
        reject(error)
      })
    })
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      // 调用api
      getInfo(state.token).then(response => {
        const { data } = response
        // 如果没有数据，调用 Promise 的 reject 方法，通知调用方登录失败。
        if (!data) {
          return reject('验证失败，请重新登录.')
        }
        // 提取数据
        const { realName, userId, userType, username, avatar } = data
        // 提取数据并存入vuex中
        commit('SET_REAL_NAME', realName)
        commit('SET_USER_ID', userId)
        commit('SET_USER_TYPE', userType)
        commit('SET_USER_NAME', username)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 用户退出
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      // 调用api
      // console.log('state.token', state.token)
      logout(state.token, store.getters.userType).then(() => {
        // 删除token
        removeToken() // must remove  token  first
        // 重置路由
        resetRouter()
        // 重置vuex中的数据
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 移出token
  resetToken({ commit }) {
    return new Promise(resolve => {
      // 删除cookie中的数据
      removeToken() // must remove  token  first
      // 重置vuex中的数据
      commit('RESET_STATE')
      resolve()
    })
  }
}

// 定义上边的三个部分
export default {
  // 启用了命名空间，
  // 使该模块的 state、mutations 和 actions
  // 在全局 Vuex 中具有独立的作用域。
  // 避免不同模块之间的命名冲突。
  // 调用时需要加上模块名
  // 如 store.dispatch('user/login')
  namespaced: true,
  // 定义模块的状态 token、name 和 avatar
  state,
  // 定义了state的重置方法，state下三个变量的set方法
  mutations,
  // 定义了login、getInfo、logout、resetToken四个方法
  actions
}


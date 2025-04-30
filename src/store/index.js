import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import permission from './modules/permission'

Vue.use(Vuex)

const store = new Vuex.Store({
  // 模块
  modules: {
    app,
    settings,
    user,
    permission
  },
  // Vuex的计算属性
  // 导入 src/store/getters.js
  // getters是一个对象，里面存放了所有的计算属性
  // 可以通 gatters.属性名 访问计算属性
  getters
})

export default store

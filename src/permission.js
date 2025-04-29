import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

// 白名单
const whiteList = ['/login'] // no redirect whitelist

// 路由前置守卫
router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  // 如果存在token
  if (hasToken) {
    // 如果要访问的路径是登录页
    if (to.path === '/login') {
      // 重定向到首页
      next({ path: '/' })
      NProgress.done()
    } else {
      // 如果不是访问登录页
      const hasGetUserInfo = store.getters.realName
      if (hasGetUserInfo) {
        next()
      } else {
        // 如果缺少信息，尝试获取用户信息
        try {
          // get user info
          await store.dispatch('user/getInfo')

          next()
        } catch (error) {
          // remove token and go to login page to re-login
          // 如果根据token获取用户信息失败，移出token
          await store.dispatch('user/resetToken')
          // 打印错误信息
          Message.error(error || 'Has Error')
          // 重定向到登录页，并携带当前路由的path参数
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/
    // 如果没有token
    // 在免登录白名单，直接进入
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      // 重定向到登录页，并携带当前路由的path参数
      // 在登录成功后，会自动跳转到要登陆的页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

// 路由后置守卫
router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

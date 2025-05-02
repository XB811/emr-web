import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import {checkLogin} from "@/api/user";

// create an axios instance
// 创建一个axios实例
const service = axios.create({
  // 设置请求的基础URL
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  // 设置请求的超时时间
  timeout: 50000 // request timeout
})

// request interceptor
// 请求前置处理器
service.interceptors.request.use(
  config => {
    // do something before request is sent

    // 如果 token存在，则每个请求都携带 token
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      // 设置请求头，携带token
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  // 请求错误处理器
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
// 响应后置处理器
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    // debugger
    const res = response.data
    // console.log("response")
    // console.log(response)
    // if the custom code is not 20000, it is judged as an error.
    // 如果自定义的code不是0，则判断为错误 进行异常处理
    if (res.code !== '0') {
      //如果是登出请求
      if (response.config.url && response.config.url.includes('/logout/')) {
        //如果状态码是token异常相关
        if(res.code === 'A100001'||res.code === 'A100002'||res.code ==='A100003'){
          // 如果是登出请求，直接返回
          return res
        }
      }
      // 使用返回的错误信息进行提示
      // Message({
      //   message: res.message || 'Error',
      //   type: 'error',
      //   duration: 5 * 1000
      // })
      // console.log('res.code1', res.code)
      // 这段是 非法tooken/其他客户端登录/Token过期的处理
      // 暂时不考虑改写，根据后面需求模仿这个再写
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 'A100001' || res.code === 'A100002' || res.code === 'A100003') {
        // to re-login
        MessageBox.confirm('您已被登出，您可以取消以留在此页面，或者重新登录', '确认登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      // console.log('A100001')
      // 其他错误，直接抛出错误
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  // 如果响应错误，则进行异常处理
  error => {

    // 如果是403错误
    if(error.response && error.response.status === 403) {
      //如果有token
      if(store.getters.token) {
        // 如果有token，且为403错误，则
        // 检测是否登录
        checkLogin(store.getters.token,store.getters.userType).then(response => {
          //如果token有效
          if(response.data===true){
            //如果登录了,提示没有权限
            Message({
              message: '没有权限',
              type: 'error',
              duration: 5 * 1000
            })
          }else {
            //如果token 无效，提示登录超时 退出登录
            MessageBox.confirm('登录超时，请重新登录', '确认登出', {
              confirmButtonText: '重新登录',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              store.dispatch('user/logout').then(() => {
                location.reload()
              })
            })
          }
        })
      }else{
        // 如果没有token，提示登录超时 退出登录
        MessageBox.confirm('登录超时，请重新登录', '确认登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/logout').then(() => {
            location.reload()
          })
        })
      }
    }else{
      console.log('err' + error) // for debug
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service

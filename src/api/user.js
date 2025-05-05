import request from '@/utils/request'

const servicesName = '/user-services'

// 用户登录
export function login(data) {
  return request({
    url:`${servicesName}/v1/login/${data.userType}`,
    method: 'post',
    data
  })
}
// 使用token获取用户信息
export function getInfo(token) {
  return request({
    url: `${servicesName}/v1/getUserInfoByToken`,
    method: 'get',
    params: { token }
  })
}
// 退出登录
export function logout(accessToken, userType) {
  return request({
    // url: '/vue-admin-template/user/logout',
    url: `${servicesName}/v1/logout/${userType}`,
    params: { accessToken },
    method: 'post'
  })
}
// 更新密码
export function updatePassword(data, userType) {
  return request({
    url:`${servicesName}/v1/updatePassword/${userType}`,
    method: 'put',
    data
  })
}

// 通过 Token 检查用户是否登录
export function checkLogin(accessToken,userType){
  return request({
    url:`${servicesName}/v1/check-login/${userType}`,
    method: 'get',
    params: { accessToken}
  })
}

//使用userId获取用户信息
export function queryByUserId(id,userType){
  return request({
    url: `${servicesName}/v1/query/${userType}/${id}`,
    method: 'get'
  })
}
//根据用户id和用户类型查询用户无脱敏信息
export function queryActualByUserId(id,userType){
  return request({
    url: `${servicesName}/v1/actualQuery/${userType}/${id}`,
    method: 'get'
  })
}

//检查用户名是否已存在
export function hasUsername(username,userType){
  return request({
    url: `${servicesName}/v1/has-username/${userType}/${username}`,
    method: 'get'
  })
}

//用户注册
export  function register(data,userType){
  return request({
    url: `${servicesName}/v1/register/${userType}`,
    method: 'post',
    data
  })
}

//根据id修改用户
export function updateById(data,userType){
  return request({
    url : `${servicesName}/v1/update/${userType}`,
    method: 'put',
    data
  })
}

//注销用户
export function deletion(username,userType){
  return request({
    url: `${servicesName}/v1/deletion/${userType}`,
    method: 'delete',
    params: { username }
  })
}
// 分页查询
export function pageQuery(data,current,size,userType) {
  return request({
    url: `${servicesName}/v1/pageQuery/${userType}`,
    method: 'get',
    params: {
      ...data,
      current,
      size
    }
  })
}
  export function queryAll(userType) {
  return request({
    url: `${servicesName}/v1/queryAll/${userType}`,
    method: 'get'
  })
}

export function getVerifyCode(phone,userType) {
  return request({
    url: `${servicesName}/v1/getVerifyCode/${userType}`,
    method: 'get',
    params: { phone }
  })
}

export function resetPassword(data,userType) {
  return request({
    url: `${servicesName}/v1/resetPassword/${userType}`,
    method: 'put',
    data
  })
}

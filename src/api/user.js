import request from '@/utils/request'

const servicesName = '/user-services'

// 用户登录
export function login(data) {
  return request({
    url: servicesName + '/v1/login/' + data.userType,
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: servicesName + '/v1/getUserInfoByToken',
    method: 'get',
    params: { token }
  })
}

export function logout(accessToken, userType) {
  return request({
    // url: '/vue-admin-template/user/logout',
    url: servicesName + '/v1/logout/' + userType,
    params: { accessToken },
    method: 'post'
  })
}

export function updatePassword(data, userType) {
  return request({
    url: servicesName + '/v1/updatePassword'+ '/' + userType,
    method: 'put',
    data
  })
}

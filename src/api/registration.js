import request from "@/utils/request";
import qs from 'qs'
const servicesName = '/registration-services'
// 创建挂号
export function createRegistration(data) {
  return request({
    url: `${servicesName}/v1/create`,
    method: 'post',
    data
  })
}

//删除挂号
export function dleteRegistration(id) {
  return request({
    url: `${servicesName}/v1/delete/${id}`,
    method: 'delete'
  })
}

//更新挂号
export function updateRegistration(data) {
  return request({
    url: `${servicesName}/v1/update`,
    method: 'put',
    data
  })
}

// 根据id查询挂号
export function getRegistration(id) {
  return request({
    url: `${servicesName}/v1/queryById/${id}`,
    method: 'get'
  })
}

// 完成挂号
export function finishRegistration(id) {
  return request({
    url: `${servicesName}/v1/finish/${id}`,
    method: 'put'
  })
}
// 分页查询
export function pageQuery(data,current,size) {
  return request({
    url: `${servicesName}/v1/pageQuery`,
    method: 'get',
    params: {
      ...data,
      current,
      size
    },
    paramsSerializer: params =>{
      return qs.stringify(params, {
        arrayFormat: 'comma' })
    }
  })
}

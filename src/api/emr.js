import request from '@/utils/request'

const servicesName = '/emr-services'

// 创建病历
export function createEmr(data) {
  return request({
    url: `${servicesName}/v1/create`,
    method: 'post',
    data
  })
}

//删除病历
export function deleteEmr(id){
  return request({
    url: `${servicesName}/v1/delete/${id}`,
    method: 'delete'
  })
}

//更新病历
export function updateEmr(data){
  return request({
    url: `${servicesName}/v1/update`,
    method: 'put',
    data
  })
}

//根据id查询病历
export function queryById(id){
  return request({
    url: `${servicesName}/v1/queryById/${id}`,
    method: 'get'
  })
}

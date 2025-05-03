import request from '@/utils/request'
const servicesName = '/notice-services'

// 创建公告
export function createNotice(data) {
  return request({
    url: `${servicesName}/v1/create`,
    method: 'post',
    data
  })
}

// 删除公告
export function deleteNotice(id) {
  return request({
    url: `${servicesName}/v1/delete/${id}`,
    method: 'delete'
  })
}

// 更新公告
export function updateNotice(data) {
  return request({
    url: `${servicesName}/v1/update`,
    method: 'put',
    data
  })
}

// 查询公告
export function queryById(id) {
  return request({
    url: `${servicesName}/v1/queryById/${id}`,
    method: 'get'
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
    }
  })
}

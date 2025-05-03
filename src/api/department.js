import request from '@/utils/request'

const servicesName = '/department-services'

//新增科室
export function createDepartment(data) {
  return request({
    url: `${servicesName}/v1/create`,
    method: 'post',
    data
  })
}

//删除科室
export function deleteDepartment(id) {
  return request({
    url: `${servicesName}/v1/delete/${id}`,
    method: 'delete'
  })
}

//更新科室
export function updateDepartment(data) {
  return request({
    url: `${servicesName}/v1/update`,
    method: 'put',
    data
  })
}

//根据id查询科室
export function queryDepartmentById(id) {
  return request({
    url: `${servicesName}/v1/queryById/${id}`,
    method: 'get'
  })
}

//查询所有科室
export function queryAllDepartments() {
  return request({
    url: `${servicesName}/v1/queryAll`,
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

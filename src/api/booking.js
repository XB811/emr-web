import request from '@/utils/request'

const servicesName = '/booking-services'
// 创建渔业时间
export function createBooking(data) {
  return request({
    url: `${servicesName}/v1/create`,
    method: 'post',
    data
  })
}

//根据id删除预约时间
export function deleteBooking(id) {
  return request({
    url: `${servicesName}/v1/delete/${id}`,
    method: 'delete'
  })
}

// 更新预约时间
export function updateBooking(data) {
  return request({
    url: `${servicesName}/v1/update`,
    method: 'put',
    data
  })
}

//根据id查询预约时间表
export function queryById(id) {
  return request({
    url: `${servicesName}/v1/queryById/${id}`,
    method: 'get'
  })
}

// 根据医生id查询时间表
export function queryByDoctorId(doctorId) {
  return request({
    url: `${servicesName}/v1/queryByDoctorId/${doctorId}`,
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

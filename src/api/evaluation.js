import request from '@/utils/request'

const servicesName = '/evaluation-services'

// 新增评价
export function ceateEvaluation(data) {
  return request({
    url: `${servicesName}/v1/create`,
    method: 'post',
    data
  })
}

//删除评价
export function deleteEvaluation(id) {
  return request({
    url: `${servicesName}/v1/delete/${id}`,
    method: 'delete'
  })
}

//根据id查询评价
export function queryEvaluationById(id) {
  return request({
    url: `${servicesName}/v1/queryById/${id}`,
    method: 'get'
  })
}

// 根据病历id查询评价
export function queryEvaluationByEmrId(emrId) {
  return request({
    url: `${servicesName}/v1/queryByEmrId/${emrId}`,
    method: 'get'
  })
}

//更新病历
export function updateEvaluation(data){
  return request({
    url: `${servicesName}/v1/update`,
    method: 'put',
    data
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
//根据id查询emr是否被评价
export function hasEvaluation(emrId) {
  return request({
    url: `${servicesName}/v1/hasEvaluation/${emrId}`,
    method: 'get'
  })
}

export function getAverageRating(doctorId){
  return request({
    url: `${servicesName}/v1/getAverageRating/${doctorId}`,
    method: 'get'
  })
}

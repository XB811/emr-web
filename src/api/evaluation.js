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
    url: `${servicesName}/v1/query/${id}`,
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

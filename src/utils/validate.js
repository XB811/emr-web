/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  // return valid_map.indexOf(str.trim()) >= 0
  // 校验规则为 用户名只能包含字母、数字和下划线，长度在1到20之间
  if(str === null || str === undefined){
    return false
  }
  return str.length > 0 && str.length < 20 && /^[a-zA-Z0-9_]+$/.test(str)
}
/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validRealName(str){
  return /^[\u4e00-\u9fa5]{2,4}$/.test(str)
}
/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validPhone(str) {
  // 校验规则为 手机号码必须是11位数字，且以1开头
  return /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
    .test(str);
}

export function validIdCard(str){
  return  /^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
    .test(str);
}

export function validPassword(str){
  return /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^\da-zA-Z\s]).{6,16}$/.test(str);
}

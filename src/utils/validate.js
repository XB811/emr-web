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
  return str.length > 0 && str.length < 20 && /^[a-zA-Z0-9_]+$/.test(str)
}

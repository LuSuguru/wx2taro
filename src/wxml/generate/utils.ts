/*
 * @Author: 芦杰
 * @Date: 2022-05-27 18:04:44
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-27 18:07:12
 * @Description:工具
 */

// xx-yy-zz -> XxYyZz
export function titleCase(str: string) {
  return `${str.slice(0, 1).toUpperCase()}${str.replace(/\-(\w)/g, (_, letter) => letter.toUpperCase()).slice(1)}`
}

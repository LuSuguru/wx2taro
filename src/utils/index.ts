/*
 * @Author: 芦杰
 * @Date: 2022-06-07 18:23:05
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-07 18:24:38
 * @Description: 工具函数
 */

/**
 * UUID生成器
 * @param len 长度 number
 * @param radix 随机数基数 number
 */
export function uuid(len = 4, radix = 62) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const uuid = []
  let i = 0

  if (len) {
    for (i = 0; i < len; i++) {
      uuid[i] = chars[Math.floor(Math.random() * radix)]
    }
  } else {
    let r = 0

    uuid[8] = '-'
    uuid[13] = '-'
    uuid[18] = '-'
    uuid[23] = '-'
    uuid[14] = '4'

    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = Math.floor(Math.random() * 16)
        uuid[i] = chars[(i === 19) ? ((r % 4) % 8) + 8 : r]
      }
    }
  }
  return uuid.join('')
}

export function generateScopeName(name: string) {
  return `${name}-${uuid()}`
}

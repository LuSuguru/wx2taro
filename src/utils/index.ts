/*
 * @Author: 芦杰
 * @Date: 2022-06-07 18:23:05
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-30 13:55:28
 * @Description: 工具函数
 */

import { Imports, Identifier } from '../config'

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

// xx-yy-zz -> XxYyZz
export function titleCase(str: string) {
  return `${str.slice(0, 1).toUpperCase()}${str.replace(/\-(\w)/g, (_, letter) => letter.toUpperCase()).slice(1)}`
}

/**
 *
 * @param config imports 集合
 * @param importPath 要插入的importPath
 * @param importName 要插入的importName
 */
export function addImportConfig(imports: Imports, importPath: string, importName: Identifier) {
  // importPath -> set<importName> importName 需要去重，避免重复引入
  if (imports.get(importPath)) {
    imports.get(importPath).add(importName)
  } else {
    imports.set(importPath, new Set([importName]))
  }
}

// 递归转化对象，如 {a:1,b:{c:2}} => '{a:1,b:{c:2}}'
// antdList 会变化
export function obj2Str(target) {
  if ((typeof target === 'object' || typeof target === 'function') && target !== null) {
    if (Array.isArray(target)) {
      const content = target.reduce((pre, item) => {
        const str = obj2Str(item)
        return str ? [...pre, str] : pre
      }, [])

      return `[${content.join(',')}]`
    }

    let content = ''

    Object.keys(target).forEach(key => {
      const value = target[key]

      const str = obj2Str(value)

      // 如果key已数字开头，需要增加双引号，对象Key不能以数字开头
      key = /^\d/.test(key) ? `"${key}"` : key
      const current = `${key}:${str},\n`

      content += current
    })

    if (!content) return '{}'
    return `{${content}}`
  }

  // 数字
  if (typeof target === 'number') {
    return target
  }

  // boolean
  if (typeof target === 'boolean') {
    return target
  }

  if (typeof target === 'string') {
    // boolean字符串
    if (/true|false/.test(target)) {
      return Boolean(target)
    }

    // 本身是个字符串
    if (/^\s+\"\S+\"\s+$/.test(target)) {
      return target
    }

    return `\"${target}\"`
  }

  return target
}

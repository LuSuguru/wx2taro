/*
 * @Author: 芦杰
 * @Date: 2022-06-01 17:28:11
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-06 17:59:21
 * @Description: babel 操作方法
 */

import generate from '@babel/generator'
import { parse } from '@babel/parser'
import t from '@babel/types'
import prettier from 'prettier'
import fse from 'fs-extra'

// 通过 prettier 格式化代码
export function formatCode(js: string) {
  return prettier.format(js, {
    singleQuote: true,
    trailingComma: 'es5',
    tabWidth: 4,
    parser: 'babel-ts'
  })
}

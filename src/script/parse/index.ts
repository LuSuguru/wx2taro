/*
 * @Author: 芦杰
 * @Date: 2022-06-08 15:32:53
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-08 16:15:29
 * @Description: 解析源代码
 */

import traverse from '@babel/traverse'
import t from '@babel/types'

import { typeWhileList } from '../config'

export default function parse(ast: t.File) {
  traverse(ast, {
    CallExpression: ({ node }) => {
      if (!typeWhileList.includes((node.callee as t.Identifier).name)) {
        return
      }

      (node.arguments as t.ObjectExpression[]).forEach(node => {
        console.log(node)
      })
    }
  })
}

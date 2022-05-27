/*
 * @Author: 芦杰
 * @Date: 2022-05-27 15:05:06
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-27 19:09:59
 * @Description: 生成代码
 */

import { ASTNode, Type } from '../type'
import { titleCase } from './utils'

let clock = 0

export default function generate(nodes: ASTNode[]) {
  const state = {
    methods: [],
    blocks: {},
  }

  for (let i = 0; i < nodes.length; i++) {
    const current = nodes[i]
    const next = nodes[i + 1]
    const block = generateNode(current, next, state)

    if (block) {
      state.blocks[clock++] = block
    }
  }
}

function generateNode(node: ASTNode, state, next?: ASTNode) {
  if (node.type === Type.Text) {
    return compileExpression(node.content, 'text')
  }

  if (node.type === Type.Comment) {
    return ''
  }

  // 标签类型节点
  switch (node.tagName) {
    // 编译 template
    // 参考 https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/template.html
    case 'template': {
      const { is, name } = node.attributes
      if (is) {
        return `$template$${is}$`
      }

      state.blocks[name] = node.children.map(item => generateNode(item, state)).join('\n')
      return null
    }
    // 编译 slot
    case 'slot': {
      const { name } = node.attributes
      if (name) {
        return `$slot$${name}$`
      }
    }
    default: {
      let code = `<${titleCase(node.tagName)} `
      code += generateProps(node, state)

      if (node.children) {
        code += node.children.map((item, index) => generateNode(item, state, node.children[index + 1])).join('\n')
      }
    }
  }
}

/**
 * 处理各种表达式字符串
 * @param expression 表达式
 * @param type 类型
 */
function compileExpression(expression: string, type: 'text') {
  switch (type) {
    case 'text':
      return expression.replace('{{', '{').replace('}}', '}')

    default:
      break
  }
}

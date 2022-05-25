/*
 * @Author: 芦杰
 * @Date: 2022-05-25 18:21:51
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-25 18:40:50
 * @Description: 对语法分析后的语法树进行格式化，
 */

import { Node, Type, ASTNode } from './type'

// TODO：修改成 wxml 的解析
function unquote(str: string) {
  const car = str.charAt(0)
  const end = str.length - 1
  const isQuoteStart = car === '"' || car === '\''
  if (isQuoteStart && car === str.charAt(end)) {
    return str.slice(1, end)
  }
  return str
}

function formatAttributes(attributes: string[]) {
  return attributes.map(attribute => {
    const parts = attribute.trim().split('=')

    const key = parts[0]
    const value = typeof parts[1] === 'string' ? unquote(parts[1]) : null

    return { key, value }
  })
}

export default function format(nodes: Node[]) {
  return nodes.map((node) => {
    const returnNode: ASTNode = node.type === Type.Element ? {
      type: node.type,
      tagName: node.tagName.toLowerCase(),
      attributes: formatAttributes(node.attributes),
      children: format(node.children),
      position: node.position
    } : {
      type: node.type,
      content: node.content,
      position: node.position
    }

    return returnNode
  })
}

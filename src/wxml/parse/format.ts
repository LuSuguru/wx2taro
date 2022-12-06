/*
 * @Author: 芦杰
 * @Date: 2022-05-25 18:21:51
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-14 15:11:05
 * @Description: 对语法分析后的语法树进行格式化，
 */

import { Node, Type, ASTNode } from '../type'

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
  return attributes.reduce((pre, attribute) => {
    const parts = attribute.trim().match(/^([^=]+)=(.+)$/)

    let key = ''
    let value: string | boolean = ''
    if (parts?.length === 3) {
      key = parts[1]
      value = typeof parts[2] === 'string' ? unquote(parts[2]) : null
    } else {
      // boolean 型的属性
      key = attribute
      value = true
    }

    return {
      ...pre,
      [key]: value
    }
  }, {})
}

export default function format(nodes: Node[]) {
  return nodes.map((node) => {
    const returnNode: ASTNode = node.type === Type.Element ? {
      type: node.type,
      tagName: node.tagName,
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

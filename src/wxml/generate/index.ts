/*
 * @Author: 芦杰
 * @Date: 2022-05-27 15:05:06
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-18 15:27:50
 * @Description: 生成代码
 */

import { ASTNode, Type } from '../type'
import { Imports, eventMap } from '../../config'
import { titleCase, addImportConfig } from '../../utils'
import { propsMap, componentPathMap, wxTagMap } from './config'

interface State {
  methods: string[]
  imports: Imports
  blocks: {
    [key: string]: string
  }
}

let clock = 0
// 组件路径缓存
const componentPathCache = new Set()

export default function generate(nodes: ASTNode[], imports: Imports) {
  const state: State = {
    imports,
    methods: [],
    blocks: {},
  }

  for (let i = 0; i < nodes.length; i++) {
    const current = nodes[i]
    const next = nodes[i + 1]
    const block = generateNode(current, state, next)

    if (block) {
      state.blocks[clock++] = block as string
    }
  }
  componentPathCache.clear()
  return state
}

function generateNode(node: ASTNode, state: State, next?: ASTNode) {
  if (node.type === Type.Text) {
    return compileExpression(node.content, Type.Text)
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
        return `{props.${name}}`
      }
    }
      return '{props.children}'
    // 编译 import
    case 'import': {
      return ''
    }
    // 编译 wxs
    case 'wxs': {
      // TODO: 处理 wxs
      // const { src, module } = node.attributes
      // if (src) {
      //   addImportConfig(state.imports, src, { type: 'global', name: module })
      // }
      return ''
    }
    default: {
      const tagName = wxTagMap.get(node.tagName) || titleCase(node.tagName)

      let code = `<${tagName} `
      code += generateProps(node, state)

      if (node.children.length) {
        let childrenCode = ''
        node.children.forEach((item, index) => {
          const childCode = generateNode(item, state, node.children[index + 1])
          if (item?.attributes?.slot) {
            code += `${item.attributes.slot}={<>${childCode}</>}`
          } else {
            childrenCode += `${childCode}\n`
          }
        })

        if (childrenCode) {
          code += '>'
          code += childrenCode
          code += `</${tagName}>`
        } else {
          code += '/>'
        }
      } else {
        code += ' />'
      }

      // 处理组件引用
      if (!componentPathCache.has(tagName)) {
        for (const [path, components] of componentPathMap) {
          if (components.includes(tagName)) {
            addImportConfig(state.imports, path, tagName)

            componentPathCache.add(tagName)
            break
          }
        }
      }

      if (node.directives) {
        code = generateDirect(node, code, next)
      }

      return code
    }
  }
}

/**
 * 解析 wxml 的微信指令 wx:for, wx:if 等等
 * @param node 当前 节点
 * @param code 当前 code
 * @param next 下一个 节点
 * @returns 返回 code
 */
let ifCode = ''

function generateDirect(node: ASTNode, code: string, next: ASTNode) {
  for (let i = 0; i < node.directives.length; i++) {
    const [name, value] = node.directives[i]
    const compiled = compileExpression(value, 'direct')

    if (code[0] === '{') {
      code = `<>${code}</>`
    }

    switch (name) {
      case 'wx:for':
        const { item, index } = findForItem(node)
        code = `{(${compiled}).map((${item},${index}) => (${code}))}`
        break
      case 'wx:if':
      case 'wx:elseif':
      case 'wx:elif': {
        ifCode += `{${compiled}?${code}:`

        // 下一个兄弟节点 是 else 节点
        if (Object.keys(next || {}).some(name => name.includes('else'))) {
          continue
        } else {
          code = `${ifCode}null}`
          ifCode = ''
        }
        break
      }
      case 'wx:else': {
        if (ifCode === '') {
          ifCode = `{!${compiled}?${code}:null}`
        } else {
          ifCode += `${code}}`
        }
        code = ifCode
        ifCode = ''
        break
      }
    }
  }
  return code
}

/**
 * 解析 for 循环中的 item 和 index 指令，返回指令内容
 * @param node 节点
 * @returns item,index
 */
function findForItem({ directives }: ASTNode) {
  let item = ''
  let index = ''

  for (let i = 0; i < directives.length; i++) {
    const [name, value] = directives[i]
    if (name === 'wx:for-item') {
      item = value as string
    }
    if (name === 'wx:for-index') {
      index = value as string
    }
  }
  return {
    item: item || 'item',
    index: index || 'index'
  }
}

/**
 * 根据节点的 attributes 生成 props 代码
 * @param node 当前 node 节点
 * @param state 全局状态
 * @returns props code
 */
function generateProps(node: ASTNode, state: State) {
  let code = ''
  Object.entries(node.attributes).forEach(([name, value]) => {
    if (name.startsWith('wx:')) {
      if (node.directives) {
        node.directives.push([name, value])
      } else {
        node.directives = [[name, value]]
      }
    } else if (name.startsWith('bind') || name.startsWith('catch')) {
      if (!state.methods.includes(value)) {
        state.methods.push(value)
      }

      const [eventKey] = wriedName(name)
      code += `${eventKey}={${value}} `
    } else if (node.tagName === 'import') {
      state.imports.set(value, new Set())
    } else if (name !== 'slot') {
      // 处理 boolen 类型属性
      if (typeof value === 'boolean') {
        code += `${propsMap.get(name) || name} `
      } else {
        const compiled = compileExpression(value, node.type)
        code += `${propsMap.get(name) || name}=${compiled || true} `
      }
    }
  })

  return code
}

/**
 * 转换事件名
 * @param key 事件值
 * @returns [转换后的事件名，源事件名]
 */
function wriedName(key: string) {
  key = key.replace(/(bind|catch)\:?/g, '')

  return key in eventMap
    ? [eventMap[key], key]
    : ['on' + key[0].toUpperCase() + key.substring(1), key]
}

/**
 * 处理各种表达式字符串
 * @param expression 表达式
 * @param type 类型
 */
function compileExpression(expression: string | boolean, type: Type | 'direct') {
  if (typeof expression === 'boolean') {
    return expression
  }
  switch (type) {
    case 'direct':
      return expression.replace(/{{/g, '').replace(/}}/g, '')
    case Type.Text:
      return expression.replace(/{{/g, '{').replace(/}}/g, '}')
    case Type.Element: {
      // 匹配 xxx={{aaa}}
      if (expression.startsWith('{{') && expression.endsWith('}}')) {
        return expression.replace(/{{/g, '{').replace(/}}/g, '}')
      }

      // 匹配 xxx="aaa-{{bbb}}"
      if (/(?<={{).*(?=}})/gm.test(expression)) {
        return `{\`${expression.replace(/{{/g, '${').replace(/}}/g, '}')}\`}`
      }

      // 普通字符串
      return `"${expression}"`
    }
    default:
      break
  }
}

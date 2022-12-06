/*
 * @Author: 芦杰
 * @Date: 2022-06-28 15:07:18
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-18 16:46:09
 * @Description: 方法编译器
 */

import * as t from '@babel/types'
import traverse, { NodePath } from '@babel/traverse'
import template from '@babel/template'

import { Config } from '../../config'
import { eventMap } from '../../../config'

export default class MethodCompiler {
  private config: Config

  constructor(config: Config) {
    this.config = config
  }

  // 转换方法中的 this.data / this.properties
  private transformDataOrProps(path: NodePath<t.MemberExpression>) {
    const { properties } = this.config

    const grandFatherNode = path.parent
    let replaceName = 'state'

    // 这种 this.properties
    if ((path.node?.property as t.Identifier)?.name === 'properties') {
      replaceName = 'props'
    }

    // 这种case: this.data.options
    if (t.isMemberExpression(grandFatherNode)) {
      const name = (grandFatherNode.property as t.Identifier).name
      if (properties.has(name)) {
        replaceName = 'props'
      }
    } else if (t.isVariableDeclarator(grandFatherNode)) {
      // 这种case: const { options } = this.data
      const { id } = grandFatherNode
      const { properties: [property] } = id as t.ObjectPattern
      const { name } = (property as t.ObjectProperty).key as t.Identifier
      if (properties.has(name)) {
        replaceName = 'props'
      }
    }

    path.replaceWith(t.identifier(replaceName))
  }

  // 转换方法中的this.setData
  private transformSetData(path: NodePath<t.MemberExpression>) {
    const grandFatherNode = path.parent

    // 处理 setData 第二个参数
    if (t.isCallExpression(grandFatherNode)) {
      const { arguments: argumentsNodes } = grandFatherNode

      // 第二个参数是匿名函数，增加 state 参数，useStates 中 setState 的 callback 中的 newState 通过传参形式传入
      if (argumentsNodes.length === 2 && t.isArrowFunctionExpression(argumentsNodes[1])) {
        argumentsNodes[1].params.push(t.identifier('state'))
      }
    }

    path.replaceWith(t.identifier('setState'))
  }

  // 转换方法中的 triggerEvent
  private transformTriggerEvent(path: NodePath<t.CallExpression>) {
    const node = path.node
    const [eventNameArg, params] = node.arguments

    const eventName = (eventNameArg as t.StringLiteral).value
    // 转换事件名称未事件函数 testEventName -> onTestEventName
    const functionName = eventMap?.[eventName] || `on${eventName.slice(0, 1).toUpperCase()}${eventName.slice(1)}`

    // 生成调用事件函数的 ast
    let triggerEventAst: t.Statement
    if (params) {
      triggerEventAst = template(`props?.${functionName}?.({ detail: %%params%% })`)({ params }) as t.Statement
    } else {
      triggerEventAst = template(`props?.${functionName}?.()`)() as t.Statement
    }

    path.replaceWith(triggerEventAst as t.Statement)
  }

  private transformThis(path: NodePath<t.ThisExpression>) {
    const fatherNode = path.parent
    const fatherPath = path.parentPath as NodePath<t.MemberExpression>

    // TODO: 如果 this 当做参数使用，暂时未处理，如：getFp(this, wx.getStorageSync('userId') || '');
    // TODO：挂载在 this 的不属于 state,props 的属性需要处理
    if (t.isMemberExpression(fatherNode)) {
      switch ((fatherNode.property as t.Identifier).name) {
        case 'properties':
        case 'data':
          this.transformDataOrProps(fatherPath)
          break
        case 'setData': {
          this.transformSetData(fatherPath)
          break
        }
        case 'triggerEvent': {
          this.transformTriggerEvent(fatherPath.parentPath as NodePath<t.CallExpression>)
          break
        }
        default:
          fatherPath.replaceWith(fatherNode.property)
          break
      }
    }
  }

  public transform(ast: t.File, nodes: t.Node[]) {
    traverse(ast, {
      // 将函数代码插入到 return jsx 上方
      ReturnStatement: (path) => {
        if (t.isJSXElement(path.get('argument'))) {
          path.insertBefore(nodes)
        }
      },
      ThisExpression: (path) => {
        this.transformThis(path)
      },
      MemberExpression: ({ node }) => {
        const object = node.object as t.Identifier
        if (object.name === 'wx') {
          object.name = 'Taro'
        }
      }
    })
  }
}

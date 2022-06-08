/*
 * @Author: 芦杰
 * @Date: 2022-06-08 11:35:44
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-08 11:48:39
 * @Description: 编译 js
 */

import { ParsedPath } from 'path'
import glob from 'glob-promise'

import { getASTByPath } from '../utils/babel-utils'

async function getScriptPath({ name, dir }: ParsedPath) {
  const scriptPaths = await glob(`${dir}/${name}.@(js|ts)`)

  return scriptPaths?.[0]
}

export default async function tramsform(parsedPath: ParsedPath) {
  const scriptPath = await getScriptPath(parsedPath)

  if (!scriptPath) {
    throw new Error(`未找到当前页面下 ${parsedPath.name}.ts 或 ${parsedPath.name}.js 的文件`)
  }

  const ast = getASTByPath(scriptPath)
  console.log(ast)
}

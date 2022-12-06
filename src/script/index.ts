/*
 * @Author: 芦杰
 * @Date: 2022-06-08 11:35:44
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-28 16:06:29
 * @Description: 编译 js
 */

import { ParsedPath } from 'path'
import chalk from 'chalk'
import glob from 'glob-promise'

import { getASTByPath, getASTByCode } from '../utils/babel-utils'
import { Imports } from '../config'
import parse from './parse'
import generate from './generate'

interface Option extends ParsedPath {
  returnCode: string
  imports: Imports
}

async function getScriptPath({ name, dir }: ParsedPath) {
  const scriptPaths = await glob(`${dir}/${name}.@(js|ts)`)

  return scriptPaths?.[0]
}

export default async function tramsform({ returnCode, imports, ...parsedPath }: Option) {
  const scriptPath = await getScriptPath(parsedPath)

  if (!scriptPath) {
    throw new Error(`未找到当前页面下 ${parsedPath.name}.ts 或 ${parsedPath.name}.js 的文件`)
  }

  console.log(chalk.white.bgBlue(`${scriptPath} 编译开始~`))

  // 编译过程
  // 需要编译的源代码 AST
  const sourceAST = getASTByPath(scriptPath)

  // 目标代码 return 的 AST
  const returnAST = getASTByCode(returnCode)

  // 从源代码 AST 获得配置
  const config = parse(sourceAST, imports)

  // 将配置 更新到目标 AST 中，生成转换后的代码
  const code = generate(returnAST, config)

  console.log(chalk.white.bgGreen(`${scriptPath} 编译成功~`))
  return code
}

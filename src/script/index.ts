/*
 * @Author: 芦杰
 * @Date: 2022-06-08 11:35:44
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-08 15:16:46
 * @Description: 编译 js
 */

import { ParsedPath } from 'path'
import chalk from 'chalk'
import glob from 'glob-promise'

import { getASTByPath, getASTByCode, formatCodeFormAST } from '../utils/babel-utils'

interface Option extends ParsedPath {
  targetCode: string
}

async function getScriptPath({ name, dir }: ParsedPath) {
  const scriptPaths = await glob(`${dir}/${name}.@(js|ts)`)

  return scriptPaths?.[0]
}

export default async function tramsform({ targetCode, ...parsedPath }: Option) {
  const scriptPath = await getScriptPath(parsedPath)

  if (!scriptPath) {
    throw new Error(`未找到当前页面下 ${parsedPath.name}.ts 或 ${parsedPath.name}.js 的文件`)
  }

  console.log(chalk.white.bgBlue(`${scriptPath} 编译开始~`))

  // 需要编译的源代码AST
  const sourceAST = getASTByPath(scriptPath)
  // 目标代码的 AST
  const targetAST = getASTByCode(targetCode)

  // TODO:转换流程

  console.log(chalk.white.bgGreen(`${scriptPath} 编译成功~`))
  return formatCodeFormAST(targetAST)
}

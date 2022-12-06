/*
 * @Author: 芦杰
 * @Date: 2022-05-26 14:36:15
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-29 18:29:59
 * @Description: wxml 解析入口
 */
import fse from 'fs-extra'
import chalk from 'chalk'
import path, { ParsedPath } from 'path'

import parse from './parse'
import generate from './generate'
import { pageTemplate } from './template'
import { Imports } from '../config'

interface Option extends ParsedPath {
  scopeName: string
  cssCode: string
  imports: Imports
}

export default async function tramsform({ name, dir, scopeName, cssCode, imports }: Option) {
  const wxmlPath = path.join(dir, `${name}.wxml`)

  console.log(chalk.white.bgBlue(`${wxmlPath} 编译开始~`))

  const data = await fse.readFile(wxmlPath)

  const ast = parse(data.toString())
  const { blocks } = generate(ast, imports)

  let code = ''
  for (const entry of Object.entries(blocks)) {
    const [name, value] = entry

    if (Number.isNaN(+name)) {
      code = code
        .replace(`$template$${name}$`, value)
        .replace(`$slot${name}$`, value) || ''
    } else {
      code += value
    }
  }

  // 有 css 增加 css 的引用
  if (cssCode) {
    imports.set('./style.less', new Set())
  }

  const returnCode = pageTemplate({ code, scopeName })

  console.log(chalk.white.bgGreen(`${wxmlPath} 编译成功~`))

  return returnCode
}

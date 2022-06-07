/*
 * @Author: 芦杰
 * @Date: 2022-05-26 14:36:15
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-07 18:29:49
 * @Description: wxml 解析入口
 */
import fse from 'fs-extra'
import chalk from 'chalk'
import path, { ParsedPath } from 'path'

import { formatCode } from '../utils/babel-utils'

import parse from './parse'
import generate from './generate'
import { pageTemplate } from './template'

export default function tramsform({ name, dir }: ParsedPath, scopeName: string) {
  try {
    const wxmlPath = path.join(dir, `${name}.wxml`)

    console.log(chalk.white.bgBlue(`${wxmlPath} 编译开始~`))

    const data = fse.readFileSync(wxmlPath)

    const ast = parse(data.toString())
    const { blocks, compSrcMap } = generate(ast)

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

    const importCode = [...compSrcMap].reduce((pre, [path, components]) => `${pre}import {${components.join(',')}} from '${path}'\n`, '')

    const jsxCode = formatCode(pageTemplate({ code, importCode, scopeName }))

    console.log(chalk.white.bgGreen(`${wxmlPath} 编译成功~`))
    return jsxCode
  } catch (e) {
    console.error(e)
  }
}

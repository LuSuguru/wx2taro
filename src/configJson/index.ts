/*
 * @Author: 芦杰
 * @Date: 2022-06-29 17:42:57
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-15 17:40:00
 * @Description: config.json 的解析
 */

import Path, { ParsedPath } from 'path'
import fse from 'fs-extra'
import chalk from 'chalk'

import { obj2Str, titleCase, addImportConfig } from '../utils'
import { formatCode } from '../utils/babel-utils'
import { Imports } from '../config'
import { ComponentConfigJson } from './config'

interface Option extends ParsedPath {
  imports: Imports
}

function parseUsingComponent(config: ComponentConfigJson, imports: Imports) {
  const usingComponents = config.usingComponents

  if (!usingComponents) return

  // 对 usingComponents 进行编译，更新到 imports 中
  Object.entries(usingComponents).forEach(([tagName, path]) => {
    const tagNameReact = titleCase(tagName)
    addImportConfig(imports, path, { type: 'global', name: tagNameReact })
  })
}

export default async function transform({ base, dir, imports }: Option) {
  const configPath = Path.join(dir, base)

  if (!fse.existsSync(configPath)) {
    throw new Error(`未找到当前页面下 ${base} 的文件`)
  }

  console.log(chalk.white.bgBlue(`${configPath} 编译开始~`))

  const res = await fse.readFile(configPath)
  const config = JSON.parse(res.toString())

  // 解析 usingComponent
  parseUsingComponent(config, imports)

  Reflect.deleteProperty(config, 'usingComponents')

  const entries = Object.entries(config)

  // 如果没有配置
  if (entries.length === 0) {
    console.log(chalk.white.bgGreen(`${configPath} 编译结束~`))
  }

  const configTs = `export default defineConfig(${obj2Str(config)})`

  console.log(chalk.white.bgGreen(`${configPath} 编译结束~`))

  return formatCode(configTs)
}

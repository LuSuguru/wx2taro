/*
 * @Author: 芦杰
 * @Date: 2022-05-26 14:36:03
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-08 11:49:31
 * @Description: 入口
 */
import chalk from 'chalk'
import fse from 'fs-extra'
import path from 'path'
import glob from 'glob-promise'

import transformWXML from './wxml'
import transformWxss from './wxss'
import transformScript from './script'
import { TARGET_DIR } from './config'
import { generateScopeName } from './utils'

function getDir() {
  const dir = process.argv?.[2]
  if (dir) {
    return dir
  }
  // TODO:用户未输入路径参数，默认获取
  return ''
}

async function run() {
  try {
    const dir = getDir()
    const parseDir = path.join(process.cwd(), dir)
    const targetDir = path.join(parseDir, TARGET_DIR)

    console.log(chalk.green('编译开始!'))

    const entry = await glob(`${parseDir}/*.json`)

    // 采用串行，方便查看哪个文件编译失败
    entry.forEach(async (entryPath) => {
      const parsedEntry = path.parse(entryPath)

      // 作用域名字，用来生成 css 作用域
      const scopeName = generateScopeName(parsedEntry.name)

      const cssCode = await transformWxss(parsedEntry, scopeName)
      const jsxCode = await transformWXML({ ...parsedEntry, scopeName, cssCode })
      await transformScript(parsedEntry)

      // 创建模板目录
      fse.ensureDirSync(targetDir)

      // 并行生成目标文件
      await Promise.all([
        fse.writeFile(path.join(targetDir, `./${parsedEntry.name}.tsx`), jsxCode),
        fse.writeFile(path.join(targetDir, `./${parsedEntry.name}.less`), cssCode)
      ])
    })
  } catch (e) {
    console.error(e)
  }
}

run()

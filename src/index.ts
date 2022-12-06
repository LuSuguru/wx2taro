/*
 * @Author: 芦杰
 * @Date: 2022-05-26 14:36:03
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-19 17:02:42
 * @Description: 入口
 */
import chalk from 'chalk'
import fse from 'fs-extra'
import path from 'path'
import glob from 'glob-promise'

import transformWXML from './wxml'
import transformWxss from './wxss'
import transformScript from './script'
import transformConfig from './configJson'
import { generateScopeName } from './utils'
import { Imports } from './config'

function getDir() {
  const pacageJsonPath = path.join(process.cwd(), 'package.json')

  if (!fse.existsSync(pacageJsonPath)) {
    throw new Error('当前目录下未找到 package.json')
  }

  const { wx2Taro } = JSON.parse(fse.readFileSync(pacageJsonPath).toString())

  if (!wx2Taro) {
    throw new Error('请在 package.json 中配置 wx2taro')
  }

  if (!Reflect.has(wx2Taro, 'output')) {
    throw new Error('wx2taro 配置中缺少 output')
  }

  const { entry = '', output } = wx2Taro

  const dir = process.argv?.[2] || ''

  console.log(path.join(process.cwd(), entry, dir))

  return {
    sourceDir: path.join(process.cwd(), entry, dir),
    targetDir: path.join(process.cwd(), output, entry, dir)
  }
}

export async function run() {
  try {
    const { sourceDir, targetDir } = getDir()

    console.log(chalk.green('编译开始!'))

    const entry = await glob('/**/*.json', {
      root: sourceDir,
      ignore: ['/**/node_modules/**/*.json', '**/package.json', '**/package-lock.json', '**/project-config.json', '**/sitemap.json', '**/tsconfig.json']
    })

    // 采用串行，方便查看哪个文件编译失败
    for (const entryPath of entry) {
      const parsedEntry = path.parse(entryPath)
      const imports: Imports = new Map([['@tarojs/taro', new Set(['FC', { type: 'global', name: 'Taro' }])]])

      // 作用域名字，用来生成 css 作用域
      const scopeName = generateScopeName(parsedEntry.name)

      // TODO: app.json 编译
      if (parsedEntry.name === 'app' && !fse.existsSync(path.join(parsedEntry.dir, 'app.wxml'))) {
        continue
      }

      const cssCode = await transformWxss(parsedEntry, scopeName)
      const returnCode = await transformWXML({ ...parsedEntry, scopeName, cssCode, imports })
      const configCode = await transformConfig({ ...parsedEntry, imports })
      const targetCode = await transformScript({ returnCode, imports, ...parsedEntry })

      // 获取相对 sourceDir 的相对路径，根据先对路径生成输出文件
      const relativeDir = path.relative(sourceDir, parsedEntry.dir)
      const outputTargetDir = path.resolve(targetDir, relativeDir)
      // 创建模板目录
      fse.ensureDirSync(outputTargetDir)

      // 并行生成目标文件
      const filePromises = [
        fse.writeFile(path.join(outputTargetDir, `./${parsedEntry.name}.tsx`), targetCode),
        fse.writeFile(path.join(outputTargetDir, `./${parsedEntry.name}.config.ts`), configCode)
      ]
      // 有 css 代码则生成 css 文件
      if (cssCode) {
        filePromises.push(fse.writeFile(path.join(outputTargetDir, `./${parsedEntry.name}.less`), cssCode))
      }
      await Promise.all(filePromises)
    }

    console.log(chalk.bgYellow('编译成功~！😁😁'))
    console.log(`${chalk.bgMagenta('编译路径为：')}${chalk.green(targetDir)}`)
  } catch (e) {
    console.error(e)
  }
}

run()

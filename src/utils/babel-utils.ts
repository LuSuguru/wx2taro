/*
 * @Author: 芦杰
 * @Date: 2022-06-01 17:28:11
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-08 11:35:06
 * @Description: babel 操作方法
 */

import generate from '@babel/generator'
import { parse } from '@babel/parser'
import t from '@babel/types'
import prettier from 'prettier'
import fse from 'fs-extra'

// 通过 prettier 格式化代码
export function formatCode(js: string) {
  return prettier.format(js, {
    singleQuote: true,
    trailingComma: 'es5',
    tabWidth: 4,
    parser: 'babel-ts'
  })
}

// 将 code 转化为 AST
export function getASTByCode(code: string): t.File {
  return parse(code, {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    plugins: [
      'jsx',
      'typescript',
    ],
  })
}

export function getASTByPath(path: string) {
  const code = fse.readFileSync(path).toString()
  return getASTByCode(code)
}

// 将 AST 转化为 Code，不格式化
export function getCodeByAST(ast: t.Node) {
  return generate(ast, {
    jsescOption: {
      minimal: true,
    },
  }).code
}

// 将 AST 转化为 code
export function formatCodeFormAST(ast: t.Node) {
  return formatCode(generate(ast, {
    jsescOption: {
      minimal: true,
    },
    retainLines: true,
  }).code)
}

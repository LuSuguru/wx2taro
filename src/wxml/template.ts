/*
 * @Author: 芦杰
 * @Date: 2022-06-01 16:58:30
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-08 20:18:30
 * @Description: 模板
 */

export const pageTemplate = ({ code, scopeName }: { code: string, scopeName: string }) => `
const Page:FC = (props)=> {
    return (
        <div className="${scopeName}">
            ${code}    
        </div>
  )
}`

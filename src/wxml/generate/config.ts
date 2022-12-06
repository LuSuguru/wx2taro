/*
 * @Author: 芦杰
 * @Date: 2022-06-01 17:07:47
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-14 14:49:47
 * @Description: 转换配置
 */

export const propsMap = new Map([
  ['class', 'className']
])

/** 小程序标签映射 */
export const wxTagMap = new Map([
  ['i', 'Text']
])

export const componentPathMap = new Map([
  ['@tarojs/components', [
    // 视图容器
    'Block', 'CoverImage', 'CoverView', 'MatchMedia', 'MovableArea', 'MovableView', 'PageContainer', 'ScrollView', 'ShareElement', 'Swiper', 'SwiperItem', 'View',
    // 基础内容
    'Icon', 'Progress', 'RichText', 'Text',
    // 表单组件
    'Button', 'Checkbox', 'CheckboxGroup', 'Editor', 'Form', 'Input', 'KeyboardAccessory', 'Label', 'Picker', 'PickerView', 'PickerViewColumn', 'Radio', 'RadioGroup', 'Slider', 'Switch', 'Textarea',
    // 导航
    'FunctionalPageNavigator', 'Navigator', 'NavigationBar',
    // 媒体组件
    'Audio', 'Camera', 'Image', 'LivePlayer', 'LivePusher', 'Video', 'VoipRoom',
    // 地图
    'Map',
    // 画布
    'Canvas',
    // 开放能力
    'Ad', 'AdCustom', 'OfficialAccount', 'OpenData', 'WebView',
    // 配置节点
    'PageMeta', 'CustomWrapper', 'Slot'
  ]]
])

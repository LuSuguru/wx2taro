/*
 * @Description: 
 * @Author: 芦杰
 * @Date: 2022-07-19 15:48:42
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-19 15:48:42
 */
/*
 * @Descripttion:时间帅选
 * @Author: bingling
 * @Date: 2021-08-23 17:28:07
 * @LastEditors: bingling
 * @LastEditTime: 2021-10-29 12:58:11
 */
Component({
    options: {
        addGlobalClass: true,
    },
    /**
     * 组件的属性列表
     */
    properties: {
        selectedItem: {
            type: String,
            value: ''
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        timeButtons: [
            { key: '', label: '全部' },
            { key: '1', label: '今日' },
            { key: '0', label: '昨日' },
            { key: '7', label: '7日' },
            { key: '30', label: '30日' },
        ],

    },

    /**
     * 组件的方法列表
     */
    methods: {
        onTimeChange(e){
            const dataset = e.currentTarget.dataset;

            this.setData({ selectedItem: dataset.key });

            console.log('dataset.key=', dataset.key);

            this.triggerEvent('timeSelected', dataset);
        },
    }
});

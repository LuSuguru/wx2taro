import { ComponentWithComputed } from 'miniprogram-computed';

const action = require('../../action/method');
// 静态资源前置 如上传组件图片地址
const STATIC_URL = '//img.hicdn.cn/';

const ICON_MAP = {
    // 申请补偿
    1: `${STATIC_URL}fed/images/20210105/5e2acff18a92f218a74786d0ec14dfb7_112x112.png`,
    // 仅退款
    2: `${STATIC_URL}fed/images/20210105/1c073f8b227aaebc90b14440768f8d31_112x112.png`,
    // 退货退款
    3: `${STATIC_URL}fed/images/20210105/ee27babf3630a60294ed961e63d8fca9_112x112.png`,
    // 换货
    4: `${STATIC_URL}fed/images/20210105/f99c3fc4cca2b60fe93a299c063431de_112x112.png`,
};

export function handleBtnData(data) {
    const content = [];
    Object.keys(data).forEach(k => {
        let node = null;
        if (data[k]) {
            switch (k) {
                case 'compensation':
                    node = {
                        title: '申请补偿',
                        icon: 1,
                        refundType: 1,
                        refundSubType: 1,
                        rpno: '6.1.34.1.2',
                        // 对已收到的货物不满意，不退货，申请补偿
                        desc: '已收到货，需要申请补偿',
                    };
                    content[0] = node;
                    break;
                case 'onlyRefund':
                    node = {
                        title: '仅退款',
                        icon: 2,
                        refundType: 1,
                        refundSubType: 2,
                        rpno: '6.1.34.1.1',
                        // 未收到货或到货不全，申请退款
                        desc: '未收到货，或协商同意仅退款',
                        url: '',
                    };
                    content[1] = node;
                    break;
                case 'refundWithGood':
                    node = {
                        title: '退货退款',
                        icon: 3,
                        refundType: 2,
                        refundSubType: null,
                        rpno: '6.1.34.1.3',
                        // 已收到货，需要退还已收到的货物
                        desc: '已收到货，需要申请退货退款',
                    };
                    content[2] = node;
                    break;
                case 'exchange':
                    node = {
                        title: '换货',
                        icon: '4',
                        refundType: 2,
                        refundSubType: null,
                        rpno: '6.1.34.1.4',
                        desc: '已收到货，需要调换货物',
                    };
                    content[3] = node;
                    break;
                default:
                    break;
            }
        }
    });

    return content.filter(v => v.title);
}


/**
 * 页面地址
 * packageRefund/pages/chooseRefundType/index?orderId&tradeId
 */
ComponentWithComputed({
    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        ICON_MAP,
        navigatorBtn: []
    },
    properties: {
        props: {
            type: Object,
            value: {}
        },
        options: {
            type: Object,
            value: {}
        }
    },
    computed: {
        navigator(data) {
            const { navigatorBtn, list } = data;
            return list.filter(it => !!navigatorBtn[it.key]);
        }
    },
    methods: {
        queryStringify(obj) {
            let keys = Object.keys(obj).filter(key => ![null, undefined].includes(obj[key]));
            return keys.reduce((pre, cur, index) => `${pre}${cur}=${obj[cur]}${keys.length - 1 === index ? '' : '&'}`, '');
        },
        itemTap(e) {
            const { itemLineId, tradeId, flashGoBatchRefund } = this.data.options;
            const { refundSubType, refundType } = e.currentTarget.dataset;
            const query = {
                orderId: tradeId,
                refundSubType,
                refundType,
                itemLineId,
                flashGoBatchRefund
            };
            const refundApply = this.data.props.url.refundApply;

            wx.navigateTo({
                url: `${refundApply}?${this.queryStringify(query)}`
            });
        },
        // 查询服务类型
        async queryNavigator() {
            let { orderId, tradeId, itemLineId, flashGoBatchRefund } = this.data.options;
            const params = {
                tradeId,
                orderId,
                itemLineId,
                flashGoBatchRefund
            };
            const res = await action.getNavigator(params);

            this.setData({
                navigatorBtn: handleBtnData(res.data.navigator)
            });
        }
    },
    lifetimes: {
        attached() {
            this.queryNavigator();
        }
    }
});

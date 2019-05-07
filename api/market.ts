import Api, { DataPromise, Data } from '~/api'

export interface Market {
    tickers(): DataPromise<Data>
    kline(type: number): DataPromise<Data>
}

export default (api: Api): Market => {
    return {
        /*
         * 所有交易对的最新 Tickers
         */
        tickers() {
            return api.get('/rt/getTradeLists', {
                headers: {
                    'X-Forwarded-Host': 'www.bcex.hk'
                }
            })
        },
        kline(type) {
            return api.get('/rt/getTradeLists', {
                headers: {
                    'X-Forwarded-Host': 'www.bcex.hk'
                },
                params: {
                    type: type
                }
            })
        }
    }
}
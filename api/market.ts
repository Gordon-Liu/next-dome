import { ApiInstance, DataPromise, Data } from '~/api'

export interface Market {
    tickers<D = any>(): DataPromise<Data<D>>
    kline<D = any>(type: number): DataPromise<Data<D>>
}

export default (api: ApiInstance): Market => {
    return {
        /*
         * 所有交易对的最新 Tickers
         */
        tickers() {
            return api.get('/market/tickers')
        },
        kline(type: number) {
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
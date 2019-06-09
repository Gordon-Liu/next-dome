import { ApiInstance, DataPromise, Data } from '~/api'

type DP<D> = DataPromise<Data<D>>

export interface Rt {
    kline<D = any>(
        params: { 
            token: string 
            market: string
            timeType: number 
        }
    ): DP<D>
}

export default (api: ApiInstance): Rt => {
    return {
        kline({ token, market, timeType }) {
			return api.get('/rt/kline', {
                params: {
                	token: token,
                	market: market,
                	time_type: timeType
                },
                headers: {
                    'X-Forwarded-Host': 'www.bcex.vip'
                }
            })
		}
    }
}
import { NextComponentType, NextContext } from 'next'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { IncomingMessage } from 'http'
import { createContext, Component, ComponentClass } from 'react'

import market, { Market } from '~/api/market'
import rt, { Rt } from '~/api/rt'

type key = '__API__'

/*
 * 接口返回值
 */
export interface Data<D = any> {
    code: string | number | undefined
    message: string | undefined
    data: D
}
/*
 * DataPromise 代替 AxiosPromise
 */
export interface DataPromise<T = any> extends Promise<T> {
}

export interface ApiInstance {
    axios: AxiosInstance
    interceptResponse<D = any>(res: AxiosResponse): Data<D>
    interceptError<D = any>(err: AxiosError): Data<D>
    request<D = any>(config: AxiosRequestConfig): DataPromise<Data<D>>
    get<D = any>(url: string, config?: AxiosRequestConfig): DataPromise<Data<D>>
    delete(url: string, config?: AxiosRequestConfig): DataPromise
    head(url: string, config?: AxiosRequestConfig): DataPromise
    post<D = any>(url: string, data?: any, config?: AxiosRequestConfig): DataPromise<Data<D>>
    put<D = any>(url: string, data?: any, config?: AxiosRequestConfig): DataPromise<Data<D>>
    patch<D = any>(url: string, data?: any, config?: AxiosRequestConfig): DataPromise<Data<D>>
    readonly market: Market
    readonly rt: Rt
}

export default class Api implements ApiInstance {
    static key: key = '__API__'

    axios: AxiosInstance

    constructor(req?: IncomingMessage) {
        const headers: any = {
            common : {
                'Accept': 'application/json, text/plain, */*'
            },
            delete: {},
            get: {},
            head: {},
            post: {},
            put: {},
            patch: {}
        }
        const baseURL = process.browser ? process.env.proxyPrefix : process.env.proxyTarget
        if (!process.browser) {
            if (req) {
                headers.common = (req && req.headers) ? Object.assign({}, req.headers) : {}
                delete headers.common['accept']
                delete headers.common['host']
            }

            headers.common['Accept-Encoding'] = 'gzip, deflate'
        }
        
        const requestConfig: AxiosRequestConfig = {
            baseURL,
            headers
        }
        /*
        * 生产axios对象
        */
        this.axios = axios.create(requestConfig)
    }
    /*
    * 返回值拦截
    */
    interceptResponse(res: AxiosResponse): Data {
        if (res && res.data) {
            return res.data
        } else {
            return {
                code: 500,
                message: 'Return value is null',
                data: null
            }
        }
    }
    /*
    * 错误拦截
    */
    interceptError(err: AxiosError): Data {
        if (err && err.response) {
            return {
                code: err.response.status,
                message: err.message,
                data: null
            }
        } else {
            return {
                code: err.code,
                message: err.code,
                data: null
            }
        }
    }
    /*
    * 重写 request get delete head post put patch 请求
    */
    request(config: AxiosRequestConfig) {
        return this.axios.request(config).then(this.interceptResponse).catch(this.interceptError)
    }
    get(url: string, config?: AxiosRequestConfig) {
        return this.axios.get(url, config).then(this.interceptResponse).catch(this.interceptError)
    }
    delete(url: string, config?: AxiosRequestConfig) {
        return this.axios.delete(url, config).then(this.interceptResponse).catch(this.interceptError)
    }
    head(url: string, config?: AxiosRequestConfig) {
        return this.axios.head(url, config).then(this.interceptResponse).catch(this.interceptError)
    }
    post(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.axios.post(url, data, config).then(this.interceptResponse).catch(this.interceptError)
    }
    put(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.axios.put(url, data, config).then(this.interceptResponse).catch(this.interceptError)
    }
    patch(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.axios.patch(url, data, config).then(this.interceptResponse).catch(this.interceptError)
    }

    /*
    * api路由
    */
    get market(): Market {
        return market(this)
    }

    get rt(): Rt {
        return rt(this)
    }
}

/*
* 挂载 Window
*/
declare global {
    interface Window {
        __API__: ApiInstance
    }
}

/*
* createContext defaultValue
*/
export interface defaultValue {
    api?: ApiInstance
}

/*
* Create context
*/
export const ApiContext = createContext<defaultValue>({})

/*
* https://github.com/zeit/next.js/blob/canary/packages/next/client/with-router.tsx
*/

interface WithApiProps {
    api: ApiInstance
}

export type ExcludeApiProps<P> = Pick<
  P,
  Exclude<keyof P, keyof WithApiProps>
>

// type ApiProps<IP> = IP & WithApiProps

// export function withApi<P extends ApiProps<IP>, IP = {}>(
//     ComposedComponent: NextComponentType<P, IP, Context>
// ): ComponentClass<P> {
// export function withApi<P>(
//     ComposedComponent: ComponentType<P>
// ): ComponentType<P> {
export function withApi<P extends WithApiProps, C = NextContext>(
    ComposedComponent: NextComponentType<P, any, C>
): ComponentClass<ExcludeApiProps<P>> {
    const displayName = `withApi(${ComposedComponent.displayName || ComposedComponent.name})`
    class WithApi extends Component<ExcludeApiProps<P>> {
    // class WithApi extends Component<P> {
        static displayName?: string
        static getInitialProps?: any

        render() {
            return (
                <ApiContext.Consumer>
                    {value => (
                        <ComposedComponent
                            api={value && value.api}
                            {...this.props as any}
                        />
                    )}
                </ApiContext.Consumer>
            )
        }
    }

    WithApi.displayName = displayName
    WithApi.getInitialProps = ComposedComponent.getInitialProps

    return WithApi
}
 
export class ApiProvider extends Component<WithApiProps> { 
    render() {
        return (
            <ApiContext.Provider value={{
                api: this.props.api
            }}>
                {this.props.children}
            </ApiContext.Provider>
        )
    }
}
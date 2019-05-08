import { NextContext, NextComponentType } from 'next'
import { NextAppContext } from 'next/app'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { RequestOptions } from 'https'
import { createContext, Component, ComponentClass } from 'react'
import PropTypes from 'prop-types'
import { Context } from '~/interface'

import market, { Market } from '~/api/market'

type key = '__API__'

/*
 * 接口返回值
 */
export interface Data {
    code: string | number | undefined
    message: string | undefined
    data?: any
}
/*
 * DataPromise 代替 AxiosPromise
 */
export interface DataPromise<T = any> extends Promise<T> {
}
/*
 * 挂载 NextContext
 */
export interface NextApiContext extends NextContext {
    api: ApiInstance
}
export interface NextApiAppContext extends NextAppContext {
    ctx: NextApiContext
}

export interface ApiInstance {
    axios: AxiosInstance
    interceptResponse(res: AxiosResponse): Data
    interceptError(err: AxiosError): Data
    request(config: AxiosRequestConfig): DataPromise<Data>
    get(url: string, config?: AxiosRequestConfig): DataPromise<Data>
    delete(url: string, config?: AxiosRequestConfig): DataPromise
    head(url: string, config?: AxiosRequestConfig): DataPromise
    post(url: string, data?: any, config?: AxiosRequestConfig): DataPromise<Data>
    put(url: string, data?: any, config?: AxiosRequestConfig): DataPromise<Data>
    patch(url: string, data?: any, config?: AxiosRequestConfig): DataPromise<Data>
    readonly market: Market
}

export default class Api implements ApiInstance {
    static key: key = '__API__'

    axios: AxiosInstance

    constructor(req?: RequestOptions) {
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
                message: 'Return value is null'
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
                message: err.message
            }
        } else {
            return {
                code: err.code,
                message: err.code
            }
        }
    }
    /*
    * 重写 request get delete head post put patch 请求
    */
    request(config: AxiosRequestConfig): DataPromise<Data> {
        return this.axios.request(config).then(this.interceptResponse).catch(this.interceptError)
    }
    get(url: string, config?: AxiosRequestConfig): DataPromise<Data> {
        return this.axios.get(url, config).then(this.interceptResponse).catch(this.interceptError)
    }
    delete(url: string, config?: AxiosRequestConfig): DataPromise {
        return this.axios.delete(url, config).then(this.interceptResponse).catch(this.interceptError)
    }
    head(url: string, config?: AxiosRequestConfig): DataPromise {
        return this.axios.head(url, config).then(this.interceptResponse).catch(this.interceptError)
    }
    post(url: string, data?: any, config?: AxiosRequestConfig): DataPromise<Data> {
        return this.axios.post(url, data, config).then(this.interceptResponse).catch(this.interceptError)
    }
    put(url: string, data?: any, config?: AxiosRequestConfig): DataPromise<Data> {
        return this.axios.put(url, data, config).then(this.interceptResponse).catch(this.interceptError)
    }
    patch(url: string, data?: any, config?: AxiosRequestConfig): DataPromise<Data> {
        return this.axios.patch(url, data, config).then(this.interceptResponse).catch(this.interceptError)
    }

    /*
    * api路由
    */
    get market(): Market {
        return market(this)
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
export function withApi<P, IP = P>(
    ComposedComponent: NextComponentType<P, IP, Context>
): ComponentClass {
    const displayName = `withApi(${ComposedComponent.displayName || ComposedComponent.name})`
    class WithApi extends Component {
        static displayName?: string
        static getInitialProps?: any
        static contextTypes = {
            api: PropTypes.object,
        }

        context!: defaultValue

        render() {
            return (
                <ApiContext.Consumer>
                    {api => (
                        <ComposedComponent
                            api={api}
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



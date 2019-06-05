import { IncomingMessage } from 'http'
import App, { AppProps, Container, DefaultAppIProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import Api, { ApiProvider, ApiInstance } from '~/api'
import { AppContext } from '~/interface'
import configureStore, { storeKey, StoreState } from '~/store'
import { updateSex } from '~/store/user/actions'
import base from '~/styles/base.scss'

interface Props extends DefaultAppIProps, AppProps {
    initialStoreState: StoreState
}

function createApi(req?: IncomingMessage): ApiInstance {
    if (!process.browser) {
        return new Api(req)
    } else {
        if (!window.hasOwnProperty(Api.key)) {
            window[Api.key] = new Api()
        }
        return window[Api.key]
    }
}

function createStore(initialStoreState?: StoreState): Store {
    if (!process.browser) {
        return configureStore(initialStoreState)
    } else {
        if (!window.hasOwnProperty(storeKey)) {
            window[storeKey] = configureStore(initialStoreState)
        }
        return window[storeKey]
    }
}

export default class extends App<Props, {}> {
    protected api: ApiInstance

    protected store: Store

    static async getInitialProps (context: AppContext) {
        let pageProps = {}
        
        context.ctx.api = createApi(context.ctx.req)  
        context.ctx.store = createStore()  
        if (context.Component.getInitialProps) {
            pageProps = await context.Component.getInitialProps(context.ctx)
        }
        /*
         * 服务端首次加载
         * 将服务端获取的数据带入到客户端
         */
        if (!process.browser) {
            context.ctx.store.dispatch(updateSex(0))
        }
        return {
            pageProps,
            initialStoreState: context.ctx.store.getState()
        }
    }

    constructor(props: Props) {
        super(props)
        this.api = createApi()
        this.store = createStore(props.initialStoreState)
    }
  
    render () {
        const { Component, pageProps } = this.props
        return (
            <Container>
                <Head>
                    <title>This my demo title 🤔</title>
                </Head>
                <Provider store={this.store}>
                    <ApiProvider api={this.api}>
                        <Component {...pageProps} />
                    </ApiProvider>
                </Provider>
                <style jsx>{base}</style>
            </Container>   
        )
    }
}
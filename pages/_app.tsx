import { RequestOptions } from 'https'
import App, { Container, DefaultAppIProps, AppProps } from 'next/app'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import Api, { ApiInstance, ApiContext } from '~/api'
import configureStore, { storeKey } from '~/store'
import { AppContext } from '~/interface'

interface Props extends DefaultAppIProps, AppProps {}

function createApi(req?: RequestOptions): ApiInstance {
    if (!process.browser) {
        return new Api(req)
    } else {
        if (!window.hasOwnProperty(Api.key)) {
            window[Api.key] = new Api()
        }
        return window[Api.key]
    }
}

function createStore(): Store {
    if (!process.browser) {
        return configureStore()
    } else {
        if (!window.hasOwnProperty(storeKey)) {
            window[storeKey] = configureStore()
        }
        return window[storeKey]
    }
}

export default class extends App<Props, {}> {
    protected api: ApiInstance

    protected store: Store

    static async getInitialProps (context: AppContext) {
        let pageProps
        
        if (context.Component.getInitialProps) {
            context.ctx.api = createApi(context.ctx.req)  
            context.ctx.store = createStore()  
            pageProps = await context.Component.getInitialProps(context.ctx)
        }
        return {
            pageProps
        }
    }

    constructor(props: Props) {
        super(props)
        this.api = createApi()
        this.store = createStore()
    }
  
    render () {
        const { Component, pageProps } = this.props
        return (
            <Container>
                <Provider store={this.store}>
                    <ApiContext.Provider value={{
                        api: this.api
                    }}>
                        <Component {...pageProps} />
                    </ApiContext.Provider>
                </Provider>
            </Container>   
        )
    }
}
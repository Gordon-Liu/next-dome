import App, { Container, DefaultAppIProps, AppProps } from 'next/app'
import Api, { ApiInstance, NextApiAppContext, ApiContext } from '~/api'

interface Props extends DefaultAppIProps, AppProps {
}

interface Context extends NextApiAppContext {}

function createApi(context?: Context): ApiInstance {
    if (!process.browser && context) {
        return new Api(context.ctx.req)
    } else {
        if (!window.hasOwnProperty(Api.key)) {
            window[Api.key] = new Api()
        }
        return window[Api.key]
    }
}

export default class extends App<Props, {}> {
    protected api: ApiInstance

    static async getInitialProps (context: Context) {
        let pageProps
        
        if (context.Component.getInitialProps) {
            context.ctx.api = createApi(context)  
            pageProps = await context.Component.getInitialProps(context.ctx)
        }
        return {
            pageProps
        }
    }

    constructor(props: Props) {
        super(props)
        this.api = createApi()
    }
  
    render () {
        const { Component, pageProps } = this.props
        return (
            <Container>
                <ApiContext.Provider value={{
                    api: this.api
                }}>
                    <Component {...pageProps} />
                </ApiContext.Provider>
            </Container>   
        )
    }
}
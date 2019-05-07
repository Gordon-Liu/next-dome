import App, { Container } from 'next/app'
import Api, { NextApiAppContext } from '~/api'

interface props {}

interface Context extends NextApiAppContext {}

export default class extends App<props, {}> {
    static async getInitialProps (context: Context) {
        let pageProps
        
        if (context.Component.getInitialProps) {
            if (!process.browser) {
                context.ctx.api = new Api(context.ctx.req)
            } else {
                if (!window.hasOwnProperty(Api.key)) {
                    window[Api.key] = new Api()
                }
                context.ctx.api = window[Api.key]
            }
            pageProps = await context.Component.getInitialProps(context.ctx)
        }
        return {
            pageProps
        }
    }
  
    render () {
        const { Component, pageProps } = this.props
        return (
            <Container>
                <Component {...pageProps} />
            </Container>   
        )
    }
}
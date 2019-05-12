/*
 * https://github.com/zeit/next.js/issues/2744
 */
import * as express from 'express'
import * as proxy from 'http-proxy-middleware'
import * as next from 'next'

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

interface Proxy {
    [key: string]: proxy.Config
}

app.prepare().then(() => {
    const server = express()

    const proxyConfig: Proxy = {
        [app.nextConfig.env.proxyPrefix]: {
            target: app.nextConfig.env.proxyTarget,
            pathRewrite: { 
                [`^${app.nextConfig.env.proxyPrefix}`]: '/' 
            },
            changeOrigin: true
        }
    }

    Object.keys(proxyConfig).forEach((key: string) => {
        server.use(key, proxy(proxyConfig[key]))
    })
    
    server.all('*', (req: express.Request, res: express.Response) => handle(req, res))

    server.listen(port, (err: any) => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${port}`)
    })
}).catch((err: any) => {
    console.log('An error occurred, unable to start the server')
    console.log(err)
})
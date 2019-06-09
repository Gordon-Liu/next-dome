/*
 * https://github.com/zeit/next.js/issues/2744
 */
// import * as express from 'express'
// import * as proxy from 'http-proxy-middleware'

import { createServer, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url'
import * as httpProxy from 'http-proxy'
import { UrlLike } from 'next-server/router'

import * as next from 'next'

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const proxy = httpProxy.createProxyServer()
proxy.on('error', (err: NodeJS.ErrnoException, req: IncomingMessage, res: ServerResponse) => {
    let code: string = err.code ? err.code : ''
    if (res.writeHead && !res.headersSent) {
        if (/HPE_INVALID/.test(code)) {
            res.writeHead(502)
        } else {
            switch (code) {
                case 'ECONNRESET':
                case 'ENOTFOUND':
                case 'ECONNREFUSED':
                    res.writeHead(504)
                    break
                default:
                    res.writeHead(500)
            }
        }
      }
    res.end('Error occured while trying to proxy to: ' + (req.headers && req.headers.host) + req.url)
})


// interface Proxy {
//     [key: string]: proxy.Config
// }

function pathRewriter(url?: string): string {
    if (url) {
        return url.replace(new RegExp(`^${app.nextConfig.env.proxyPrefix}`), '')
    }
    return ''
}

app.prepare().then(() => {
    createServer((req: IncomingMessage, res: ServerResponse) => {
        const parsedUrl: UrlLike = parse(req.url!, true)
        if (
            parsedUrl.path && 
            new RegExp(`^${app.nextConfig.env.proxyPrefix}/*`).test(parsedUrl.path)
        ) {
            req.url = pathRewriter(req.url)
            proxy.web(
                req, 
                res, 
                { 
                    target: app.nextConfig.env.proxyTarget,
                    changeOrigin: true
                }
            )
        } else {
            if (parsedUrl.path && /^\/static\/*/.test(parsedUrl.path)) {
                res.setHeader(
                    "Cache-Control",
                    "public, max-age=31536000, immutable"
                )
            }
    
            handle(req, res, parsedUrl)
        }
    }).listen(port)

    console.log(
        `> Server listening at http://localhost:${port} as ${
          dev ? 'development' : process.env.NODE_ENV
        }`
    )

    /*
     * express proxy cache-control handle
     */
    // const server = express()

    // const proxyConfig: Proxy = {
    //     [app.nextConfig.env.proxyPrefix]: {
    //         target: app.nextConfig.env.proxyTarget,
    //         pathRewrite: { 
    //             [`^${app.nextConfig.env.proxyPrefix}`]: '/' 
    //         },
    //         changeOrigin: true
    //     }
    // }

    // Object.keys(proxyConfig).forEach((key: string) => {
    //     server.use(key, proxy(proxyConfig[key]))
    // })

    // server.use(
    //     /^\/static/,
    //     (
    //         _, 
    //         res: express.Response, 
    //         next: express.NextFunction
    //     ) => {
    //         res.setHeader(
    //             "Cache-Control",
    //             "public, max-age=31536000, immutable"
    //         )
    //         next()
    //     }
    // )
    
    // server.all('*', (req: express.Request, res: express.Response) => {
    //     return handle(req, res)
    // })

    // server.listen(port, () => {
    //     console.log(`> Ready on http://localhost:${port}`)
    // })
}).catch((err: any) => {
    console.log('An error occurred, unable to start the server')
    console.log(err)
})
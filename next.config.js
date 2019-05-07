/*
 * next.config.js
 */
const path = require('path')
const NextTypescript = require('@zeit/next-typescript')
const env = require('./.env.config')

// const NextSass = require('@zeit/next-sass')
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

/*
 * next-sass css-modules
 */
// module.exports = NextTypescript(NextSass(
//     {
//         cssModules: true,
//         cssLoaderOptions: {
//             importLoaders: 1,
//             localIdentName: '[local]___[hash:base64:5]'
//         },
//         webpack(config, options) {
//             // Do not run type checking twice:
//             // if (options.isServer) config.plugins.push(new ForkTsCheckerWebpackPlugin())
//             config.resolve.alias['~'] = path.join(__dirname, '/')
//             return config
//         }
//     }
// ))
/*
 * styled-jsx scoped
 */
module.exports = NextTypescript(
    {
        env: {
            proxyPrefix: env.proxy.prefix,
            proxyTarget: env.proxy.target
        },
        webpack(config, options) {
            // Do not run type checking twice:
            // if (options.isServer) config.plugins.push(new ForkTsCheckerWebpackPlugin())
            // console.log(config, '-----------------------------------', options)
            config.module.rules.push({
                test: /\.scss$/,
                use: [
                    options.defaultLoaders.babel,
                    {
                        loader: require('styled-jsx/webpack').loader,
                        options: {
                            type: 'scoped'
                        }
                    },
                    'sass-loader'
                ]
            })
            config.resolve.alias['~'] = path.resolve(__dirname, '.')
            return config
        }
    }
)
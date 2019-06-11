import { Component, ReactNode } from 'react'
import io from 'socket.io-client'
import pako from 'pako'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { withRouter } from 'next/router'
import { withApi } from '~/api'
import { ApiProps, RouterProps } from '~/interface'

const Kline = dynamic(import('~/components/Kline'), {
	ssr: false
})


interface Props extends ApiProps, RouterProps {
}

interface State {
    kline: Array<any>
    token: string
    market: string
    interval: string
    klineLock: boolean
}

enum defaultSymbol {
    TOKEN = 'BTC',
    Market = 'USDT'  
}


export default withRouter(withApi(class extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props)
        this.state = {
            kline: [],
            token: defaultSymbol.TOKEN,
            market: defaultSymbol.Market,
            interval: '1',
            klineLock: true
        }
    }

    private io!: SocketIOClient.Socket

    getTimeType(interval: string): number {
        if (interval === '1D') {
            return 1440
        } else if (interval === '1W') {
            return 10080
        } else if (interval === '1M') {
            return 43200
        } else {
            return Number(interval)
        }
    }

    getKline = async (token: string, market: string, interval: string): Promise<void> => {
        let timeType: number = this.getTimeType(interval)

        this.setState({
            klineLock: false
        })

        let res = await this.props.api.rt.kline<State['kline']>({
            token,
            market,
            timeType
        })
        this.setState({
            token,
            market,
            interval: interval,
            kline: res.data,
            klineLock: true
        })
    }

    initSocket(token: string, market: string): void {
        const opts: SocketIOClient.ConnectOpts = {
            reconnectionAttempts: 5,
            transports: [ 'websocket', 'polling' ],
            query: {
                o: 10
            }
        }
        this.io = io('https://so3.bx-app.net', opts)

        this.io.emit('bcex-join', JSON.stringify({
            r: [{
                n: 'exchange-brief-quotes',
                f: false
            }],
            market,
            token
        }))

        this.io.on('bcex-brief', (data: string) => {
            if (this.state.klineLock) {
                const dataString: string = pako.inflate(atob(data), { to: 'string' })
                if (dataString) {
                    const dataJSON: any = JSON.parse(dataString)
                    if (
                        dataJSON.t === this.state.token,
                        dataJSON.m === this.state.market
                    ) {
                        const kline: any = dataJSON.d.kline[this.getTimeType(this.state.interval).toString()]
                        if (this.state.kline[this.state.kline.length - 1].timestamp === kline.timestamp) {
                            this.setState((prevState: State) => {
                                prevState.kline.splice(this.state.kline.length - 1, 1, kline)
                                return {
                                    kline: [...prevState.kline]
                                }
                            })
                        } else if (this.state.kline[this.state.kline.length - 1].timestamp < kline.timestamp) {
                            this.setState((prevState: State) => {
                                prevState.kline.push(kline)
                                return {
                                    kline: [...prevState.kline]
                                }
                            })
                        }
                    }
                }
            }
        })
    }

    onSwitchSymbol (token: string, market: string): void  {
        this.getKline(token, market, '1')
    }

    componentDidMount(): void {
        const { query } = this.props.router
        let token: string = (query && query.token ? query.token : defaultSymbol.TOKEN) as string
        let market: string = (query && query.market ? query.market : defaultSymbol.Market) as string
        this.getKline(token , market, '1')
        this.initSocket(token , market)
    }

    componentDidUpdate(prevProps: Props): void {
        const { query: prevQuery } = prevProps.router
        const { query } = this.props.router
        let prevToken: string = (prevQuery && prevQuery.token ? prevQuery.token : defaultSymbol.TOKEN) as string
        let prevMarket: string = (prevQuery && prevQuery.market ? prevQuery.market : defaultSymbol.Market) as string
        let token: string = (query && query.token ? query.token : defaultSymbol.TOKEN) as string
        let market: string = (query && query.market ? query.market : defaultSymbol.Market) as string
        if (prevToken !== token || prevMarket !== market) {
            this.getKline(token , market, '1')
            if (this.io) {
                this.io.emit('bcex-join', JSON.stringify({
                    r: [{
                        n: 'exchange-brief-quotes',
                        f: false
                    }],
                    market,
                    token
                }))
            }
        }
    }

    componentWillUnmount(): void {
		if (this.io) {
			this.io.close()
		}
	}

    render(): ReactNode {
        return (
            <div>
				kline
                <div>
                    <Link href={{ pathname: '/kline', query: { token: 'BTC', market: 'USDT' }}} as="/kline/BTC_USDT"><a>BTC_USDT</a></Link>
                    <Link href={{ pathname: '/kline', query: { token: 'ETH', market: 'USDT' }}} as="/kline/ETH_USDT"><a>ETH_USDT</a></Link>
                    <Link href={{ pathname: '/kline', query: { token: 'LTC', market: 'USDT' }}} as="/kline/LTC_USDT"><a>LTC_USDT</a></Link>
                    <Link href={{ pathname: '/kline', query: { token: 'EOS', market: 'USDT' }}} as="/kline/EOS_USDT"><a>EOS_USDT</a></Link>
                    <button onClick={() => {this.onSwitchSymbol('BTC', 'USDT')}}>BTC_USDT</button>
                    <button onClick={() => {this.onSwitchSymbol('ETH', 'USDT')}}>ETH_USDT</button>
                    <button onClick={() => {this.onSwitchSymbol('LTC', 'USDT')}}>LTC_USDT</button>
                    <button onClick={() => {this.onSwitchSymbol('EOS', 'USDT')}}>EOS_USDT</button>
                </div>
                <Kline 
                    token={this.state.token}
                    market={this.state.market}
                    interval={this.state.interval}
                    kline={this.state.kline}
                    getKline={this.getKline}/>
			</div>
        )
    }
}))
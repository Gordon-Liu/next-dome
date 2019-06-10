import { Component, MouseEventHandler } from 'react'
import dynamic from 'next/dynamic'
import { withApi } from '~/api'
import { ApiProps } from '~/interface'

const Kline = dynamic(import('~/components/Kline'), {
	ssr: false
})


interface Props extends ApiProps {
}

interface State {
    kline: Array<any>
    symbol: string
}


export default withApi(class extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props)
        this.state = {
            kline: [],
            symbol: 'BTC_USDT'
        }
    }
    
    componentDidMount() {
        this.getKline('BTC', 'USDT', 1)
    }

    getKline = async (token: string, market: string, timeType: number): Promise<void> => {
        let res = await this.props.api.rt.kline<State['kline']>({
            token,
            market,
            timeType
        })
        this.setState({
            symbol: `${token}_${market}`,
            kline: res.data
        })
    }

    onSwitchSymbol (token: string, market: string): void  {
        this.getKline(token, market, 1)
    }

    render() {
        return (
            <div>
				kline
                <div>
                    <button onClick={() => {this.onSwitchSymbol('BTC', 'USDT')}}>BTC_USDT</button>
                    <button onClick={() => {this.onSwitchSymbol('ETH', 'USDT')}}>ETH_USDT</button>
                    <button onClick={() => {this.onSwitchSymbol('LTC', 'USDT')}}>LTC_USDT</button>
                    <button onClick={() => {this.onSwitchSymbol('EOS', 'USDT')}}>EOS_USDT</button>
                </div>
                <Kline 
                    symbol={this.state.symbol}
                    kline={this.state.kline}
                    getKline={this.getKline}/>
			</div>
        )
    }
})
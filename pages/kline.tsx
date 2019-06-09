import { Component } from 'react'
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
}


export default withApi(class extends Component<Props, State> {
    async componentDidMount() {
        let res = await this.props.api.rt.kline<State['kline']>({
            token: 'BTC',
            market: 'USDT',
            timeType: 1
        })
        this.setState({
            kline: res.data
        })
    }
    render() {
        return (
            <div>
				kline
				<Kline/>
			</div>
        )
    }
})
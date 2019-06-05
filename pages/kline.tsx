import { Component } from 'react'
import dynamic from 'next/dynamic'

const Kline = dynamic(import('~/components/Kline'), {
	ssr: false
})


interface Props {

}

interface State {

}


export default class extends Component<Props, State> {

    render() {
        return (
            <div>
				kline
				<Kline/>
			</div>
        )
    }
}
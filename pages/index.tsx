import Link from 'next/link'
import { Component } from 'react'
import css from '~/styles/home.scss'
import { Context, ApiProps, RouterProps1 } from '~/interface'
import { withApi } from '~/api'
import { withRouter, WithRouterProps } from 'next/router'

interface IProps {
    name: string
    tickers: any
}

interface Props extends IProps, ApiProps {}

// type PW = Props & WithRouterProps



interface State {
    count: number
}

export default withApi<Props, IProps>(withRouter<Props>(
    class extends Component<Props & WithRouterProps, State> {
        static async getInitialProps(context: Context) {
            const { api } = context
            let tickers = {
                main: {}
            }
            let res = await api.market.tickers()
            console.log(res)
            if (res.code === 0) {
                tickers = res.data
            }
            
            return {
                name: '房贷首付',
                tickers: tickers
            }
        }

        constructor(props: Props & WithRouterProps) {
            super(props)
            console.log(this.props)
            this.state = {
                count: 0
            }
        }

        componentDidMount() {
            // if (this.props.router) {
                console.log(this.props.router)
                let { router } = this.props
                console.log(router && router.pathname)
            // }
            
            // setInterval(() => {
            //     this.setState({
            //         count: this.state.count + 1
            //     })
            // }, 1000)
        }

        render() {
            const keys = Object.keys(this.props.tickers.main)
            const list = keys.map((key: string) => {
                const items = this.props.tickers.main[key].map((item: any) => (
                    <li key={item.token}>{item.token_as}/{item.market_as}</li>
                ))
                return (
                    <ul key={key}>{items}</ul>
                )
            })        

            return (
                <div>
                    Hellow { this.props.name }
                    <Link href={{pathname: '/help'}}>
                        <a>帮助</a>
                    </Link>
                    <Link prefetch href={{pathname: '/about'}}>
                        <a>关于</a>
                    </Link>
                    <div>
                        {this.state.count}
                    </div>
                    <div>
                        {list}
                    </div>
                    <style jsx>{ css }</style>
                    <style jsx>{`
                        div {
                            color: red;
                        }
                    `}</style>
                </div>
            )
        }
    }
))


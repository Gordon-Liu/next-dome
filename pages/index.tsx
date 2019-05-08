import Link from 'next/link'
import { Component } from 'react'
import css from '~/styles/home.scss'
import { Context, ApiProps, RouterProps } from '~/interface'
import { withApi } from '~/api'
import { withRouter } from 'next/router'

interface IProps {
    name: string
    tickers: any
}

interface Props extends IProps, ApiProps, RouterProps{}

interface State {}

export default withRouter(withApi<Props, IProps>(
    class extends Component<Props, State> {
        static async getInitialProps(context: Context) {
            const { api } = context
            let tickers = {
                main: {}
            }
            let res = await api.market.tickers()
            if (res.code === 0) {
                tickers = res.data
            }
            
            return {
                name: '房贷首付',
                tickers: tickers
            }
        }

        // constructor(props: Props) {
        //     super(props)
        // }

        componentDidMount() {
            console.log(this.props.router.pathname)
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


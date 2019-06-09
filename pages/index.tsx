import Link from 'next/link'
import { withRouter } from 'next/router'
import { Component } from 'react'
import { connect } from 'react-redux'
import { withApi } from '~/api'
import { ApiProps, RouterProps, Context } from '~/interface'
import { StoreState } from '~/store'
import { updateSex } from '~/store/user/actions'
import { UserState } from '~/store/user/types'
import css from '~/styles/home.scss'

interface IProps {
    name: string
    tickers: any
}

interface Props extends IProps, ApiProps, RouterProps{
    user: UserState
    updateSex: typeof updateSex
}

interface State {
    count: number
}

export default connect((state: StoreState) => ({
    user: state.user
}), {
    updateSex
})(withRouter(withApi(
    class extends Component<Props, State> {
        static async getInitialProps(context: Context) {
            // const { api, store, pathname } = context
            console.log(context)
            let tickers = {
                main: {}
            }
            // let res = await api.market.tickers()
            // console.log(res)
            // if (res.code === 0) {
            //     tickers = res.data
            // }
            
            return {
                name: '房贷首付',
                tickers: tickers
            }
        }

        constructor(props: Props) {
            super(props)
            this.state = {
                count: 0
            }
        }

        async componentDidMount() {
            console.log(this.props)
            let res = await this.props.api.market.tickers()
            console.log(res)
        }

        render() {
            console.log(this.props.router)
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
                <div className="home">
                    Hellow { this.props.name }
                    <Link href={{pathname: '/help'}}>
                        <a>帮助</a>
                    </Link>
                    <Link prefetch href={{pathname: '/about'}}>
                        <a>关于</a>
                    </Link>
                    <Link href={{pathname: '/kline'}}>
                        <a>KLINE</a>
                    </Link>
                    <div>
                        {
                            this.props.user.sex === 0 ? '女' : '男'
                        }
                        <button onClick={() => {this.props.updateSex(this.props.user.sex === 0 ? 1 : 0)}}>切换</button>
                    </div>
                    <div>
                        {this.state.count}
                    </div>
                    <div>
                        {list}
                    </div>
                    <style jsx>{ css }</style>
                    <style jsx>{`
                        div {
                            color: green;
                            a {
                                color: #000;
                            }
                        }
                    `}</style>
                </div>
            )
        }
    }
)))


import Link from 'next/link'
import { Component } from 'react'
import { withRouter } from 'next/router'
import { connect } from 'react-redux'

import { Context, ApiProps, RouterPropsType } from '~/interface'
import { withApi } from '~/api'
import { StoreState } from '~/store'
import { updateSex } from '~/store/user/actions'
import { UserState } from '~/store/user/types'
import css from '~/styles/home.scss'

interface IProps {
    name: string
    tickers: any
}

interface Props extends IProps, ApiProps {
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
})(withRouter<RouterPropsType<Props>>(withApi<RouterPropsType<Props>, IProps>(
    class extends Component<RouterPropsType<Props>, State> {
        static async getInitialProps(context: Context) {
            const { api, store, pathname } = context
            console.log(pathname)
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

        constructor(props: RouterPropsType<Props>) {
            super(props)
            this.state = {
                count: 0
            }
        }

        componentDidMount() {
            console.log(this.props)
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
                            color: red;
                        }
                    `}</style>
                </div>
            )
        }
    }
)))


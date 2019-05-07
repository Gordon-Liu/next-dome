import Link from 'next/link'
import React from 'react'
import css from '~/styles/home.scss'
import { Context } from '~/interface'


interface props {
    name: string,
    tickers: any
}

export default class extends React.Component<props, {}> {
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

    render() {
        // console.log(this.props.tickers.main, '---------------------------------')
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


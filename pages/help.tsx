import Link from 'next/link'
import React from 'react'


interface context {
    req: Request
    res: Response
    pathname: string
    query: object
    asPath: string
    jsonPageRes: object
    err: Error
}

interface props {
    name: string
}

export default class extends React.Component<props, {}> {
    static async getInitialProps(context: context) {
        console.log(context)
        return {
            name: '帮助'
        }
    }

    render() {
        return (
            <div className="help-j">
                Hellow { this.props.name }
                <Link href="/"><a className="a">首页</a></Link>
                <input className="in" placeholder="dsadasdasd"/>
                <style jsx>{`
                    .help-j {
                        display: flex;
                        color: green;
                        transition: 1s;
                        border-radius: 4px;
                        box-sizing: border-box;
                        .in {
                            ::placeholder {
                                color: red;
                            }
                        } 
                    }
                `}</style>
            </div>
        )
    }
}

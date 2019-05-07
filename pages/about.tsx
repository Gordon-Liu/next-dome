import Link from 'next/link'
import style from '~/styles/about.scss'
import css from 'styled-jsx/css'

const about = css`
    .about1 {
        background-color: red;
        color: #fff;
        font-size: 20px;
        transition: 1s;
        .a {
            background-color: #fff;
        }
    }
`
export default () => (
    <div className="about about1">
        About
        <Link href="/help">
            <a className="a">Help</a>
        </Link>
        <style jsx>{style}</style>
        <style jsx>{about}</style>
        <style jsx>{`
            .about {
                font-size: 90px;
                transition: 1s;
            }    
        `}</style>
    </div>
)
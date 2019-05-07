import Document, { Head, Main, NextScript, NextDocumentContext } from 'next/document'

export default class extends Document {
    static async getInitialProps(ctx: NextDocumentContext) {
        const initialProps = await Document.getInitialProps(ctx)
        return { 
            ...initialProps
        }
    }

    render() {
        return (
            <html>
                <Head>

                </Head>
                <body>
                    <Main/>
                    <NextScript />
                </body>
            </html>
        )
    }
}

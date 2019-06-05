import { PureComponent } from 'react'

import {
	widget,
	ChartingLibraryWidgetOptions,
	LanguageCode,
	IChartingLibraryWidget,
} from 'tradingview'

interface Props {
    symbol: ChartingLibraryWidgetOptions['symbol']
	interval: ChartingLibraryWidgetOptions['interval']

	// BEWARE: no trailing slash is expected in feed URL
    datafeedUrl: string
    locale: ChartingLibraryWidgetOptions['locale']
	libraryPath: ChartingLibraryWidgetOptions['library_path']
	chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url']
	chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version']
	clientId: ChartingLibraryWidgetOptions['client_id']
	userId: ChartingLibraryWidgetOptions['user_id']
	fullscreen: ChartingLibraryWidgetOptions['fullscreen']
	autosize: ChartingLibraryWidgetOptions['autosize']
	studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides']
	containerId: ChartingLibraryWidgetOptions['container_id']
}

interface State {

}


export default class extends PureComponent<Props, State> {
    private tvWidget: IChartingLibraryWidget | null = null

    public static defaultProps: Props = {
		symbol: 'AAPL',
		interval: 'D',
		containerId: 'tv_chart_container',
		datafeedUrl: 'https://demo_feed.tradingview.com',
        libraryPath: '/static/tradingview/charting_library/',
        locale: 'en',
		chartsStorageUrl: 'https://saveload.tradingview.com',
		chartsStorageApiVersion: '1.1',
		clientId: 'tradingview.com',
		userId: 'public_user_id',
		fullscreen: false,
		autosize: true,
		studiesOverrides: {},
	}

    componentDidMount() {
		if (process.browser) {
			console.log(widget, '-----------------------------------')
		}
        
        const widgetOptions: ChartingLibraryWidgetOptions = {
			symbol: this.props.symbol as string,
			// BEWARE: no trailing slash is expected in feed URL
			// tslint:disable-next-line:no-any
			datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(this.props.datafeedUrl),
			interval: this.props.interval as ChartingLibraryWidgetOptions['interval'],
			container_id: this.props.containerId as ChartingLibraryWidgetOptions['container_id'],
			library_path: this.props.libraryPath as string,

			locale: this.props.locale || 'en',
			disabled_features: ['use_localstorage_for_settings'],
			enabled_features: ['study_templates'],
			charts_storage_url: this.props.chartsStorageUrl,
			charts_storage_api_version: this.props.chartsStorageApiVersion,
			client_id: this.props.clientId,
			user_id: this.props.userId,
			fullscreen: this.props.fullscreen,
			autosize: this.props.autosize,
			studies_overrides: this.props.studiesOverrides,
        }
        
        const tvWidget = new widget(widgetOptions)
        this.tvWidget = tvWidget
        
        tvWidget.onChartReady(() => {
			const button = tvWidget.createButton()
			button.setAttribute('title', 'Click to show a notification popup')
			button.setAttribute('class', 'apply-common-tooltip')
			button.addEventListener('click', () => tvWidget.showNoticeDialog({
					title: 'Notification',
					body: 'TradingView Charting Library API works correctly',
					callback: () => {
						console.log('Noticed!')
					},
				}));
			button.innerHTML = 'Check API'
		})
    }

    componentWillUnmount() {
		if (this.tvWidget !== null) {
			this.tvWidget.remove()
			this.tvWidget = null
		}
	}

    render() {
        return (
            <div id={ this.props.containerId }>kline</div>
        )
    }
}
import { PureComponent, Fragment } from 'react'

import {
	widget,
	ChartingLibraryWidgetOptions,
	// LanguageCode,
	IChartingLibraryWidget,
} from 'tradingview'

import {
	UDFCompatibleDatafeed
} from './datafeeds/udf-compatible-datafeed'

interface Props {
	debug: ChartingLibraryWidgetOptions['debug']
    symbol: ChartingLibraryWidgetOptions['symbol']
	interval: ChartingLibraryWidgetOptions['interval']
	containerId: ChartingLibraryWidgetOptions['container_id']

	// BEWARE: no trailing slash is expected in feed URL
    // datafeedUrl: string
    locale: ChartingLibraryWidgetOptions['locale']
	libraryPath: ChartingLibraryWidgetOptions['library_path']
	chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url']
	chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version']
	clientId: ChartingLibraryWidgetOptions['client_id']
	userId: ChartingLibraryWidgetOptions['user_id']
	fullscreen: ChartingLibraryWidgetOptions['fullscreen']
	autosize: ChartingLibraryWidgetOptions['autosize']
	drawingsAccess: ChartingLibraryWidgetOptions['drawings_access'],
	studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides']
	overrides: ChartingLibraryWidgetOptions['overrides']
}

interface State {

}


export default class extends PureComponent<Partial<Props>, State> {
    private tvWidget: IChartingLibraryWidget | null = null

    public static defaultProps: Props = {
		debug: process.env.NODE_ENV !== 'production',
		symbol: 'AAPL',
		interval: '1',
		containerId: 'tv_chart_container',
		// datafeedUrl: 'https://demo_feed.tradingview.com',
        libraryPath: '/static/tradingview/charting_library/',
        locale: 'en',
		chartsStorageUrl: 'https://saveload.tradingview.com',
		chartsStorageApiVersion: '1.1',
		clientId: 'tradingview.com',
		userId: 'public_user_id',
		fullscreen: false,
		autosize: true,
		drawingsAccess: {
			type: 'black',
			tools: [{
				name: 'Regression Trend'
			}]
		},
		studiesOverrides: {
			'volume.volume.color.0': 'rgba(213, 89, 89, .7)',
			'volume.volume.color.1': 'rgba(98, 195, 120, .7)'
		},
		overrides: {
			// 处理指标 ＋ — 效果
			// 'paneProperties.legendProperties.showLegend': false,
			// 'paneProperties.legendProperties.showStudyArguments': true,
			// 'paneProperties.legendProperties.showStudyTitles': true,
			// 'paneProperties.legendProperties.showStudyValues': true,
			// 'paneProperties.legendProperties.showSeriesTitle': true,
			// 'paneProperties.legendProperties.showSeriesOHLC': true,
			//    蜡烛样式
			'mainSeriesProperties.candleStyle.upColor': '#62C378',
			'mainSeriesProperties.candleStyle.downColor': '#D55959',
			'mainSeriesProperties.candleStyle.borderUpColor': '#62C378',
			'mainSeriesProperties.candleStyle.borderDownColor': '#D55959',
			'mainSeriesProperties.candleStyle.wickUpColor': '#62C378',
			'mainSeriesProperties.candleStyle.wickDownColor': '#D55959',
			// 背景色
			'paneProperties.background': '#1F293A',
			// 竖直网格线颜色
			'paneProperties.vertGridProperties.color': 'rgba(148, 171, 192,0.1)',
			// 水平网格线颜色
			'paneProperties.horzGridProperties.color': 'rgba(148, 171, 192,0.1)',
			// 十指光标颜色
			'paneProperties.crossHairProperties.color': '#4A5F78',
			// 坐标轴线颜色
			'scalesProperties.lineColor': '#4A5F78',
			// 坐标轴文本颜色
			'scalesProperties.textColor': '#94ABC0',
			// 分时图
			'mainSeriesProperties.areaStyle.color1': 'rgba(0, 153, 195, .1)',
			'mainSeriesProperties.areaStyle.color2': 'rgba(0, 153, 195, 0)',
			'mainSeriesProperties.areaStyle.linecolor': 'rgba(0, 153, 195, 1)',
			// 成交量高度设置  large, medium, small, tiny
			'volumePaneSize': 'medium',
			// 调整k线顶部的边距
			'paneProperties.topMargin': 13
		}
	}

    componentDidMount() {        
        const widgetOptions: ChartingLibraryWidgetOptions = {
			symbol: this.props.symbol as string,
			// BEWARE: no trailing slash is expected in feed URL
			// tslint:disable-next-line:no-any
			datafeed: new UDFCompatibleDatafeed('https://demo_feed.tradingview.com'),
			interval: this.props.interval as ChartingLibraryWidgetOptions['interval'],
			container_id: this.props.containerId as ChartingLibraryWidgetOptions['container_id'],
			library_path: this.props.libraryPath as string,

			locale: this.props.locale || 'en',
			charts_storage_url: this.props.chartsStorageUrl,
			charts_storage_api_version: this.props.chartsStorageApiVersion,
			client_id: this.props.clientId,
			user_id: this.props.userId,
			fullscreen: this.props.fullscreen,
			autosize: this.props.autosize,
			drawings_access: this.props.drawingsAccess,
			studies_overrides: this.props.studiesOverrides,
			overrides: this.props.overrides,
			disabled_features: [
				'use_localstorage_for_settings',
				'header_resolutions',
				'header_symbol_search',
				'header_chart_type',
				'header_compare',
				'header_undo_redo',
				'header_screenshot',
				'header_saveload',
				'study_templates', // 模板
				'timeframes_toolbar',
				'pane_context_menu',
				'volume_force_overlay',
			],
			enabled_features: [
				'keep_left_toolbar_visible_on_small_screens',
				'adaptive_logo',
				'show_dom_first_time',
				'side_toolbar_in_fullscreen_mode',
				'hide_left_toolbar_by_default',
				'hide_last_na_study_output', // 隐藏成交量n/a
			]
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
			<Fragment>
				<div id={ this.props.containerId }/>
				<style jsx>{`
					#tv_chart_container {
						height: 500px
					}
				`}</style>
			</Fragment>
        )
    }
}
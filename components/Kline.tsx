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

import {
	DataProvider
} from './datafeeds/history-provider'

interface ChartContainerProps {
    // symbol: ChartingLibraryWidgetOptions['symbol']
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

interface Props extends Partial<ChartContainerProps> {
	kline: Array<DataProvider>
	getKline(token: string, market: string, interval: string): Promise<void>
	interval: string
	token: string
	market: string

}

interface State {
}

interface IntervalButton {
	title: string
	interval: string
	type: number
}

export default class extends PureComponent<Props, State> {
    private tvWidget: IChartingLibraryWidget | null = null

	private intervalButton: Array<IntervalButton> = [
		{
			title: 'realtime',
			interval: '1',
			type: 3
		},
		{
			title: '1min',
			interval: '1',
			type: 1
		},
		{
			title: '5min',
			interval: '5',
			type: 1
		},
		{
			title: '15min',
			interval: '15',
			type: 1
		},
		{
			title: '30min',
			interval: '30',
			type: 1
		},
		{
			title: '1hour',
			interval: '60',
			type: 1
		},
		{
			title: '4hour',
			interval: '240',
			type: 1
		},
		{
			title: '6hour',
			interval: '360',
			type: 1
		},
		{
			title: '1day',
			interval: '1D',
			type: 1
		},
		{
			title: '1week',
			interval: '1W',
			type: 1
		},
		{
			title: '1mon',
			interval: '1M',
			type: 1
		}
	]

	private datafeed!: UDFCompatibleDatafeed

    public static defaultProps: ChartContainerProps = {
		// symbol: 'BTC_USDT',
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

	constructor(props: Props) {
        super(props)
    }

	get symbol() {
		return `${this.props.token}_${this.props.market}`
	} 

	removeAllClassName(target: HTMLElement | null, className: string): void {
		if (target && target.parentElement) {
			let all: HTMLCollection = target.parentElement.children
			for (let i = 0; i < all.length; i++) {
				let array: Array<string> = all[i].className.split(' ').filter(item => !!item && item !== className)
				if (array && array.length > 0) {
					all[i].className = array.join(' ')
				}
			}
		}
	}

	addClassName(target: HTMLElement | null, className: string): void {
		if (target) {
			let old: string = target.className
			if (old) {
				let array: Array<string> = old.split(' ')
				array = array.filter((item: string) => !!item)
				if (array && array.length > 0) {
					array.push(className)
					target.className = array.join(' ')
				} else {
					target.className = className
				}
			} else {
				target.className = className
			}
		}
	}

	getKline = (): Promise<Array<DataProvider>> => {
		return new Promise((resolve: (result: Array<DataProvider>) => void, reject: (reason: string) => void) => {
			if (typeof this.props.kline === 'string') {
				reject(this.props.kline)
			} else {
				const timeoutKline = (): void => {
					if (this.props.kline.length === 0) {
						setTimeout(() => {
							timeoutKline()
						}, 10)
					} else {
						resolve(this.props.kline)
					}
				}
				timeoutKline()
			}
		})
	}

	componentDidUpdate(prevProps: Props) {
		if (this.tvWidget && this.datafeed) {
			if (
				prevProps.token === this.props.token && 
				prevProps.market === this.props.market
			) {
				// K线发生变化
				if (prevProps.kline.length > 0) {
					if (prevProps.interval === this.props.interval) {
						this.datafeed.updateData()
					} else {			
						this.tvWidget.chart().setResolution(this.props.interval, () => {})
					}
				}
			} else {
				// 交易对发生变化
				this.tvWidget.setSymbol(this.symbol, this.props.interval, () => {})
			}
		}
	}

    componentDidMount() {  
		this.datafeed = new UDFCompatibleDatafeed(this.getKline)
        const widgetOptions: ChartingLibraryWidgetOptions = {
			// debug: process.env.NODE_ENV !== 'production' as ChartingLibraryWidgetOptions['symbol'],
			symbol: this.symbol as string,
			// BEWARE: no trailing slash is expected in feed URL
			// tslint:disable-next-line:no-any
			datafeed: this.datafeed,
			interval: this.props.interval as ChartingLibraryWidgetOptions['interval'],
			container_id: this.props.containerId as ChartingLibraryWidgetOptions['container_id'],
			library_path: this.props.libraryPath as string,

			locale: this.props.locale || 'en',
			custom_css_url: 'style/style.css',
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
			// 点击左侧工具栏的显示隐藏按钮
			// 学习线
			tvWidget.chart().createStudy('Moving Average', false, false, [5], undefined, {
				'plot.color': '#a699d9'
			});
			tvWidget.chart().createStudy('Moving Average', false, false, [10], undefined, {
				'plot.color': '#6a9acB'
			});
			tvWidget.chart().createStudy('Moving Average', false, false, [30], undefined, {
				'plot.color': '#b27bc2'
			});
			tvWidget.chart().createStudy('Moving Average', false, false, [60], undefined, {
				'plot.color': '#ffbf53'
			});
		})

		tvWidget.headerReady().then(() => {
			this.intervalButton.forEach((item: IntervalButton)=> {
				const button: HTMLElement = tvWidget.createButton()
				button.addEventListener('click', async () => {
					if (
						button.parentElement &&
						button.parentElement.parentElement
					) {
						this.removeAllClassName(button.parentElement.parentElement, 'active')
						this.addClassName(button.parentElement.parentElement, 'active')

						if (item.interval !== this.props.interval) {
							await this.props.getKline(this.props.token, this.props.market, item.interval)
						}
						tvWidget.chart().setChartType(item.type)
					}
					
				})
				button.innerHTML = item.title

				if (
					item.interval === this.props.interval &&
					item.type === 1
				) {
					if (
						button.parentElement &&
						button.parentElement.parentElement
					) {
						this.addClassName(button.parentElement.parentElement, 'active')
					}
				}
			})
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
					#${this.props.containerId} {
						height: 500px
					}
				`}</style>
			</Fragment>
        )
    }
}
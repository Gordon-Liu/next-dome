import {
	Bar,
	HistoryMetadata,
	LibrarySymbolInfo,
} from 'tradingview/charting_library/datafeed-api'
import { getErrorMessage } from './helpers'

export interface DataProvider {
	timestamp: number
	c_price: string
	o_price: string
	max_price: string
	min_price: string
	amount: string
}

export type DataProviderFunction = () => Promise<Array<DataProvider>>

interface LastDataProvider {
	symbol?: string
	interval?: string
	dataProvider?: DataProvider
}

export interface GetBarsResult {
	bars: Bar[]
	meta: HistoryMetadata
}

export class HistoryProvider {
	private _lastDataProvider: LastDataProvider = {}

	private readonly _dataProvider: DataProviderFunction

	public constructor(dataProvider: DataProviderFunction ) {
		this._dataProvider = dataProvider
	}

	public getBars(symbolInfo: LibrarySymbolInfo, resolution: string, _rangeStartDate: number, _rangeEndDate: number): Promise<GetBarsResult> {
		
		// const dataProvider: Array<DataProvider> | string = this._dataProvider()
		return new Promise((resolve: (result: GetBarsResult) => void, reject: (reason: string) => void) => {
			this._dataProvider().then((dataProvider: Array<DataProvider>) => {
				if (typeof dataProvider === 'string') {
					reject(dataProvider)
					return
				}
	
				const bars: Bar[] = []
				const meta: HistoryMetadata = {
					noData: false,
				}
	
				if (dataProvider.length === 0) {
					meta.noData = true
					resolve({
						bars,
						meta
					})
					return
				}
	
				const lastDataProvider =  dataProvider[dataProvider.length - 1]
				if (
					!this._lastDataProvider.symbol ||
					!this._lastDataProvider.interval ||
					!this._lastDataProvider.dataProvider || 
					this._lastDataProvider.symbol !== symbolInfo.ticker ||
					this._lastDataProvider.interval !== resolution ||
					lastDataProvider.timestamp !== this._lastDataProvider.dataProvider.timestamp ||
					lastDataProvider.c_price !== this._lastDataProvider.dataProvider.c_price ||
					lastDataProvider.o_price !== this._lastDataProvider.dataProvider.o_price ||
					lastDataProvider.max_price !== this._lastDataProvider.dataProvider.max_price ||
					lastDataProvider.min_price !== this._lastDataProvider.dataProvider.min_price ||
					lastDataProvider.amount !== this._lastDataProvider.dataProvider.amount               
				) {
					const offset = new Date().getTimezoneOffset() * 60 * 1000
					dataProvider.forEach(item => {
						bars.push({
							time: item.timestamp - offset,
							close: Number(item.c_price),
							open: Number(item.o_price),
							high: Number(item.max_price),
							low: Number(item.min_price),
							volume: Number(item.amount)
						})
					})
				}
	
				if (bars.length === 0) {
					meta.noData = true
					resolve({
						bars,
						meta
					})
					return
				}
	
				this._lastDataProvider.symbol = symbolInfo.ticker
				this._lastDataProvider.interval = resolution
				this._lastDataProvider.dataProvider = lastDataProvider
				resolve({
					bars,
					meta
				})
			}).catch((reason?: string | Error) => {
				const reasonString = getErrorMessage(reason);
				console.warn(`HistoryProvider: getBars() failed, error=${reasonString}`);
				reject(reasonString);
			})
		})
	}
}

import {
	DatafeedConfiguration,
	ErrorCallback,
	HistoryCallback,
	IDatafeedChartApi,
	IExternalDatafeed,
	LibrarySymbolInfo,
	OnReadyCallback,
	ResolutionString,
	ResolveCallback,
	SearchSymbolResultItem,
	SubscribeBarsCallback,
	SearchSymbolsCallback,
} from 'tradingview/charting_library/datafeed-api'

import {
	logMessage
} from './helpers'

import {
	GetBarsResult,
	HistoryProvider,
	DataProviderFunction,
} from './history-provider'

import { DataPulseProvider } from './data-pulse-provider'

export interface UdfCompatibleConfiguration extends DatafeedConfiguration {
	// tslint:disable
	supports_search?: boolean
	supports_group_request?: boolean
	// tslint:enable
}

export interface ResolveSymbolResponse extends LibrarySymbolInfo {
	s: undefined
}

// it is hack to let's TypeScript make code flow analysis
export interface UdfSearchSymbolsResponse extends Array<SearchSymbolResultItem> {
	s?: undefined
}

export enum Constants {
	SearchItemsLimit = 30,
}

/**
 * This class implements interaction with UDF-compatible datafeed.
 * See UDF protocol reference at https://github.com/tradingview/charting_library/wiki/UDF
 */
export class UDFCompatibleDatafeedBase implements IExternalDatafeed, IDatafeedChartApi {
	protected _configuration: UdfCompatibleConfiguration = defaultConfiguration()
	private readonly _configurationReadyPromise: Promise<void>

	private readonly _historyProvider: HistoryProvider
	private readonly _dataPulseProvider: DataPulseProvider

	protected constructor(dataProvider: DataProviderFunction) {
		this._historyProvider = new HistoryProvider(dataProvider)

		this._dataPulseProvider = new DataPulseProvider(this._historyProvider)

		this._configurationReadyPromise = Promise.resolve().then(() => {
			this._setupWithConfiguration(defaultConfiguration())
		})
	}

	public onReady(callback: OnReadyCallback): void {
		this._configurationReadyPromise.then(() => {
			callback(this._configuration);
		})
	}

	public searchSymbols(_userInput: string, _exchange: string, _symbolType: string, _onResult: SearchSymbolsCallback): void {
		
	}

	public resolveSymbol(symbolName: string, onResolve: ResolveCallback, _: ErrorCallback): void {
		logMessage('Resolve requested')

		const resolveRequestStartTime = Date.now()
		function onResultReady(symbolInfo: LibrarySymbolInfo): void {
			logMessage(`Symbol resolved: ${Date.now() - resolveRequestStartTime}ms`)
			onResolve(symbolInfo)
		}

		const symbolInfo: LibrarySymbolInfo = {
			ticker: symbolName,
			name: symbolName,
			base_name: ['' + ':' + symbolName],
			full_name: symbolName,
			listed_exchange: '',
			exchange: '',
			description: symbolName,
			has_intraday: true,
			has_no_volume: false,
			minmov: 1,
			minmove2: undefined,
			fractional: undefined,
			pricescale: Math.pow(10, 2),
			type: '数字货币',
			session: '24x7',
			timezone: 'Etc/UTC',
			supported_resolutions: ['1', '5', '15', '30', '60', '240', '360', '1D', '1W', '1M'],
			force_session_rebuild: false,
			has_daily: true,
			intraday_multipliers: ['1', '5', '15', '30', '60', '240', '360', '1D', '1W', '1M'],
			has_weekly_and_monthly: true,
			has_empty_bars: false,
			volume_precision: 0,
		}

		Promise.resolve().then(() => {
			onResultReady(symbolInfo)
		})
	}

	public getBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, rangeStartDate: number, rangeEndDate: number, onResult: HistoryCallback, onError: ErrorCallback): void {
		this._historyProvider.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate)
			.then((result: GetBarsResult) => {
				onResult(result.bars, result.meta)
			})
			.catch(onError)
	}

	public subscribeBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, onTick: SubscribeBarsCallback, listenerGuid: string, onResetCacheNeededCallback: () => void): void {
		this._dataPulseProvider.subscribeBars(symbolInfo, resolution, onTick, listenerGuid)
	}

	public unsubscribeBars(listenerGuid: string): void {
		this._dataPulseProvider.unsubscribeBars(listenerGuid)
	}

	private _setupWithConfiguration(configurationData: UdfCompatibleConfiguration): void {
		this._configuration = configurationData

		if (configurationData.exchanges === undefined) {
			configurationData.exchanges = []
		}

		logMessage(`UdfCompatibleDatafeed: Initialized with ${JSON.stringify(configurationData)}`)
	}

	public updateData(): void {
		this._dataPulseProvider.updateData()
	}
}

function defaultConfiguration(): UdfCompatibleConfiguration {
	return {
		supports_search: false,
		supports_group_request: false,
		supported_resolutions: ['1', '5', '15', '30', '60', '240', '360', '1D', '1W', '1M'],
		supports_marks: false,
		supports_timescale_marks: false,
	}
}

import { UDFCompatibleDatafeedBase } from './udf-compatible-datafeed-base'
import { DataProviderFunction } from './history-provider'

export class UDFCompatibleDatafeed extends UDFCompatibleDatafeedBase {
	public constructor(dataProvider: DataProviderFunction) {
		super(dataProvider)
	}
}

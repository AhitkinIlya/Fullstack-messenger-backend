import { IResult } from 'ua-parser-js'

export interface LocationInfo {
	country: string
	city: string
}

export interface DeviceInfo {
	browser: IResult['browser']
	os: IResult['os']
}

export interface SessionMetadata {
	location: LocationInfo
	device: DeviceInfo
}

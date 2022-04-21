export type DigitalChannelsType = boolean[];
export type BitStateType = undefined | 0.4 | -0.4;
export type BitStateIndexType = 0 | 1 | 2 | 3;
export type BitNumberType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type TimestampType = undefined | number;
export type AmpereStateType = undefined | number;

/**
 * Represents a given state for a given digital channel
 * @var {Timestamp} timestamp: the corresponding timestamp of the given bit state: x-value in the Chart.
 * @var {BitState} bitState: the state of the digital channel in the given time stamp: y-value in the Chart.
 */
export interface DigitalChannelState {
    x: TimestampType;
    y: BitStateType;
}

/**
 * Represents all States for a given digital channel
 * @var {DigitalChannelState[]} mainLine: is the dominating state of the digital channel in a given time interval
 * @var {DigitalChannelState[]} uncertaintyLine: is the ...TODO:
 */
export interface DigitalChannelStates {
    mainLine: DigitalChannelState[];
    uncertaintyLine: DigitalChannelState[];
}

export interface AmpereState {
    x: TimestampType;
    y: AmpereStateType;
}

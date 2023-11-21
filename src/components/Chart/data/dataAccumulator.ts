/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    DataManager,
    indexToTimestamp,
    numberOfDigitalChannels,
    timestampToIndex,
} from '../../../globals';
import bitDataAccumulator, { BitDataAccumulator } from './bitDataAccumulator';
import { createEmptyArrayWithAmpereState } from './commonBitDataFunctions';
import { AmpereState, DigitalChannelStates } from './dataTypes';
import noOpBitDataProcessor from './noOpBitDataProcessor';

export const calcStats = (begin?: null | number, end?: null | number) => {
    if (begin == null || end == null) {
        return null;
    }

    if (end < begin) {
        [begin, end] = [end, begin];
    }

    const data = DataManager().getData(begin, end);

    let sum = 0;
    let len = 0;
    let max;

    for (let n = 0; n <= data.current.length; n += 1) {
        const v = data.current[n];
        if (!Number.isNaN(v)) {
            if (max === undefined || v > max) {
                max = v;
            }
            sum += v;
            len += 1;
        }
    }
    return {
        average: sum / (len || 1),
        max: max ?? 0,
        delta: end - begin,
    };
};

export interface DataAccumulator {
    ampereLineData: AmpereState[];
    bitDataAccumulator: BitDataAccumulator;
    noOpBitDataProcessor: BitDataAccumulator;
    bitStateAccumulator: number[];

    process: (
        begin: number,
        end: number,
        digitalChannelsToCompute: number[],
        removeZeroValues: boolean,
        len: number,
        windowDuration: number
    ) => {
        ampereLineData: AmpereState[];
        bitsLineData: DigitalChannelStates[];
    };
}

export type DataAccumulatorInitialiser = () => DataAccumulator;
export default (): DataAccumulator => ({
    ampereLineData: createEmptyArrayWithAmpereState(),
    bitDataAccumulator: bitDataAccumulator(),
    /* @ts-expect-error -- Should not really escape this error */
    noOpBitDataProcessor: noOpBitDataProcessor(),
    bitStateAccumulator: new Array(numberOfDigitalChannels),

    process(
        begin,
        end,
        digitalChannelsToCompute,
        removeZeroValues,
        maxNumberOfPoints,
        windowDuration
    ) {
        const bitDataProcessor =
            digitalChannelsToCompute.length > 0
                ? this.bitDataAccumulator
                : this.noOpBitDataProcessor;

        const noOfRawSamples =
            DataManager().getNumberOfSamplesInWindow(windowDuration);

        const numberOfGroupedPoints =
            maxNumberOfPoints === 0
                ? 0
                : Math.ceil(noOfRawSamples / maxNumberOfPoints);

        const timeGroup = indexToTimestamp(numberOfGroupedPoints);

        begin = Math.floor(begin / timeGroup) * timeGroup;
        end = (Math.floor(end / timeGroup) + 1) * timeGroup;

        const data = DataManager().getData(begin, end);

        let mappedIndex = 0;

        bitDataProcessor.initialise(digitalChannelsToCompute);

        for (
            let originalIndex = 0;
            mappedIndex < 2 * maxNumberOfPoints;
            mappedIndex += 1, originalIndex += numberOfGroupedPoints
        ) {
            const timestamp = indexToTimestamp(
                timestampToIndex(
                    begin + indexToTimestamp(originalIndex) + timeGroup / 2
                )
            );

            const k = originalIndex;
            const l = originalIndex + numberOfGroupedPoints;
            let min: number | undefined = Number.MAX_VALUE;
            let max: number | undefined = -Number.MAX_VALUE;

            for (let n = k; n < l; n += 1) {
                let v = data.current[n] ?? NaN;

                if (removeZeroValues && v === 0) {
                    v = NaN;
                }

                if (!Number.isNaN(v)) {
                    if (v > max) max = v;
                    if (v < min) min = v;

                    if (data.bits && n < data.bits.length) {
                        bitDataProcessor.processBits(data.bits[n]);
                    }
                }
            }

            if (min > max) {
                min = undefined;
                max = undefined;
            }

            this.ampereLineData[mappedIndex].x = timestamp;
            this.ampereLineData[mappedIndex].y = min;
            mappedIndex += 1;
            this.ampereLineData[mappedIndex].x = timestamp;
            this.ampereLineData[mappedIndex].y = max;

            if (min !== undefined) {
                bitDataProcessor.processAccumulatedBits(timestamp);
            }
        }

        return {
            ampereLineData: this.ampereLineData.slice(0, mappedIndex),
            bitsLineData: bitDataProcessor.getLineData(),
        };
    },
});

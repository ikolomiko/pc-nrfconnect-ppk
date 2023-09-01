/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import BootstrapCollapse from 'react-bootstrap/Collapse';
import Form from 'react-bootstrap/Form';
import { useDispatch, useSelector } from 'react-redux';
import {
    NumberInlineInput,
    Slider,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { updateRegulator } from '../../actions/deviceActions';
import { appState } from '../../slices/appSlice';
import {
    moveVoltageRegulatorVdd,
    voltageRegulatorState,
} from '../../slices/voltageRegulatorSlice';

const VoltageRegulator = () => {
    const dispatch = useDispatch();
    const { vdd, min, maxCap: max } = useSelector(voltageRegulatorState);
    const {
        isSmuMode,
        capabilities: { ppkSetPowerMode },
    } = useSelector(appState);

    const isVoltageSettable = !ppkSetPowerMode || isSmuMode;

    useEffect(() => {
        if (vdd > max) {
            dispatch(moveVoltageRegulatorVdd(max));
        }
    }, [vdd, max, dispatch]);

    return (
        <BootstrapCollapse in={isVoltageSettable}>
            <div className="voltage-regulator">
                <Form.Label htmlFor="slider-vdd">
                    <span className="flex-fill">Set supply voltage to</span>
                    <NumberInlineInput
                        value={vdd}
                        range={{ min, max }}
                        onChange={value =>
                            dispatch(moveVoltageRegulatorVdd(value))
                        }
                        onChangeComplete={() => dispatch(updateRegulator())}
                    />{' '}
                    mV
                </Form.Label>
                <Slider
                    id="slider-vdd"
                    values={[vdd]}
                    range={{ min, max }}
                    onChange={[
                        value => dispatch(moveVoltageRegulatorVdd(value)),
                    ]}
                    onChangeComplete={() => dispatch(updateRegulator())}
                />
            </div>
        </BootstrapCollapse>
    );
};

export default VoltageRegulator;
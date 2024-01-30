/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
// TODO: Remove next line
/* eslint-disable @typescript-eslint/no-explicit-any -- included for conservative refactoring to typescript */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import os from 'os';

import { Capabilities } from '../device/abstractDevice';
import { getPreferredSessionLocation } from '../utils/persistentStore';
import type { RootState } from '.';

interface AppState {
    portName: null | any;
    metadata: any[];
    isSmuMode: boolean;
    deviceRunning: boolean;
    advancedMode: boolean;
    capabilities: Capabilities;
    samplingRunning: boolean;
    isSaveChoiceDialogVisible: boolean;
    isExportDialogVisible: boolean;
    fileLoaded: boolean;
    sessionFolder?: string;
}

const initialState = (): AppState => ({
    portName: null,
    metadata: [],
    isSmuMode: false,
    deviceRunning: false,
    advancedMode: false,
    capabilities: {},
    samplingRunning: false,
    isSaveChoiceDialogVisible: false,
    isExportDialogVisible: false,
    fileLoaded: false,
});

const appSlice = createSlice({
    name: 'app',
    initialState: initialState(),
    reducers: {
        deviceOpenedAction: (
            state,
            action: PayloadAction<{
                capabilities: any;
                portName: any;
            }>
        ) => {
            state.portName = action.payload.portName;
            state.capabilities = action.payload.capabilities;
        },
        deviceClosedAction: () => initialState(),
        setDeviceRunningAction: (
            state,
            action: PayloadAction<{ isRunning: boolean }>
        ) => {
            state.deviceRunning = action.payload.isRunning;
        },
        setPowerModeAction: (
            state,
            action: PayloadAction<{ isSmuMode: boolean }>
        ) => {
            state.isSmuMode = action.payload.isSmuMode;
        },
        toggleSaveChoiceDialog: state => {
            state.isSaveChoiceDialogVisible = !state.isSaveChoiceDialogVisible;
        },
        showExportDialog: state => {
            state.isExportDialogVisible = true;
        },
        hideExportDialog: state => {
            state.isExportDialogVisible = false;
        },
        setFileLoadedAction: (state, action: PayloadAction<boolean>) => {
            state.fileLoaded = action.payload;
        },
        toggleAdvancedModeAction: state => {
            state.advancedMode = !state.advancedMode;
        },
        samplingStartAction: state => {
            state.samplingRunning = true;
        },
        samplingStoppedAction: state => {
            state.samplingRunning = false;
        },
        setSessionRootFolder: (state, action: PayloadAction<string>) => {
            state.sessionFolder = action.payload;
        },
    },
});

export const isSamplingRunning = (state: RootState) =>
    state.app.app.samplingRunning;
export const appState = (state: RootState) => state.app.app;
export const advancedMode = (state: RootState) => state.app.app.advancedMode;
export const deviceOpen = (state: RootState) =>
    Object.keys(state.app.app.capabilities).length > 0;
export const getSessionRootFolder = (state: RootState) =>
    state.app.app.sessionFolder ?? getPreferredSessionLocation(os.tmpdir());

export const {
    deviceOpenedAction,
    deviceClosedAction,
    setDeviceRunningAction,
    setPowerModeAction,
    toggleSaveChoiceDialog,
    showExportDialog,
    hideExportDialog,
    setFileLoadedAction,
    toggleAdvancedModeAction,
    samplingStartAction,
    samplingStoppedAction,
    setSessionRootFolder,
} = appSlice.actions;

export default appSlice.reducer;

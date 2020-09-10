import * as React from 'react';
import { Set } from 'immutable'

export enum StoryFetchStatus {
    Uninitialized = 'uninitialized',
    InProgress = 'in-progress',
    Done = 'done',
    Failed = 'failed'
}

export const StoriesContext = React.createContext({
    storyData: [],
    unlockedSet: Set(),
    getUrl: (x) => null,
    fetchStatus: StoryFetchStatus.Uninitialized,
});

export const LocationContext = React.createContext({
    location: null,
    awaitingLocation: false,
    distance: (x) => { return Infinity; },
    distanceAdjusted: (x) => { return Infinity; }
});

export const ControlsContext = React.createContext({
    requestLocation: () => { },
    refresh: () => { },
    lock: (x) => { },
    unlock: (x) => { },
    clearUnlocks: () => { },
});

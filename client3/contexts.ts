import * as React from 'react';

export enum StoryFetchStatus {
    Uninitialized = 'uninitialized',
    InProgress = 'in-progress',
    Done = 'done',
    Failed = 'failed'
}

export const StoriesContext = React.createContext({
    storyData: [],
    unlockedSet: new Set(),
    fetchStatus: StoryFetchStatus.Uninitialized,
});

export const ControlsContext = React.createContext({
    refresh: () => {},
    lock: (x) => {},
    unlock: (x) => {},
    clearUnlocks: () => {},
});

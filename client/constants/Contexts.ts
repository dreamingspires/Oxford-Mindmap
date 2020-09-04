import * as React from 'react';

export enum StoryFetchStatus {
    Uninitialized = 'uninitialized',
    InProgress = 'in-progress',
    Done = 'done',
    Failed = 'failed'
}

export const StoriesContext = React.createContext({
    storyData: [],
    fetchStatus: StoryFetchStatus.Uninitialized
});


import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native'

import { Card, Icon, Button } from 'react-native-elements'

import { StoriesContext, StoryFetchStatus } from '../contexts'
import { ControlsContext } from '../contexts'

export const SettingsScreen = (props) => {

    const { storyData, unlockedSet, fetchStatus } = useContext(StoriesContext)
    const { refresh, clearUnlocks } = useContext(ControlsContext)

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ScrollView>
                <Card>
                    <Button
                        style={{ flex: 1 }}
                        title="Clear Progress"
                        onPress={clearUnlocks}
                    />
                    <Card.Divider/>
                    <Button
                        style={{ flex: 1 }}
                        loading={fetchStatus === StoryFetchStatus.InProgress}
                        title="Refresh"
                        onPress={refresh}
                    />
                </Card>
            </ScrollView>
        </View>
    );
}

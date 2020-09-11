import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native'
import { StyleSheet } from 'react-native'

import { FlatList, Alert } from 'react-native'
import { ListItem, Avatar, Card, Icon, Button, Text, Divider } from 'react-native-elements'

import { StoriesContext, StoryFetchStatus } from '../contexts'
import { ControlsContext, TriggerContext } from '../contexts'

export const SettingsScreen = (props) => {

    const { storyData, unlockedSet, fetchStatus } = useContext(StoriesContext)
    const { refresh, clearUnlocks } = useContext(ControlsContext)
    const { knownTriggers, blacklist, toggle } = useContext(TriggerContext)

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                <Card>
                    <ListItem
                        bottomDivider
                        onPress={refresh}
                    >
                        <ListItem.Content>
                            <ListItem.Title>Refresh Stories</ListItem.Title>
                        </ListItem.Content>
                        {fetchStatus === StoryFetchStatus.InProgress ? <ActivityIndicator /> : null}
                    </ListItem>
                    <ListItem
                        // bottomDivider
                        onPress={
                            () => Alert.alert("Are you sure?", "This will lock all stories ever unlocked.",
                            [{
                                text: "Cancel"
                            }, {
                                text: "Reset Progress",
                                onPress: clearUnlocks
                            }], { cancelable: true })
                        }
                    >
                        <ListItem.Content>
                            <ListItem.Title>Reset Progress</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                </Card>
                <Card containerStyle={{ marginBottom: 15 }}>
                    <Card.Title>Trigger Filter</Card.Title>
                    {Array.from(knownTriggers.entries()).map(([k, v], index) =>
                        <ListItem
                            key={k}
                            topDivider={index !== 0}
                        >
                            <ListItem.Content>
                                <ListItem.Title>{v}</ListItem.Title>
                            </ListItem.Content>
                            <ListItem.CheckBox
                                checked={!blacklist.has(k)}
                                onPress={() => toggle(k)}
                            />
                        </ListItem>
                    )}
                </Card>
            </ScrollView>
        </View >
    );
}

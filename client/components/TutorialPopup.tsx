import React, { useContext } from 'react'
import { StyleSheet } from 'react-native';
import { View, Text } from 'react-native'
import { Card } from 'react-native-elements'
import { Button, Overlay } from 'react-native-elements';

import { ControlsContext } from '../contexts'


export const makePopup = () => {

    const { settings, setSettings } = useContext(ControlsContext)
    const disable = () => {
        setSettings({ ...settings, tutorial: false })
    }

    return (
        <Overlay
            isVisible={settings.tutorial}
            overlayStyle={{ margin: 20, padding: 0, backgroundColor: "#0000", borderRadius: -1 }}
            onBackdropPress={disable}>
            <Card
                containerStyle={{ margin: 0, borderRadius: -1}}>
                <Card.Title>This city is filled with people's memories and emotions, and now you can read them too!
                </Card.Title>
                <Text>
                    To unlock a story, walk to its location on the map, select it, and press the Unlock button.
                </Text>
                <Card.Divider />
                <Text>
                    Once a story is unlocked, its marker will turn green and it will be added to the Unlocked Stories screen, where you can re-read it as many times as you want.
                </Text>
                <Card.Divider />
                <Text>
                    If you want to filter out stories with particularly triggering themes, go to Settings in the upper right corner.
                </Text>
                <Card.Divider />
                <Text>
                    What about you? Is there a place in Oxford you associate with strong emotion? Tell us your story!
                </Text>
                <Card.Divider />
                <Button type="clear" title="Dismiss" onPress={disable} />
            </Card>
        </Overlay >
    )

}

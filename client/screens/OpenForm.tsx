import React, { useEffect, useState, useContext } from 'react';

import { StyleSheet, Linking } from 'react-native';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { ListItem, Avatar, Card, Icon, Button, Text, Divider } from 'react-native-elements'

import { formUrl } from '../constants'


export const OpenFormScreen = (props) => {

    return (
        <View style={{ flex: 1, margin: 5, alignItems: 'center', justifyContent: 'center' }}>
            <Card>
                <Card.FeaturedSubtitle>
                    <Text>You can submit your own stories, which will be validated and published in this app.</Text>
                </Card.FeaturedSubtitle>
                <Card.Divider />
                <Button
                    title="Open Google Form in the browser."
                    type='outline'
                    onPress={() => {
                        Linking.canOpenURL(formUrl).then(supported => {
                            if (supported) {
                                Linking.openURL(formUrl);
                            } else {
                                console.log("Cannot open URI: " + formUrl);
                            }
                        });
                    }}
                />
            </Card>
        </View>
    );
};


/* keys.json:
{
    "maps_android": "AAAA...AAAA",
    "maps_ios": "BBBB...BBBB"
}
*/
import { maps_android, maps_ios } from './keys.json'

export default ({ config }) => {
    return {
        android: {
            package: "dev.dreamingspires.oxford_mindmap",
            permissions: ["ACCESS_FINE_LOCATION"],
            config: {
                googleMaps: {
                    apiKey: maps_android
                }
            }
        },
        ios: {
            bundleIdentifier: "dev.dreamingspires.oxford-mindmap",
            supportsTablet: true,
            infoPlist: {
                NSLocationWhenInUseUsageDescription: "This app uses location to unlock content based on geographical proximity."
            },
            config: {
                googleMapsApiKey: maps_ios
            }
        },
        extra: {
            form_url: "https://client.dreamingspires.dev/oxford-mindmap/submit-story",
            api_url: "https://client.dreamingspires.dev"
            // api_url: "https://dev.dreamingspires.dev",
        },
        ...config,
    };
};

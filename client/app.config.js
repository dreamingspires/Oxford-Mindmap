
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
            config: {
                googleMaps: {
                    apiKey: maps_android
                }
            }
        },
        ios: {
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

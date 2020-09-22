
/* keys.json:
{
    "maps": "AAAA...AAAA"
}
*/
import { maps } from './keys.json'

export default ({ config }) => {
    return {
        android: {
            config: {
                googleMaps: {
                    apiKey: maps
                }
            }
        },
        ios: {
            config: {
                googleMapsApiKey: maps
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

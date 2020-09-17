
export default ({ config }) => {
    return {
        extra: {
            form_url: "https://client.dreamingspires.dev/oxford-mindmap/submit-story",
            api_url: "https://client.dreamingspires.dev"
            // api_url: "https://dev.dreamingspires.dev",
        },
        ...config,
    };
};

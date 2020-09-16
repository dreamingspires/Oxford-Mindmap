import Constants from "expo-constants"



export const apiUrl = Constants.manifest.extra.api_url
export const formUrl = Constants.manifest.extra.form_url

export const defaultSettings = {
    autoRefresh: true,
}

// in seconds
export const autoRefreshPeriod = 60;

// in metres
export const storyRadius = 10;

export const oxfordRegion = {
    latitude: 51.7519,
    longitude: -1.2583,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
}

const sanitizeStory = (story) => {
    const perturbation = () => (Math.random() - 0.5) * 0.001
    const defaults = {
        latitude: () => oxfordRegion.latitude + perturbation(),
        longitude: () => oxfordRegion.longitude + perturbation(),
        display_image: () => null,
        thumbnail: () => null,
    }
    Object.keys(story)
        .filter(k => story[k] === null)
        // .forEach(k => console.log(k));
        .forEach(k => story[k] = defaults.hasOwnProperty(k)
            ? defaults[k]()
            : (() => { console.log(`Failed to sanitize property ${k} in story ${story.id}`); return null })());
    return story;
}

export const reformatStoryData = (json: Object): Object[] => {
    console.log('Reformatting raw story data')
    return Object.entries(json).map(([k, v]) => sanitizeStory({ ...v, id: k }))
}

export const extractTWs = (stories) => {
    let tws = new Map();
    stories.forEach(x => x.trigger_warnings.forEach(({name, value}) => tws.set(name, value)));
    return tws;
}

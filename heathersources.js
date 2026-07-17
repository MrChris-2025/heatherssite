// ==========================================
// heathersources.js
// Dedicated Streaming Sources & Sandboxing Configuration
// ==========================================

// Global sandbox mode flag
export let isSandboxMode = false;

export function setSandboxMode(value) {
    isSandboxMode = value;
}

// Restored Streaming Sources configuration
export const availableSources = [
    { id: 'cinesrc', name: 'CineSrc', urls: { movie: 'https://cinesrc.st/embed/movie/{id}', tv: 'https://cinesrc.st/embed/tv/{id}/{season}/{episode}' } },
    { id: 'wplayme', name: 'Wplay.me', urls: { movie: 'https://play.xpass.top/e/movie/{id}', tv: 'https://play.xpass.top/e/tv/{id}/{season}/{episode}' } },
    { id: 'meow', name: 'Meow', urls: { movie: 'https://meowtv.ru/play/movie/{id}', tv: 'https://meowtv.ru/play/tv/{id}/{season}/{episode}' } },
    { id: 'nextbox', name: 'NextBox', urls: { movie: 'https://nextbox.uno/player/movie/{id}', tv: 'https://nextbox.uno/player/tv/{id}/{season}/{episode}' } },
    { id: 'cinezo', name: 'Cinezo', urls: { movie: 'https://api.cinezo.net/movie/{id}', tv: 'https://api.cinezo.net/tv/{id}/{season}/{episode}?autoplayNext=true?startAt=630' } },     
    { id: 'filmu', name: 'FilmU', urls: { movie: 'https://embed.filmu.in/movie/{id}', tv: 'https://embed.filmu.in/tv/{id}/{season}/{episode}' } },
    { id: 'cinemaos', name: 'Cinemaos', urls: { movie: 'https://cinemaos.tech/player/{id}', tv: 'https://cinemaos.live/tv/watch/{id}&{season}&{episode}' } },
    { id: 'nxsha', name: 'Nxsha', urls: { movie: 'https://web.nxsha.app/embed/movie/{id}', tv: 'https://web.nxsha.app/embed/tv/{id}/{season}/{episode}' } },
    { id: 'videasy', name: 'VidEasy', urls: { movie: 'https://player.videasy.net/movie/{id}?color=8834ec', tv: 'https://player.videasy.net/tv/{id}/{season}/{episode}?nextEpisode=true&color=8834ec' } },
    { id: 'vidfast', name: 'VidFast', urls: { movie: 'https://vidfast.pro/movie/{id}', tv: 'https://vidfast.pro/tv/{id}/{season}/{episode}' } },
    { id: 'vidsync', name: '1Vidsync', urls: { movie: 'https://vidsync.live/embed/movie/{id}?autoPlay=true', tv: 'https://vidsync.live/embed/tv/{id}/{season}/{episode}?autoPlay=true' } }
];

export const noSandboxSources = ['videasy', 'vidfast', 'wplayme', 'vidsync'];
export const sandboxedSources = ['filmu', 'nextbox', 'cinezo', 'meow', 'nxsha', 'cinemaos', 'cinesrc'];

/**
 * Returns the correct list of sources depending on whether Sandbox Mode is active.
 * @returns {Array} List of source IDs
 */
export function getActiveSourceList() {
    return isSandboxMode ? sandboxedSources : noSandboxSources;
}

/**
 * Returns the iframe sandbox attribute string if sandbox mode is active, or an empty string.
 * @returns {string}
 */
export function getSandboxAttributes() {
    return isSandboxMode ? 'sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-fullscreen"' : '';
}

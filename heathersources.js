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
    { id: 'fmov', name: 'FMov', urls: { movie: 'https://fmov.my/embed/movie/{id}', tv: 'https://fmov.my/embed/tv/{id}/{season}/{episode}' } },
    { id: 'wplayme', name: 'Wplay.me', urls: { movie: 'https://play.xpass.top/e/moviehttps://play.xpass.top/e/movie/{id}', tv: 'https://play.xpass.top/e/tv/{id}/{season}/{episode}' } },
    { id: 'meow', name: 'Meow', urls: { movie: 'https://meowtv.ru/play/movie/{id}', tv: 'https://meowtv.ru/play/tv/{id}/{season}/{episode}' } },
    { id: 'yap', name: 'Yap', urls: { movie: 'https://www.pulptv.net/watch/movie/{id}', tv: 'https://www.pulptv.net/watch/tv/{id}?s={currentSeason}&e={currentEpisode}' } },
    { id: 'cinezo', name: 'Cinezo', urls: { movie: 'https://api.cinezo.net/movie/{id}', tv: 'https://api.cinezo.net/tv/{id}/{season}/{episode}?autoplayNext=true?startAt=630' } },     
    { id: 'filmu', name: 'FilmU', urls: { movie: 'https://embed.filmu.in/movie/{id}', tv: 'https://embed.filmu.in/tv/{id}/{season}/{episode}' } },
    { id: 'cinemaos', name: 'Cinemaos', urls: { movie: 'https://cinemaos.tech/player/{id}', tv: 'https://cinemaos.live/tv/watch/{id}&{season}&{episode}' } },
    { id: 'nxsha', name: 'Nxsha', urls: { movie: 'https://web.nxsha.app/embed/movie/{id}', tv: 'https://web.nxsha.app/embed/tv/{id}/{season}/{episode}' } },
    { id: 'videasy', name: 'VidEasy', urls: { movie: 'https://player.videasy.ws/embed/movie/movie_id', tv: 'https://player.videasy.ws/embed/tv/show_id/season/episode' } },
    { id: 'vidfast', name: 'VidFast', urls: { movie: 'https://vidfast.pro/movie/{id}', tv: 'https://vidfast.pro/tv/{id}/{season}/{episode}' } },
    { id: 'vidsync', name: 'Vidsync', urls: { movie: 'https://vidsync.live/embed/movie/{id}?autoPlay=true', tv: 'https://vidsync.live/embed/tv/{id}/{season}/{episode}?autoPlay=true' } }
];

export const noSandboxSources = ['videasy', 'vidfast', 'wplayme', 'cinemaos'];
export const sandboxedSources = ['filmu', 'yap', 'cinezo', 'meow', 'nxsha', '', 'fmov'];

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

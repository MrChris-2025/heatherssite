// ==== ENTER YOUR BACK4APP KEYS HERE ====
Parse.initialize("fAotdEAsCOF8HvJJr2qk81HywvDVV6KvlfWhFmDO", "cvttNgVwE0kOe2orzrRa54RX1NXKH09K24YhkAra");
Parse.serverURL = "https://parseapi.back4app.com";
// ==== END PARSE SETUP ====

const API_KEY = '1070730380f5fee0d87cf0382670b255';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentType = 'movie';
let currentQuery = '';
let currentItemData = null;
let isSandboxMode = true;

let currentGenreId = '';
let currentYear = '';

let currentReleaseDate = new Date();
let newReleaseType = 'movie';

const today = new Date();
const fourteenDaysAgo = new Date();
fourteenDaysAgo.setDate(today.getDate() - 14);
today.setHours(0, 0, 0, 0);
fourteenDaysAgo.setHours(0, 0, 0, 0);

const MOVIE_GENRES_URL = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`;
const TV_GENRES_URL = `${BASE_URL}/genre/tv/list?api_key=${API_KEY}`;

// DOM Elements
const galleryContainer = document.getElementById('galleryContainer');
const galleryTitle = document.getElementById('galleryTitle');
const searchInput = document.getElementById('searchInput');
const showMoviesBtn = document.getElementById('showMoviesBtn');
const showTvBtn = document.getElementById('showTvBtn');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfoSpan = document.getElementById('pageInfo');
const genreFilter = document.getElementById('genreFilter');
const yearFilter = document.getElementById('yearFilter');
const videoModal = document.getElementById('videoModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalTitle = document.getElementById('modalTitle');
let videoPlayer = null; 
const sourceSelector = document.getElementById('sourceSelector');
const episodeSelector = document.getElementById('episodeSelector');
const seasonSelect = document.getElementById('seasonSelect');
const episodeSelect = document.getElementById('episodeSelect');
const iframeContainer = document.getElementById('iframeContainer');
const nowPlayingDisplay = document.getElementById('nowPlaying');
const summaryDisplay = document.getElementById('summary');
const trailerBtn = document.getElementById('trailerBtn');
const prevEpisodeBtn = document.getElementById('prevEpisodeBtn');
const nextEpisodeBtn = document.getElementById('nextEpisodeBtn');
const continueWatchingSection = document.getElementById('continueWatchingSection');
const continueWatchingContainer = document.getElementById('continueWatchingContainer');
const showNoSandboxBtn = document.getElementById('showNoSandboxBtn');
const showSandboxBtn = document.getElementById('showSandboxBtn');
const episodeNavButtons = document.getElementById('episodeNavButtons');
const prevPageBottomBtn = document.getElementById('prevPageBottom');
const nextPageBottomBtn = document.getElementById('nextPageBottom');
const pageInfoBottomSpan = document.getElementById('pageInfoBottom');
const newReleasesContainer = document.getElementById('newReleasesContainer');
const prevReleaseDayBtn = document.getElementById('prevReleaseDayBtn');
const nextReleaseDayBtn = document.getElementById('nextReleaseDayBtn');
const releaseDateInfo = document.getElementById('releaseDateInfo');
const showNewReleaseMoviesBtn = document.getElementById('showNewReleaseMoviesBtn');
const showNewReleaseTvBtn = document.getElementById('showNewReleaseTvBtn');

const availableSources = [
    { id: 'wplayme', name: 'Mike Ty-thhon', urls: { movie: 'https://embed.wplay.me/embed/movie/{id}', tv: 'https://embed.wplay.me/embed/tv/{id}/{season}/{episode}' } },
    { id: 'vidsrcpk', name: 'VidSrcPk', urls: { movie: 'https://vidsrc.win/movie/?id={id}', tv: 'https://vidsrc.win/tv.html?id={id}&season={season}&episode={episode}' } },
    { id: "filmu", name: "FilmU", urls: { movie: 'https://embed.filmu.in/movie/${id}', tv: 'https://embed.filmu.in/tv/{id}/{season}/{episode}', } },
    { id: 'primewire', name: 'Primewire', urls: { movie: 'https://www.primewire.tf/embed/movie?tmdb={id}', tv: 'https://www.primewire.tf/embed/tv?tmdb={id}&season={season}&episode={episode}&server=vidmoly' } },
    { id: 'vidpop', name: 'Vidpop', urls: { movie: 'https://www.vidpop.xyz/embed/?id={id}', tv: 'https://www.vidpop.xyz/embed/?id={id}&season={season}&episode={episode}' } },
    { id: 'rive', name: 'RiveStream', urls: { movie: 'https://rivestream.org/embed?type=movie&id={id}', tv: 'https://rivestream.org/embed?type=tv&id=tmdb&id={id}&season={season}&episode={episode}' } },
    { id: 'hexa', name: 'Hexa', urls: { movie: 'https://hexa.watch/watch/movie/{id}', tv: 'https://hexa.watch/watch/tv/{id}/{season}/{episode}' } },
    { id: 'nextbox', name: 'NextBox', urls: { movie: 'https://nextbox.uno/player/movie/{id}', tv: 'https://nextbox.uno/player/tv/{id}/{season}/{episode}' } },
    { id: 'xprime', name: 'XPrime', urls: { movie: 'https://xprime.su/watch/movie/{id}', tv: 'https://xprime.su/watch/tv/{id}/{season}/{episode}' } },
    { id: 'spenflix', name: 'SpenFlix', urls: { movie: 'https://spencerdevs.xyz/movie/{id}', tv: 'https://spencerdevs.xyz/tv/{id}/{season}/{episode}' } },
    { id: 'vidsrccx', name: 'VidSrcCX', urls: { movie: 'https://vidsrc.cx/embed/movie/{id}', tv: 'https://vidsrc.cx/embed/tv/{id}/{season}/{episode}' } },
    { id: 'vidnest', name: 'VidNest', urls: { movie: 'https://vidnest.fun/movie/{id}', tv: 'https://vidnest.fun/tv/{id}/{season}/{episode}' } },
    { id: 'cinezo', name: 'Cinezo', urls: { movie: 'https://api.cinezo.net/movie/{id}', tv: 'https://api.cinezo.net/tv/{id}/{season}/{episode}' } },
   { id: 'videasy', name: 'VidEasy', urls: { movie: 'https://player.videasy.net/movie/{id}?color=8834ec', tv: 'https://player.videasy.net/tv/{id}/{season}/{episode}?nextEpisode=true&color=8834ec' } },
    { id: 'vidfast', name: 'VidFast', urls: { movie: 'https://vidfast.pro/movie/{id}', tv: 'https://vidfast.pro/tv/{id}/{season}/{episode}' } },
    { id: 'vidsrcvip', name: 'vidsrc.vip', urls: { movie: 'https://vidsrc.vip/embed/movie/{id}', tv: 'https://vidsrc.vip/embed/tv/{id}/{season}/{episode}' } }
];

const sandboxedSources = ['wplayme', 'vidsrcpk', 'primewire', 'vidpop', 'rive', 'hexa', 'spenflix', 'nextbox', 'xprime', 'vidsrccx', 'cinezo', 'filmu'];
const noSandboxSources = ['videasy', 'vidfast', 'vidsrcvip'];

function getContinueWatchingKey({ sourceId, type, id, season, episode }) {
    if (type === 'movie') return `${sourceId}:movie:${id}`;
    if (type === 'tv') return `${sourceId}:tv:${id}:${season}:${episode}`;
    return '';
}

async function saveContinueWatching(key, position) {
    try {
        const CW = Parse.Object.extend('ContinueWatching');
        const query = new Parse.Query(CW);
        query.equalTo('key', key);
        let record = await query.first();
        if (!record) {
            record = new CW();
            record.set('key', key);
        }
        record.set('position', position);
        await record.save();
    } catch (err) {
        console.error('Parse saveContinueWatching failed:', err);
    }
}

async function getContinueWatching(key) {
    try {
        const CW = Parse.Object.extend('ContinueWatching');
        const query = new Parse.Query(CW);
        query.equalTo('key', key);
        const obj = await query.first();
        return obj && typeof obj.get("position") === "number" ? obj.get("position") : 0;
    } catch (err) {
        console.error('Parse getContinueWatching failed:', err);
        return 0;
    }
}

async function deleteContinueWatching(key) {
    try {
        const CW = Parse.Object.extend('ContinueWatching');
        const query = new Parse.Query(CW);
        query.equalTo('key', key);
        const obj = await query.first();
        if (obj) await obj.destroy();
    } catch (err) {
        console.error("Failed to delete from continue watching:", err);
    }
}

/**
 * Deletes all previous episode records for a specific TV show 
 * when a newer episode is started.
 */
async function cleanupOldEpisodes(tmdbId, currentSeason, currentEpisode) {
    try {
        const CW = Parse.Object.extend('ContinueWatching');
        const query = new Parse.Query(CW);
        
        // Find keys starting with "{source}:tv:{tmdbId}:"
        // Since we don't strictly know the source here, we check for ":tv:{tmdbId}:"
        query.contains('key', `:tv:${tmdbId}:`);
        
        const results = await query.find();
        for (let row of results) {
            const key = row.get('key');
            let parts = key.split(':');
            let season = parseInt(parts[3]);
            let episode = parseInt(parts[4]);

            // If the stored record is an older episode or older season, delete it
            if (season < currentSeason || (season === currentSeason && episode < currentEpisode)) {
                await row.destroy();
                console.log(`Cleaned up old episode record: ${key}`);
            }
        }
    } catch (err) {
        console.error("Error during old episode cleanup:", err);
    }
}

// ----------------------------------------------------
// Progress Tracking Logic
// ----------------------------------------------------

let localWatchTimer = null;
let lastVideoKey = null;
let watchSeconds = 0;

function startLocalProgressTracking() {
    stopLocalProgressTracking(); 

    const sourceId = sourceSelector.value;
    const type = currentType;
    const id = currentItemData.id;
    let season = 1, episode = 1;
    if (type === 'tv') {
        season = seasonSelect.value;
        episode = episodeSelect.value;
    }
    lastVideoKey = getContinueWatchingKey({ sourceId, type, id, season, episode });

    getContinueWatching(lastVideoKey).then(seconds => {
        watchSeconds = seconds;
        console.log(`Resuming at ${formatTime(watchSeconds)}`);
    });

    localWatchTimer = setInterval(() => {
        watchSeconds++;
    }, 1000);
}

function stopLocalProgressTracking() {
    if (localWatchTimer) {
        clearInterval(localWatchTimer);
        localWatchTimer = null;
    }

    if (lastVideoKey && watchSeconds > 15) { 
        saveContinueWatching(lastVideoKey, watchSeconds);
    }
    
    lastVideoKey = null;
    watchSeconds = 0;
    loadContinueWatchingParse();
}

async function loadContinueWatchingParse() {
    try {
        const CW = Parse.Object.extend('ContinueWatching');
        const query = new Parse.Query(CW);
        query.descending('updatedAt'); 
        query.limit(1000);
        const results = await query.find();
        const continueWatchingData = [];
        for (let row of results) {
            const key = row.get('key');
            const position = row.get('position');
            const updatedAt = row.updatedAt;
            let tmp = key.split(':');
            let sourceId = tmp[0], type = tmp[1], id = tmp[2], season, episode;
            if (type === "tv") { season = tmp[3]; episode = tmp[4]; }
            continueWatchingData.push({
                key, sourceId, type, id,
                season: season ? parseInt(season) : undefined,
                episode: episode ? parseInt(episode) : undefined,
                position, updatedAt
            });
        }
        renderContinueWatchingParse(continueWatchingData);
    } catch (err) {
        console.error("Failed to load continue watching:", err);
        continueWatchingSection.style.display = 'none';
    }
}

async function renderContinueWatchingParse(continueWatchingData) {
    if (!continueWatchingData.length) {
        continueWatchingSection.style.display = 'none';
        return;
    }
    continueWatchingSection.style.display = 'block';
    continueWatchingContainer.innerHTML = '';

    for (const item of continueWatchingData) {
        const contentKey = `${item.type}:${item.id}:${item.season || ""}:${item.episode || ""}`;
        const card = document.createElement('div');
        card.className = 'continue-watching-card';
        card.dataset.contentKey = contentKey;
        card.innerHTML = `
                <button class="close-btn" title="Remove" type="button">&times;</button>
                <div class="image-container"><img src="https://via.placeholder.com/80x120/1a1a1a/bb86fc?text=Loading..." alt="Loading"></div>
                <div class="title-area">
                    <div class="title">Loading...</div>
                    <div class="card-footer-info">
                        <div class="progress">Last seen at: ${formatTime(item.position)}</div>
                        <div class="last-watched-date">Watched: ${formatDate(item.updatedAt)}</div>
                    </div>
                </div>`;
            
        card.querySelector('.close-btn').addEventListener('click', async e => {
            e.stopPropagation(); 
            if (confirm('Remove this from "Continue Watching"?')) {
                await deleteContinueWatching(item.key); 
                loadContinueWatchingParse();
            }
        });
        continueWatchingContainer.appendChild(card);

        fetchContentDetails(item.id, item.type).then(details => {
            if (!details) return;
            const title = details.title || details.name || 'Unknown';
            const image = details.poster_path ? `${IMAGE_BASE_URL}${details.poster_path}` : 'https://via.placeholder.com/80x120/1a1a1a/bb86fc?text=No+Image';
            let sub = item.type === "tv" ? `S${item.season.toString().padStart(2, "0")}E${item.episode.toString().padStart(2, "0")}` : "";

            card.querySelector('.image-container img').src = image;
            card.querySelector('.title').innerHTML = title + (sub ? ` <span style="color:#bbb; font-size:.9em;">${sub}</span>` : '');
            card.onclick = (e) => {
                if (!e.target.closest('.close-btn')) openPlayer(details, item.season, item.episode);
            };
        });
    }
}

// TMDB & UI Functions
async function fetchContent(type, page, query = '', genreId = '', year = '') {
    try {
        let url = query ? `${BASE_URL}/search/${type}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}` :
            `${BASE_URL}/discover/${type}?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc${genreId ? `&with_genres=${genreId}` : ''}${year ? (type === 'movie' ? `&primary_release_year=${year}` : `&first_air_date_year=${year}`) : ''}`;
        const response = await fetch(url);
        return await response.json();
    } catch (error) { return null; }
}

async function fetchNewReleases(date, type) {
    try {
        const fDate = date.toISOString().split('T')[0];
        const url = type === 'movie' ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${fDate}&primary_release_date.lte=${fDate}` : 
                                       `${BASE_URL}/discover/tv?api_key=${API_KEY}&air_date.gte=${fDate}&air_date.lte=${fDate}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.results;
    } catch (e) { return []; }
}

async function fetchTrailer(id, type) {
    try {
        const res = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
        const data = await res.json();
        const trailer = data.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
        return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
    } catch (e) { return null; }
}

async function fetchContentDetails(id, type) {
    try {
        const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
        return await res.json();
    } catch (e) { return null; }
}

async function fetchSeasonDetails(id, seasonNumber) {
    try {
        const res = await fetch(`${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`);
        const data = await res.json();
        return data.episodes || [];
    } catch (e) { return []; }
}

async function populateGenreFilter() {
    const url = currentType === 'movie' ? MOVIE_GENRES_URL : TV_GENRES_URL;
    try {
        const res = await fetch(url);
        const data = await res.json();
        genreFilter.innerHTML = '<option value="">All Genres</option>';
        data.genres.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id; opt.textContent = g.name;
            genreFilter.appendChild(opt);
        });
        genreFilter.value = currentGenreId;
    } catch(e) {}
}

function populateYearFilter() {
    const cy = new Date().getFullYear();
    yearFilter.innerHTML = '<option value="">All Years</option>';
    for (let y = cy; y >= 1900; y--) {
        const opt = document.createElement('option');
        opt.value = y; opt.textContent = y;
        yearFilter.appendChild(opt);
    }
    yearFilter.value = currentYear;
}

function renderGallery(items) {
    galleryContainer.innerHTML = '';
    if (!items || items.length === 0) {
        galleryContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">No results found.</p>';
        return;
    }
    items.forEach(item => {
        const title = item.title || item.name;
        const releaseDate = item.release_date || item.first_air_date;
        if (item.poster_path) {
            const card = document.createElement('div');
            card.className = "gallery-card";
            let banner = "";
            if (releaseDate) {
                const rDate = new Date(releaseDate);
                if (rDate >= fourteenDaysAgo && rDate <= today) banner = `<div class="absolute top-0 left-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-br-lg z-10 animate-pulse-banner">${currentType === 'movie' ? 'NEW RELEASE' : 'NEW EPISODE'}</div>`;
            }
            card.innerHTML = `${banner}<img src="${IMAGE_BASE_URL}${item.poster_path}" alt="${title}"><div class="card-info"><h3>${title}</h3><p>${releaseDate ? releaseDate.substring(0, 4) : 'N/A'}</p></div>`;
            card.onclick = async () => {
                const data = await fetchContentDetails(item.id, currentType);
                if (data) openPlayer(data);
            };
            galleryContainer.appendChild(card);
        }
    });
}

async function renderNewReleases(items) {
    newReleasesContainer.innerHTML = '';
    if (!items || items.length === 0) {
        newReleasesContainer.innerHTML = '<p class="text-center text-gray-500">No new releases on this day.</p>';
        return;
    }
    for (const item of items.slice(0, 10)) {
        if (item.poster_path) {
            const card = document.createElement('div');
            card.className = "new-release-card";
            let sub = item.release_date ? item.release_date.substring(0, 4) : 'N/A';
            let epInfo = null;
            if (newReleaseType === 'tv') {
                epInfo = await fetchTVShowDetailsWithEpisodes(item.id, currentReleaseDate);
                if (!epInfo) continue;
                sub = `S${String(epInfo.season).padStart(2, '0')} E${String(epInfo.episode).padStart(2, '0')}`;
            }
            card.innerHTML = `<div class="image-container"><img src="${IMAGE_BASE_URL}${item.poster_path}" alt=""></div><div class="card-info"><h3>${item.title || item.name}</h3><p>${sub}</p></div>`;
            card.onclick = async () => {
                const data = await fetchContentDetails(item.id, newReleaseType);
                if (data) openPlayer(data, epInfo?.season, epInfo?.episode);
            };
            newReleasesContainer.appendChild(card);
        }
    }
}

async function updateUI() {
    const data = await fetchContent(currentType, currentPage, currentQuery, currentGenreId, currentYear);
    if (data) {
        renderGallery(data.results);
        pageInfoSpan.textContent = pageInfoBottomSpan.textContent = `Page ${data.page} of ${data.total_pages}`;
        prevPageBtn.disabled = prevPageBottomBtn.disabled = data.page <= 1;
        nextPageBtn.disabled = nextPageBottomBtn.disabled = data.page >= data.total_pages;
        galleryTitle.textContent = currentQuery ? `Search Results for "${currentQuery}"` : (currentGenreId || currentYear ? `${genreFilter.options[genreFilter.selectedIndex]?.textContent} ${currentType === 'movie' ? 'Movies' : 'TV Shows'}` : (currentType === 'movie' ? 'Popular Movies' : 'Popular TV Shows'));
    }
}

function updateNewReleasesUI() {
    releaseDateInfo.textContent = currentReleaseDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    fetchNewReleases(currentReleaseDate, newReleaseType).then(renderNewReleases);
}

function closeModal() {
    videoModal.classList.remove('visible');
    videoModal.classList.add('hidden');
    stopLocalProgressTracking();
    if (videoPlayer) videoPlayer.src = '';
}

function openPlayer(itemData, initialSeason = null, initialEpisode = null) {
    currentItemData = itemData;
    modalTitle.textContent = itemData.title || itemData.name;
    stopLocalProgressTracking(); 
    const isTV = !!(itemData.media_type === 'tv' || itemData.first_air_date);
    episodeSelector.classList.toggle('hidden', !isTV);
    episodeNavButtons.classList.toggle('hidden', !isTV);
    if (isTV) {
        currentType = 'tv';
        populateSeasonSelect(initialSeason, initialEpisode); 
    } else {
        currentType = 'movie';
        updatePlayer();
    }
    videoModal.classList.remove('hidden');
    videoModal.classList.add('visible');
}

function populateSourceSelector() {
    const sources = isSandboxMode ? sandboxedSources : noSandboxSources;
    sourceSelector.innerHTML = availableSources.filter(s => sources.includes(s.id)).map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    updatePlayer();
}

function populateSeasonSelect(initialSeason = null, initialEpisode = null) {
    seasonSelect.innerHTML = '';
    if (!currentItemData || !currentItemData.seasons) return;
    const seasons = currentItemData.seasons.filter(s => s.season_number >= 1).sort((a, b) => a.season_number - b.season_number);
    seasons.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.season_number; opt.textContent = `Season ${s.season_number}`;
        seasonSelect.appendChild(opt);
    });
    seasonSelect.value = initialSeason || (seasons.length > 0 ? seasons[0].season_number : "");
    if (seasonSelect.value) updateEpisodeUI(initialEpisode);
}

async function updateEpisodeUI(initialEpisode = null) {
    const sNum = parseInt(seasonSelect.value);
    let sData = (currentItemData.seasons || []).find(s => s.season_number === sNum);
    if (!sData || !sData.episodes) {
        const eps = await fetchSeasonDetails(currentItemData.id, sNum);
        if (!sData) {
            sData = { season_number: sNum, episodes: eps };
            currentItemData.seasons.push(sData);
        } else sData.episodes = eps;
    }
    populateEpisodeSelect(sData, initialEpisode);
}

function populateEpisodeSelect(sData, initialEpisode = null) {
    episodeSelect.innerHTML = '';
    const eps = sData.episodes || [];
    if (!eps.length) {
        episodeSelect.innerHTML = '<option value="0">No episodes found</option>';
        episodeSelect.disabled = prevEpisodeBtn.disabled = nextEpisodeBtn.disabled = true;
        return;
    }
    episodeSelect.disabled = false;
    eps.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.episode_number; opt.textContent = `Episode ${e.episode_number}: ${e.name || 'Untitled'}`;
        episodeSelect.appendChild(opt);
    });
    episodeSelect.value = (initialEpisode && eps.some(e => e.episode_number == initialEpisode)) ? initialEpisode : eps[0].episode_number;
    updatePlayer();
}

async function updatePlayer() {
    if (!currentItemData) return;
    const isTV = currentType === 'tv';
    
    if (isTV) {
        const s = parseInt(seasonSelect.value), e = parseInt(episodeSelect.value);
        const sData = (currentItemData.seasons || []).find(sd => sd.season_number === s);
        const epCount = sData?.episodes.length || 0;
        const maxS = Math.max(...currentItemData.seasons.map(sd => sd.season_number));
        
        // --- AUTO-CLEANUP LOGIC ---
        // Delete previous episodes from "Continue Watching" when a new one is started
        cleanupOldEpisodes(currentItemData.id, s, e);
        
        prevEpisodeBtn.disabled = e <= 1 && s <= 1;
        nextEpisodeBtn.disabled = e >= epCount && s >= maxS;
        const eData = (sData?.episodes || []).find(ed => ed.episode_number === e);
        nowPlayingDisplay.textContent = `Now Playing: ${currentItemData.name} - S${s} E${e} - ${eData?.name || ''}`;
        summaryDisplay.textContent = eData?.overview || "No summary available.";
    } else {
        nowPlayingDisplay.textContent = `Now Playing: ${currentItemData.title}`;
        summaryDisplay.textContent = currentItemData.overview || "No summary available.";
    }

    const src = availableSources.find(s => s.id === sourceSelector.value);
    if (!src) return;

    let url = currentType === 'movie' ? src.urls.movie.replace('{id}', currentItemData.id) : 
                src.urls.tv.replace('{id}', currentItemData.id).replace('{season}', seasonSelect.value).replace('{episode}', episodeSelect.value);

    const iframe = document.createElement('iframe');
    iframe.id = 'videoPlayer'; iframe.className = 'w-full h-full absolute top-0 left-0';
    iframe.src = url; iframe.frameBorder = '0'; iframe.allowFullscreen = true;
    if (isSandboxMode) iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-fullscreen');
    iframe.setAttribute('allow', 'fullscreen'); 
    iframeContainer.innerHTML = ''; iframeContainer.appendChild(iframe);
    videoPlayer = iframe;
    startLocalProgressTracking();
}

async function playTrailer() {
    const url = await fetchTrailer(currentItemData.id, currentType);
    if (url) {
        const iframe = document.createElement('iframe');
        iframe.className = 'w-full h-full absolute top-0 left-0';
        iframe.src = url; iframe.allowFullscreen = true;
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');
        iframeContainer.innerHTML = ''; iframeContainer.appendChild(iframe);
        videoPlayer = iframe;
        stopLocalProgressTracking();
    } else alert('No trailer found.');
}

function toggleMediaType(type) {
    currentType = type; currentPage = 1; currentGenreId = ''; currentYear = '';
    genreFilter.value = yearFilter.value = '';
    populateGenreFilter();
    document.getElementById('showMoviesBtn').classList.toggle('active', type === 'movie');
    document.getElementById('showTvBtn').classList.toggle('active', type === 'tv');
    updateUI();
}

function scrollAndLoad(action) {
    document.getElementById('galleryContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (action === 'prev' && currentPage > 1) { currentPage--; updateUI(); }
    else if (action === 'next') { currentPage++; updateUI(); }
}

// Global Event Listeners
searchInput.addEventListener('input', () => { currentQuery = searchInput.value.trim(); currentPage = 1; updateUI(); });
showMoviesBtn.addEventListener('click', () => toggleMediaType('movie'));
showTvBtn.addEventListener('click', () => toggleMediaType('tv'));
genreFilter.addEventListener('change', () => { currentGenreId = genreFilter.value; currentPage = 1; updateUI(); });
yearFilter.addEventListener('change', () => { currentYear = yearFilter.value; currentPage = 1; updateUI(); });
[prevPageBtn, prevPageBottomBtn].forEach(b => b.onclick = () => scrollAndLoad('prev'));
[nextPageBtn, nextPageBottomBtn].forEach(b => b.onclick = () => scrollAndLoad('next'));
sourceSelector.onchange = updatePlayer;
trailerBtn.onclick = playTrailer;
seasonSelect.onchange = () => updateEpisodeUI();
episodeSelect.onchange = updatePlayer;

prevEpisodeBtn.onclick = async () => {
    let s = parseInt(seasonSelect.value), e = parseInt(episodeSelect.value);
    if (e > 1) { episodeSelect.value = e - 1; updatePlayer(); }
    else if (s > 1) {
        seasonSelect.value = s - 1; await updateEpisodeUI();
        const sData = currentItemData.seasons.find(sd => sd.season_number == (s-1));
        episodeSelect.value = sData.episodes.length; updatePlayer();
    }
};

nextEpisodeBtn.onclick = async () => {
    let s = parseInt(seasonSelect.value), e = parseInt(episodeSelect.value);
    const sData = currentItemData.seasons.find(sd => sd.season_number == s);
    if (e < sData.episodes.length) { episodeSelect.value = e + 1; updatePlayer(); }
    else {
        const nextS = currentItemData.seasons.find(sd => sd.season_number == s + 1);
        if (nextS) { seasonSelect.value = s + 1; await updateEpisodeUI(); episodeSelect.value = 1; updatePlayer(); }
    }
};

showSandboxBtn.onclick = () => { isSandboxMode = true; populateSourceSelector(); };
showNoSandboxBtn.onclick = () => { isSandboxMode = false; populateSourceSelector(); };
modalCloseBtn.onclick = closeModal;
videoModal.onclick = (e) => { if (e.target.id === 'videoModal') closeModal(); };

prevReleaseDayBtn.onclick = () => { currentReleaseDate.setDate(currentReleaseDate.getDate() - 1); updateNewReleasesUI(); };
nextReleaseDayBtn.onclick = () => { currentReleaseDate.setDate(currentReleaseDate.getDate() + 1); updateNewReleasesUI(); };
showNewReleaseMoviesBtn.onclick = () => { newReleaseType = 'movie'; updateNewReleasesUI(); };
showNewReleaseTvBtn.onclick = () => { newReleaseType = 'tv'; updateNewReleasesUI(); };

document.addEventListener('DOMContentLoaded', () => {
    populateSourceSelector(); populateGenreFilter(); populateYearFilter();
    updateUI(); loadContinueWatchingParse(); updateNewReleasesUI();
});

function formatTime(s) {
    if (!s) return "0:00";
    const m = Math.floor(s / 60), rs = Math.floor(s % 60), h = Math.floor(m / 60), rm = m % 60;
    return h > 0 ? `${h}:${rm.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}` : `${rm}:${rs.toString().padStart(2, '0')}`;
}

function formatDate(d) {
    if (!d) return 'N/A';
    const diff = Math.floor((new Date() - d) / 86400000);
    if (diff === 0) return `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString();
}

async function fetchTVShowDetailsWithEpisodes(id, date) {
    try {
        const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
        const data = await res.json();
        const fDate = date.toISOString().split('T')[0];
        if (data.seasons) {
            for (const s of data.seasons) {
                const eps = await fetchSeasonDetails(id, s.season_number);
                const match = eps.find(ep => ep.air_date === fDate);
                if (match) return { season: s.season_number, episode: match.episode_number };
            }
        }
    } catch (e) {} return null;
}

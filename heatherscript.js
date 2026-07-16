// ==== TAILWIND CONFIGURATION ====
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
                pecita: ['Pecita', 'cursive'],
            },
            colors: {
                'primary-purple': '#a78bfa',
                'dark-purple': '#4c1d95',
                'light-purple': '#c4b5fd',
                'background-dark': '#111827',
                'background-light': '#374151',
            },
        },
    },
};

// ==== BACK4APP SETUP ====
Parse.initialize("fAotdEAsCOF8HvJJr2qk81HywvDVV6KvlfWhFmDO", "cvttNgVwE0kOe2orzrRa54RX1NXKH09K24YhkAra");
Parse.serverURL = "https://parseapi.back4app.com";

const API_KEY = '1070730380f5fee0d87cf0382670b255';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentType = 'movie';
let currentQuery = '';
let currentItemData = null;
let isSandboxMode = false;

// DOM Elements
const galleryContainer = document.getElementById('galleryContainer');
const galleryTitle = document.getElementById('galleryTitle');
const searchInput = document.getElementById('searchInput');
const showMoviesBtn = document.getElementById('showMoviesBtn');
const showTvBtn = document.getElementById('showTvBtn');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfoSpan = document.getElementById('pageInfo');
const prevPageBottomBtn = document.getElementById('prevPageBottom');
const nextPageBottomBtn = document.getElementById('nextPageBottom');
const pageInfoBottomSpan = document.getElementById('pageInfoBottom');
const floatingHeart = document.getElementById('floatingHeart');
const openFavoritesBtn = document.getElementById('openFavoritesBtn');
const liveTvTrigger = document.getElementById('liveTvTrigger');
const liveTvModal = document.getElementById('liveTvModal');
const closeLiveTv = document.getElementById('closeLiveTv');

// Restored Movie/TV Player DOM Elements
const videoModal = document.getElementById('videoModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalTitle = document.getElementById('modalTitle');
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
const showNoSandboxBtn = document.getElementById('showNoSandboxBtn');
const showSandboxBtn = document.getElementById('showSandboxBtn');
const episodeNavButtons = document.getElementById('episodeNavButtons');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// Restored Favorites Modal DOM Elements
const closeFavoritesBtn = document.getElementById('closeFavoritesBtn');
const favoritesModal = document.getElementById('favoritesModal');
const favoritesGrid = document.getElementById('favoritesGrid');
const noFavoritesMessage = document.getElementById('noFavoritesMessage');

// Restored Secret Heart DOM Elements
const heartVideoModal = document.getElementById('heartVideoModal');
const heartModalCloseBtn = document.getElementById('heartModalCloseBtn');

let favoritedItems = {};
let recentlyWatchedItems = {};

// Restored Streaming Sources configuration
const availableSources = [
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
    { id: 'vidsync', name: 'Vidsync', urls: { movie: 'https://vidsync.live/embed/movie/{id}?autoPlay=true', tv: 'https://vidsync.live/embed/tv/{id}/{season}/{episode}?autoPlay=true' } }
];

const noSandboxSources = ['videasy', 'vidfast', 'wplayme', 'vidsync'];
const sandboxedSources = ['filmu', 'nextbox', 'cinezo', 'meow', 'nxsha', 'cinemaos', 'cinesrc'];

// --- FAVORITES LOGIC ---
async function loadFavorites() {
    try {
        const Favorites = Parse.Object.extend('Favorites');
        const query = new Parse.Query(Favorites);
        query.limit(1000);
        const results = await query.find();
        favoritedItems = results.reduce((map, item) => {
            const key = `${item.get('tmdbId')}-${item.get('type')}`;
            map[key] = item;
            return map;
        }, {});
    } catch (err) { console.error("Favorites load fail:", err); }
}

async function toggleFavorite(tmdbId, type, posterUrl, title) {
    const key = `${tmdbId}-${type}`;
    const isFavorited = favoritedItems.hasOwnProperty(key);
    const Favorites = Parse.Object.extend('Favorites');
    if (isFavorited) {
        try { await favoritedItems[key].destroy(); delete favoritedItems[key]; } catch (err) { console.error(err); }
    } else {
        try {
            const favorite = new Favorites();
            favorite.set('tmdbId', tmdbId);
            favorite.set('type', type);
            favorite.set('posterUrl', posterUrl);
            favorite.set('title', title);
            favoritedItems[key] = await favorite.save();
        } catch (err) { console.error(err); }
    }
    updateUI();
    if (!favoritesModal.classList.contains('hidden')) renderFavoritesModal();
}

// Restored Favorites Modal Rendering
async function renderFavoritesModal() {
    favoritesGrid.innerHTML = '';
    const favoriteArray = Object.values(favoritedItems);
    if (favoriteArray.length === 0) {
        noFavoritesMessage.classList.remove('hidden');
        return;
    }
    noFavoritesMessage.classList.add('hidden');
    favoriteArray.forEach(item => {
        const card = document.createElement('div');
        card.className = "gallery-card";
        card.innerHTML = `
            <span class="favorite-heart active" data-id="${item.get('tmdbId')}" data-type="${item.get('type')}" data-title="${item.get('title')}" data-poster="${item.get('posterUrl')}">❤</span>
            <img src="${item.get('posterUrl')}" alt="${item.get('title')}">
            <div class="card-info"><h3>${item.get('title')}</h3><p>${item.get('type')}</p></div>`;
        
        card.querySelector('.favorite-heart').addEventListener('click', e => {
            e.stopPropagation();
            toggleFavorite(parseInt(e.target.dataset.id), e.target.dataset.type, e.target.dataset.poster, e.target.dataset.title);
        });
        card.addEventListener('click', async () => {
            const details = await fetchContentDetails(item.get('tmdbId'), item.get('type'));
            if (details) {
                closeFavoritesModal();
                openPlayer(details);
            }
        });
        favoritesGrid.appendChild(card);
    });
}

function openFavoritesModal() {
    document.body.style.overflow = "hidden";
    favoritesModal.classList.remove('hidden');
    favoritesModal.classList.add('flex');
    renderFavoritesModal();
}

function closeFavoritesModal() {
    document.body.style.overflow = "";
    favoritesModal.classList.remove('flex');
    favoritesModal.classList.add('hidden');
}

// --- RECENTLY WATCHED ---
async function loadRecentlyWatched() {
    try {
        const Recent = Parse.Object.extend('RecentlyWatched');
        const query = new Parse.Query(Recent);
        query.descending('updatedAt');
        const results = await query.find();
        recentlyWatchedItems = results.reduce((map, item) => {
            map[`${item.get('tmdbId')}-${item.get('type')}`] = { season: item.get('season'), episode: item.get('episode'), date: item.updatedAt, title: item.get('title'), posterUrl: item.get('posterUrl') };
            return map;
        }, {});
        renderRecentlyWatched();
    } catch (err) { console.error(err); }
}

async function saveRecentlyWatched() {
    if (!currentItemData) return;
    try {
        const Recent = Parse.Object.extend('RecentlyWatched');
        const query = new Parse.Query(Recent);
        query.equalTo('tmdbId', currentItemData.id);
        query.equalTo('type', currentType);
        let record = await query.first() || new Recent();
        record.set('tmdbId', currentItemData.id);
        record.set('type', currentType);
        const title = currentItemData.title || currentItemData.name;
        const posterUrl = `${IMAGE_BASE_URL}${currentItemData.poster_path}`;
        record.set('title', title);
        record.set('posterUrl', posterUrl);
        if (currentType === 'tv') { 
            record.set('season', parseInt(seasonSelect.value)); 
            record.set('episode', parseInt(episodeSelect.value)); 
        }
        await record.save();
        recentlyWatchedItems[`${currentItemData.id}-${currentType}`] = { season: record.get('season'), episode: record.get('episode'), date: new Date(), title: title, posterUrl: posterUrl };
        updateUI();
        renderRecentlyWatched();
    } catch (err) { console.error(err); }
}

function renderRecentlyWatched() {
    const container = document.getElementById('continueWatchingContainer');
    const section = document.getElementById('continueWatchingSection');
    container.innerHTML = '';
    const itemsArray = Object.entries(recentlyWatchedItems);
    if (itemsArray.length === 0) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'block';
    itemsArray.forEach(([key, item]) => {
        const [tmdbId, type] = key.split('-');
        const lastWatchedDate = item.date ? new Date(item.date) : new Date();
        const formattedDate = `Watched ${lastWatchedDate.getMonth() + 1}/${lastWatchedDate.getDate()}/${String(lastWatchedDate.getFullYear()).slice(-2)}`;

        const card = document.createElement('div');
        card.className = "continue-watching-card w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.33%-0.67rem)] lg:w-[calc(25%-0.75rem)]";
        card.innerHTML = `
            <div class="image-container">
                <img src="${item.posterUrl || ''}" alt="${item.title || ''}">
            </div>
            <div class="title-area">
                <div class="title" title="${item.title || 'Unknown Title'}">${item.title || 'Unknown Title'}</div>
                <div class="progress">${type === 'tv' ? `S${item.season} E${item.episode}` : 'Movie'}</div>
                <div class="watched-date">${formattedDate}</div>
            </div>
            <button class="close-btn">&times;</button>
        `;
        card.querySelector('.close-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const Recent = Parse.Object.extend('RecentlyWatched');
                const query = new Parse.Query(Recent);
                query.equalTo('tmdbId', parseInt(tmdbId));
                query.equalTo('type', type);
                const record = await query.first();
                if (record) await record.destroy();
                delete recentlyWatchedItems[key];
                renderRecentlyWatched();
            } catch (err) { console.error(err); }
        });
        card.addEventListener('click', async () => {
            const details = await fetchContentDetails(tmdbId, type);
            if (details) openPlayer(details, item.season, item.episode);
        });
        container.appendChild(card);
    });
}

// --- TMDB FETCHING ---
async function fetchContent(type, page, query = '') {
    try {
        const url = query ? `${BASE_URL}/search/${type}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}` : `${BASE_URL}/${type}/popular?api_key=${API_KEY}&page=${page}`;
        const res = await fetch(url);
        return await res.json();
    } catch (err) { return null; }
}

// Restored TMDB Content Details fetching for player metadata
async function fetchContentDetails(id, type) {
    try {
        const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
        const data = await res.json();
        if (type === 'tv' && data.seasons) {
            const seasonPromises = data.seasons.filter(s => s.season_number >= 1).map(async s => {
                const sRes = await fetch(`${BASE_URL}/tv/${id}/season/${s.season_number}?api_key=${API_KEY}`);
                const sData = await sRes.json();
                return { ...s, episodes: sData.episodes || [] };
            });
            data.seasons = await Promise.all(seasonPromises);
        }
        return data;
    } catch (err) { return null; }
}

// Restored TMDB Trailer fetching
async function fetchTrailer(id, type) {
    try {
        const res = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
        const data = await res.json();
        const trailer = data.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
        return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
    } catch (err) { return null; }
}

// --- RENDERING ---
function renderGallery(items) {
    galleryContainer.innerHTML = '';
    if (!items?.length) { galleryContainer.innerHTML = '<p class="col-span-full text-center">No results.</p>'; return; }
    items.forEach(item => {
        const title = item.title || item.name;
        const posterUrl = `${IMAGE_BASE_URL}${item.poster_path}`;
        const isFavorited = favoritedItems.hasOwnProperty(`${item.id}-${currentType}`);
        const card = document.createElement('div');
        card.className = "gallery-card";
        
        let watchedBanner = '';
        const recent = recentlyWatchedItems[`${item.id}-${currentType}`];
        if (recent) watchedBanner = `<div class="watched-banner">Watched ${new Date(recent.date).toLocaleDateString()}</div>`;

        card.innerHTML = `
            ${watchedBanner}
            <span class="favorite-heart ${isFavorited ? 'active' : 'inactive'}"> ${isFavorited ? '❤' : '♡'}</span>
            <img src="${posterUrl}" alt="${title}">
            <div class="card-info"><h3>${title}</h3><p>${(item.release_date || item.first_air_date || '').substring(0, 4)}</p></div>`;
        
        card.querySelector('.favorite-heart').onclick = e => { e.stopPropagation(); toggleFavorite(item.id, currentType, posterUrl, title); };
        card.onclick = async () => {
            const details = await fetchContentDetails(item.id, currentType);
            if (details) openPlayer(details);
        };
        galleryContainer.appendChild(card);
    });
}

// --- UPDATE UI ---
function updateUI() {
    fetchContent(currentType, currentPage, currentQuery).then(data => {
        if (!data) return;
        renderGallery(data.results);
        pageInfoSpan.textContent = pageInfoBottomSpan.textContent = `Page ${data.page} of ${data.total_pages}`;
        prevPageBtn.disabled = prevPageBottomBtn.disabled = data.page <= 1;
        nextPageBtn.disabled = nextPageBottomBtn.disabled = data.page >= data.total_pages;
        galleryTitle.textContent = currentQuery ? `Results for "${currentQuery}"` : `Popular ${currentType === 'movie' ? 'Movies' : 'TV Shows'}`;
    });
}

// ================= RESTORED MOVIE/TV PLAYER LOGIC =================
function openPlayer(itemData, s = null, e = null) {
    document.body.style.overflow = "hidden"; // Scroll-locking layout stabilization
    currentItemData = itemData;
    const isMovie = !!itemData.title;
    const type = isMovie ? 'movie' : 'tv';
    currentType = type;
    
    modalTitle.textContent = itemData.title || itemData.name;
    summaryDisplay.textContent = itemData.overview;
    
    const isTV = type === 'tv';
    episodeSelector.classList.toggle('hidden', !isTV);
    episodeNavButtons.classList.toggle('hidden', !isTV);
    
    videoModal.classList.remove('hidden');
    videoModal.classList.add('visible');
    
    if (isTV) {
        populateSeasonSelect(s, e);
    } else {
        populateSourceSelector();
    }
}

function populateSourceSelector() {
    const list = isSandboxMode ? sandboxedSources : noSandboxSources;
    sourceSelector.innerHTML = availableSources.filter(s => list.includes(s.id)).map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    sourceSelector.onchange = updatePlayer;
    updatePlayer();
}

function populateSeasonSelect(s, e) {
    if (!currentItemData.seasons) return;
    seasonSelect.innerHTML = currentItemData.seasons.map(s => `<option value="${s.season_number}">Season ${s.season_number}</option>`).join('');
    if (s) seasonSelect.value = s;
    seasonSelect.onchange = () => populateEpisodeSelect();
    populateEpisodeSelect(e);
}

function populateEpisodeSelect(e) {
    const season = currentItemData.seasons.find(s => s.season_number == seasonSelect.value);
    if (!season || !season.episodes) return;
    episodeSelect.innerHTML = season.episodes.map(ep => `<option value="${ep.episode_number}">Ep ${ep.episode_number}: ${ep.name}</option>`).join('');
    if (e) episodeSelect.value = e;
    episodeSelect.onchange = updatePlayer;
    populateSourceSelector();
}

function updatePlayer() {
    if (!currentItemData) return;
    const src = availableSources.find(s => s.id === sourceSelector.value);
    if (!src) return;

    let url = "";
    if (currentType === 'movie') {
        url = src.urls.movie.replace('{id}', currentItemData.id);
        nowPlayingDisplay.textContent = currentItemData.title;
        summaryDisplay.textContent = currentItemData.overview;
    } else {
        url = src.urls.tv.replace('{id}', currentItemData.id)
                      .replace('{season}', seasonSelect.value)
                      .replace('{episode}', episodeSelect.value);
        
        const season = currentItemData.seasons.find(s => s.season_number == seasonSelect.value);
        const ep = season?.episodes.find(e => e.episode_number == episodeSelect.value);
        nowPlayingDisplay.textContent = ep ? `S${seasonSelect.value}E${episodeSelect.value}: ${ep.name}` : `${currentItemData.name} - Season ${seasonSelect.value} Episode ${episodeSelect.value}`;
        summaryDisplay.textContent = ep?.overview || currentItemData.overview;
    }
    
    iframeContainer.innerHTML = `<iframe id="videoPlayer" class="w-full h-full absolute" src="${url}" allowfullscreen ${isSandboxMode ? 'sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-fullscreen"' : ''}></iframe>`;
    saveRecentlyWatched();
}

function navigateEpisode(direction) {
    if (currentType !== 'tv' || !currentItemData?.seasons) return;
    let currentSeasonNum = parseInt(seasonSelect.value);
    let currentEpisodeNum = parseInt(episodeSelect.value);
    
    let season = currentItemData.seasons.find(s => s.season_number == currentSeasonNum);
    if (!season) return;
    
    if (direction === 1) {
        const hasNextEpisode = season.episodes.some(e => e.episode_number == currentEpisodeNum + 1);
        if (hasNextEpisode) {
            episodeSelect.value = currentEpisodeNum + 1;
        } else {
            const nextSeason = currentItemData.seasons.find(s => s.season_number == currentSeasonNum + 1);
            if (nextSeason && nextSeason.episodes.length > 0) {
                seasonSelect.value = currentSeasonNum + 1;
                populateEpisodeSelect(1);
                return;
            }
        }
    } else if (direction === -1) {
        if (currentEpisodeNum > 1) {
            episodeSelect.value = currentEpisodeNum - 1;
        } else {
            const prevSeason = currentItemData.seasons.find(s => s.season_number == currentSeasonNum - 1);
            if (prevSeason && prevSeason.episodes.length > 0) {
                seasonSelect.value = currentSeasonNum - 1;
                const lastEpNum = prevSeason.episodes[prevSeason.episodes.length - 1].episode_number;
                populateEpisodeSelect(lastEpNum);
                return;
            }
        }
    }
    updatePlayer();
}

// --- AUDIO VISUALIZERS ---
const audio = document.getElementById('myAudio');
const radioAudio = document.getElementById('radioAudio');
let aCtx, rCtx, aAn, rAn;
let animationFrameHolla, animationFrameRadio;

function drawEqualizer(canvas, analyser, color) {
    const ctx = canvas.getContext('2d');
    analyser.fftSize = 64;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function renderFrame() {
        if (canvas.id === 'audio-canvas') {
            animationFrameHolla = requestAnimationFrame(renderFrame);
        } else {
            animationFrameRadio = requestAnimationFrame(renderFrame);
        }
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 1.4;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
            ctx.fillStyle = color;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
    }
    renderFrame();
}

function initAudio(type) {
    if (type === 'holla' && !aCtx) {
        aCtx = new (window.AudioContext || window.webkitAudioContext)();
        aAn = aCtx.createAnalyser();
        aCtx.createMediaElementSource(audio).connect(aAn);
        aAn.connect(aCtx.destination);
    } else if (type === 'radio' && !rCtx) {
        rCtx = new (window.AudioContext || window.webkitAudioContext)();
        rAn = rCtx.createAnalyser();
        rCtx.createMediaElementSource(radioAudio).connect(rAn);
        rAn.connect(rCtx.destination);
    }
}

window.togglePlayback = () => {
    initAudio('holla');
    const icon = document.getElementById('musicHeroicon');
    const container = document.getElementById('audioEqContainer');
    const canvas = document.getElementById('audio-canvas');
    
    if (audio.paused) {
        radioAudio.pause();
        document.getElementById('radioMusicHeroicon').style.color = '';
        document.getElementById('radioEqContainer').classList.remove('open');
        cancelAnimationFrame(animationFrameRadio);
        
        audio.play();
        icon.style.color = '#22c55e';
        container.classList.add('open');
        drawEqualizer(canvas, aAn, '#c084fc');
        document.getElementById('message').textContent = 'Now Playing';
    } else {
        audio.pause();
        icon.style.color = '';
        container.classList.remove('open');
        cancelAnimationFrame(animationFrameHolla);
        document.getElementById('message').textContent = 'Paused';
    }
};

window.toggleRadioPlayback = () => {
    initAudio('radio');
    const icon = document.getElementById('radioMusicHeroicon');
    const container = document.getElementById('radioEqContainer');
    const canvas = document.getElementById('radio-canvas');
    
    if (radioAudio.paused) {
        audio.pause();
        document.getElementById('musicHeroicon').style.color = '';
        document.getElementById('audioEqContainer').classList.remove('open');
        cancelAnimationFrame(animationFrameHolla);
        
        radioAudio.src = document.getElementById('radioStationSelect').value;
        radioAudio.play();
        icon.style.color = '#22c55e';
        container.classList.add('open');
        drawEqualizer(canvas, rAn, '#3b82f6');
        document.getElementById('radioMessage').textContent = 'Radio Playing';
    } else {
        radioAudio.pause();
        icon.style.color = '';
        container.classList.remove('open');
        cancelAnimationFrame(animationFrameRadio);
        document.getElementById('radioMessage').textContent = 'Radio Paused';
    }
};

// ================= LIQUID GLASS LIVE TV PLAYER JAVASCRIPT =================
const XML_URL = 'https://raw.githubusercontent.com/dp247/Freeview-EPG/master/epg.xml';

// Dynamic formulation of NYC Date
const nyDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
const yyyy = nyDate.getFullYear();
const mm = String(nyDate.getMonth() + 1).padStart(2, '0');
const dd = String(nyDate.getDate()).padStart(2, '0');
const formattedNYDate = `${yyyy}${mm}${dd}`;

const CH4_XML_URL = `https://epg.pw/api/epg.xml?lang=en&date=${formattedNYDate}&channel_id=486699`;

const CHANNELS = [
    {
        "name":"BBC One",
        "code":"gb",
        "url":"https://cdnlivetv.tv/api/v1/channels/player/?name=BBC%20One&code=gb&user=cdnlivetv&plan=free",
        "backupUrl":"https://dlhd.pk/player/stream-356.php",
        "backupUrl2": "https://daddylive.li/embed/embed.php?id=356&player=1&source=tv.json",
        "image":"https://api.cdnlivetv.tv/api/v1/channels/images6318/united-kingdom/bbc-one.svg"
    },
    {
        "name":"BBC Two",
        "code":"gb",
        "url":"https://cdnlivetv.tv/api/v1/channels/player/?name=BBC%20Two&code=gb&user=cdnlivetv&plan=free",
        "backupUrl":"https://dlhd.pk/player/stream-357.php",
        "backupUrl2": "https://daddylive.li/embed/embed.php?id=357&player=1&source=tv.json",
        "image":"https://api.cdnlivetv.tv/api/v1/channels/images6318/united-kingdom/bbc-two.svg"
    },
    {
        "name":"BBC Three",
        "code":"gb",
        "url":"https://cdnlivetv.tv/api/v1/channels/player/?name=BBC%20Three&code=gb&user=cdnlivetv&plan=free",
        "backupUrl":"https://dlhd.pk/player/stream-358.php",
        "backupUrl2": "https://daddylive.li/embed/embed.php?id=358&player=1&source=tv.json",
        "image":"https://api.cdnlivetv.tv/api/v1/channels/images6318/united-kingdom/bbc-three.webp"
    },
    {
        "name":"BBC Four",
        "code":"gb",
        "url":"https://cdnlivetv.tv/api/v1/channels/player/?name=BBC%20Four&code=gb&user=cdnlivetv&plan=free",
        "backupUrl":"https://dlhd.pk/player/stream-359.php",
        "backupUrl2": "https://daddylive.li/embed/embed.php?id=359&player=1&source=tv.json",
        "image":"https://api.cdnlivetv.tv/api/v1/channels/images6318/united-kingdom/bbc-four.svg"
    },
    {
        "name":"ITV 1",
        "code":"gb",
        "url":"https://cdnlivetv.tv/api/v1/channels/player/?name=ITV%201&code=gb&user=cdnlivetv&plan=free",
        "backupUrl":"https://dlhd.pk/player/stream-350.php",
        "backupUrl2":"https://daddylive.li/embed/embed.php?id=350&player=1&source=tv.json",
        "image":"https://api.cdnlivetv.tv/api/v1/channels/images6318/united-kingdom/itv-1.svg"
    },
    {
        "name":"ITV 2",
        "code":"gb",
        "url":"https://cdnlivetv.tv/api/v1/channels/player/?name=ITV%202&code=gb&user=cdnlivetv&plan=free",
        "backupUrl":"https://dlhd.pk/player/stream-351.php",
        "backupUrl2":"https://daddylive.li/embed/embed.php?id=351&player=1&source=tv.json",
        "image":"https://api.cdnlivetv.tv/api/v1/channels/images6318/united-kingdom/itv-2.svg"
    },
    {
        "name":"ITV 3",
        "code":"gb",
        "url":"https://cdnlivetv.tv/api/v1/channels/player/?name=ITV%203&code=gb&user=cdnlivetv&plan=free",
        "backupUrl":"https://dlhd.pk/player/stream-352.php",
        "backupUrl2":"https://daddylive.li/embed/embed.php?id=352&player=1&source=tv.json",
        "image":"https://api.cdnlivetv.tv/api/v1/channels/images6318/united-kingdom/itv-3.svg"
    },
    {
        "name":"ITV 4",
        "code":"gb",
        "url":"https://cdnlivetv.tv/api/v1/channels/player/?name=ITV%204&code=gb&user=cdnlivetv&plan=free",
        "backupUrl":"https://dlhd.pk/player/stream-353.php",
        "backupUrl2":"https://daddylive.li/embed/embed.php?id=353&player=1&source=tv.json",
        "image":"https://api.cdnlivetv.tv/api/v1/channels/images6318/united-kingdom/itv-4.svg"
    },
    {
        "name":"Channel 4",
        "code":"gb",
        "url":"https://cdnlivetv.tv/api/v1/channels/player/?name=Channel%204&code=gb&user=cdnlivetv&plan=free",
        "backupUrl":"https://dlhd.pk/player/stream-354.php",
        "backupUrl2":"https://daddylive.li/embed/embed.php?id=354&player=1&source=tv.json",
        "image":"https://api.cdnlivetv.tv/api/v1/channels/images6318/united-kingdom/channel-4.svg",
        "isCustomEPG": true
    },
    {
        "name":"Channel 5",
        "code":"gb",
        "url":"https://cdnlivetv.tv/api/v1/channels/player/?name=Channel%204&code=gb&user=cdnlivetv&plan=free",
        "backupUrl":"https://dlhd.pk/player/stream-355.php",
        "backupUrl2":"https://daddylive.li/embed/embed.php?id=355&player=1&source=tv.json",
        "image":"https://api.cdnlivetv.tv/api/v1/channels/images6318/united-kingdom/channel-5.svg"
    }
];

let loadedChannels = [];
let loadedPrograms = [];
let liveCurrentUrl = "";
let selectedChannelIdx = null;
let streamSource = "primary"; // "primary", "backup", or "backup2"
let epgUpdateInterval = null;

async function initLiquidGlassLivePlayer() {
    try {
        const [resMain, resCh4] = await Promise.allSettled([
            fetch(XML_URL).then(r => r.text()),
            fetch(CH4_XML_URL).then(r => r.text())
        ]);

        let xmlMain = null;
        let xmlCh4 = null;

        if (resMain.status === "fulfilled") {
            xmlMain = new DOMParser().parseFromString(resMain.value, "text/xml");
        }
        if (resCh4.status === "fulfilled") {
            xmlCh4 = new DOMParser().parseFromString(resCh4.value, "text/xml");
        }

        if (xmlMain) {
            const allChannelNodes = Array.from(xmlMain.getElementsByTagName('channel'));
            loadedChannels = CHANNELS.map(local => {
                if (local.isCustomEPG) {
                    return { ...local, xmlId: "channel-4-custom" };
                }
                const match = allChannelNodes.find(node => {
                    const xmlName = node.getElementsByTagName('display-name')[0]?.textContent?.toUpperCase() || "";
                    const localName = local.name.toUpperCase().replace(/\s/g, '');
                    const cleanXmlName = xmlName.replace(/\s/g, '');
                    return cleanXmlName === localName || 
                           cleanXmlName.startsWith(localName) || 
                           (local.name === "Channel 5" && cleanXmlName === "FIVE");
                });
                return { ...local, xmlId: match ? match.getAttribute('id') : null };
            });

            loadedPrograms = Array.from(xmlMain.getElementsByTagName('programme'))
                .map(p => ({
                    chId: p.getAttribute('channel'),
                    start: parseDate(p.getAttribute('start')),
                    stop: parseDate(p.getAttribute('stop')),
                    title: p.getElementsByTagName('title')[0]?.textContent || "Untitled Program",
                    desc: p.getElementsByTagName('desc')[0]?.textContent || "No description provided."
                }));
        } else {
            loadedChannels = CHANNELS;
        }

        if (xmlCh4) {
            const ch4Programmes = Array.from(xmlCh4.getElementsByTagName('programme'))
                .map(p => ({
                    chId: "channel-4-custom",
                    start: parseDate(p.getAttribute('start')),
                    stop: parseDate(p.getAttribute('stop')),
                    title: p.getElementsByTagName('title')[0]?.textContent || "Untitled Program",
                    desc: p.getElementsByTagName('desc')[0]?.textContent || "No description provided."
                }));
            
            loadedPrograms = loadedPrograms.filter(p => p.chId !== "channel-4-custom").concat(ch4Programmes);
        }

        document.getElementById('sync-status').innerText = "10 Channels";
        document.getElementById('sync-status').className = "text-[10px] text-green-300 font-bold bg-green-950/50 px-2 py-0.5 rounded border border-green-500/20";
        
        renderSidebarChannels();
        if (epgUpdateInterval) clearInterval(epgUpdateInterval);
        epgUpdateInterval = setInterval(renderSidebarChannels, 60000);

    } catch (e) {
        console.error(e);
        document.getElementById('sync-status').innerText = "EPG ERROR";
        document.getElementById('sync-status').className = "text-[10px] text-red-300 font-bold bg-red-950/50 px-2 py-0.5 rounded border border-red-500/20";
        loadedChannels = CHANNELS;
        renderSidebarChannels();
    }
}

function parseDate(s) {
    if (!s) return new Date();
    const y = s.slice(0,4), m = s.slice(4,6)-1, d = s.slice(6,8), h = s.slice(8,10), min = s.slice(10,12);
    let offset = 0;
    if (s.includes(' ')) {
        const parts = s.split(' ');
        const offsetStr = parts[1];
        const sign = offsetStr[0] === '+' ? 1 : -1;
        const offH = parseInt(offsetStr.slice(1,3), 10);
        const offM = parseInt(offsetStr.slice(3,5), 10);
        offset = sign * (offH * 60 + offM) * 60 * 1000;
    }
    const utcTime = Date.UTC(y, m, d, h, min);
    return new Date(utcTime - offset);
}

function formatTimeNY(date) {
    return date.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).toLowerCase();
}

// --- DYNAMIC PROGRESS BAR CALC ---
function getProgressPercent(start, stop) {
    const now = new Date();
    const total = stop.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

window.setStreamSource = (source) => {
    streamSource = source;
    
    const btnPrimary = document.getElementById('btn-primary');
    const btnBackup = document.getElementById('btn-backup');
    const btnBackup2 = document.getElementById('btn-backup2');
    const sourceLabel = document.getElementById('current-source-label');
    
    const activeStyle = "flex-1 sm:flex-initial px-3.5 py-2 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-all duration-200 bg-purple-600/80 text-white border border-purple-400/40 shadow-lg shadow-purple-500/20";
    const inactiveStyle = "flex-1 sm:flex-initial px-3.5 py-2 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-all duration-200 bg-purple-950/40 text-purple-300 border border-purple-500/20 hover:border-purple-400/40 hover:bg-purple-900/25";
    const disabledStyle = "flex-1 sm:flex-initial px-3.5 py-2 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-all duration-200 bg-slate-950/40 text-slate-600 border border-slate-900 cursor-not-allowed opacity-55";

    let currentCh = selectedChannelIdx !== null ? loadedChannels[selectedChannelIdx] : null;

    btnPrimary.className = inactiveStyle;
    btnBackup.className = inactiveStyle;
    
    if (currentCh && !currentCh.backupUrl2) {
        btnBackup2.className = disabledStyle;
        if (streamSource === 'backup2') {
            streamSource = 'primary';
        }
    } else {
        btnBackup2.className = inactiveStyle;
    }

    if (streamSource === 'primary') {
        btnPrimary.className = activeStyle;
        sourceLabel.innerText = "Primary stream active";
    } else if (streamSource === 'backup') {
        btnBackup.className = activeStyle;
        sourceLabel.innerText = "Backup 1 stream active";
    } else if (streamSource === 'backup2') {
        btnBackup2.className = activeStyle;
        sourceLabel.innerText = "Backup 2 stream active";
    }

    if (currentCh) {
        let activeUrl = currentCh.url;
        if (streamSource === 'backup') activeUrl = currentCh.backupUrl;
        if (streamSource === 'backup2' && currentCh.backupUrl2) activeUrl = currentCh.backupUrl2;
        
        if (liveCurrentUrl !== activeUrl) {
            liveCurrentUrl = activeUrl;
            document.getElementById('player-placeholder').style.display = 'none';
            const mainPlayer = document.getElementById('main-player');
            
            // Secure sandboxing applied selectively for backup streams
            if (streamSource === 'backup' || streamSource === 'backup2') {
                mainPlayer.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-fullscreen');
            } else {
                mainPlayer.removeAttribute('sandbox');
            }
            
            mainPlayer.src = activeUrl;
        }
    }
};

function renderSidebarChannels() {
    const listContainer = document.getElementById('channels-list');
    listContainer.innerHTML = "";
    const now = new Date();

    loadedChannels.forEach((ch, idx) => {
        const channelProgs = loadedPrograms.filter(p => p.chId === ch.xmlId).sort((a, b) => a.start - b.start);
        const nowPlaying = channelProgs.find(p => now >= p.start && now < p.stop);
        const upNext = channelProgs.find(p => p.start >= now);

        const tile = document.createElement('div');
        tile.className = `channel-tile rounded-xl p-3.5 cursor-pointer flex flex-col gap-3 relative ${selectedChannelIdx === idx ? 'selected' : ''}`;
        
        const progress = nowPlaying ? getProgressPercent(nowPlaying.start, nowPlaying.stop) : 0;
        const episodeDesc = nowPlaying ? nowPlaying.desc : 'No description available.';

        tile.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-6 bg-white/5 rounded px-1.5 py-0.5 flex items-center justify-center border border-white/10">
                        <img src="${ch.image}" class="max-w-full max-h-full object-contain filter drop-shadow" onerror="this.style.opacity=0.3">
                    </div>
                    <span class="font-bold text-xs md:text-sm text-purple-200 tracking-tight">${ch.name}</span>
                </div>
                ${nowPlaying ? `<span class="text-[9px] font-extrabold uppercase bg-purple-600/70 px-1.5 py-0.5 rounded-full text-white tracking-widest animate-pulse border border-purple-400/40">LIVE</span>` : ''}
            </div>

            <div class="bg-black/40 rounded-lg p-2.5 border border-purple-500/10">
                <div class="text-[9px] text-purple-400 font-extrabold uppercase tracking-widest">NOW PLAYING</div>
                <div class="text-xs font-bold text-white truncate mt-0.5">${nowPlaying ? nowPlaying.title : 'No Schedule Data available'}</div>
                
                ${nowPlaying ? `
                <div class="text-[10px] text-purple-300/65 mt-1.5 flex justify-between items-center font-medium">
                    <span>${formatTimeNY(nowPlaying.start)} - ${formatTimeNY(nowPlaying.stop)}</span>
                    <span>${progress}%</span>
                </div>
                <div class="w-full bg-purple-950/60 h-1 rounded-full overflow-hidden mt-1.5 border border-purple-500/10">
                    <div class="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
                </div>
                ` : ''}
            </div>

            ${nowPlaying ? `
            <div class="block lg:hidden text-[11px] text-purple-300/80 leading-relaxed bg-black/20 p-2.5 rounded-lg border border-purple-500/5">
                ${episodeDesc}
            </div>
            ` : ''}

            ${upNext ? `
            <div class="flex items-center justify-between gap-2 text-[11px] px-1 text-purple-300/60">
                <span class="truncate font-medium">
                    <strong class="text-purple-400 font-bold mr-1">UP NEXT:</strong> ${upNext.title}
                </span>
                <span class="flex-shrink-0 text-[10px] bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/10 font-bold text-purple-300">
                    ${formatTimeNY(upNext.start)}
                </span>
            </div>
            ` : `
            <div class="text-[10px] px-1 text-purple-300/30 italic">No upcoming schedule</div>
            `}
        `;

        tile.onclick = () => {
            selectedChannelIdx = idx;
            document.querySelectorAll('.channel-tile').forEach(b => b.classList.remove('selected'));
            tile.classList.add('selected');

            if (nowPlaying) {
                document.getElementById('p-title').innerText = nowPlaying.title;
                document.getElementById('p-time-range').innerText = `${formatTimeNY(nowPlaying.start)} - ${formatTimeNY(nowPlaying.stop)}`;
                document.getElementById('p-desc').innerText = nowPlaying.desc;
            } else {
                document.getElementById('p-title').innerText = ch.name;
                document.getElementById('p-time-range').innerText = "Live Stream";
                document.getElementById('p-desc').innerText = "Enjoy high-definition streams on the Liquid Glass player interface.";
            }

            document.getElementById('p-channel-name').innerText = ch.name;
            document.getElementById('p-meta').style.opacity = "1";

            if (streamSource === 'backup2' && !ch.backupUrl2) {
                streamSource = 'primary';
            }

            let activeUrl = ch.url;
            if (streamSource === 'backup') activeUrl = ch.backupUrl;
            if (streamSource === 'backup2' && ch.backupUrl2) activeUrl = ch.backupUrl2;

            setStreamSource(streamSource);

            if (liveCurrentUrl !== activeUrl) {
                liveCurrentUrl = activeUrl;
                document.getElementById('player-placeholder').style.display = 'none';
                const mainPlayer = document.getElementById('main-player');
                
                // Secure sandboxing applied selectively for backup streams
                if (streamSource === 'backup' || streamSource === 'backup2') {
                    mainPlayer.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-fullscreen');
                } else {
                    mainPlayer.removeAttribute('sandbox');
                }
                
                mainPlayer.src = activeUrl;
            }
        };

        listContainer.appendChild(tile);
    });
}

// --- EVENT LISTENERS & TRIGGERS ---
searchInput.oninput = () => { currentQuery = searchInput.value; currentPage = 1; updateUI(); };

document.getElementById('radioStationSelect').onchange = () => { if (!radioAudio.paused) toggleRadioPlayback(); toggleRadioPlayback(); };

showMoviesBtn.onclick = () => { currentType = 'movie'; currentPage = 1; showMoviesBtn.classList.replace('inactive', 'active'); showTvBtn.classList.replace('active', 'inactive'); updateUI(); };
showTvBtn.onclick = () => { currentType = 'tv'; currentPage = 1; showTvBtn.classList.replace('inactive', 'active'); showMoviesBtn.classList.replace('active', 'inactive'); updateUI(); };

const paginate = (dir) => { currentPage += dir; updateUI(); window.scrollTo(0, 0); };
prevPageBtn.onclick = prevPageBottomBtn.onclick = () => paginate(-1);
nextPageBtn.onclick = nextPageBottomBtn.onclick = () => paginate(1);

// --- LIVE TV MODAL ACTION COUPLERS ---
liveTvTrigger.addEventListener('click', () => {
    // Lock background body scrolling completely to stabilize viewports
    document.body.style.overflow = "hidden";
    liveTvModal.classList.remove('hidden');
    liveTvModal.classList.add('flex');
    initLiquidGlassLivePlayer();
});

closeLiveTv.addEventListener('click', () => {
    document.body.style.overflow = "";
    liveTvModal.classList.remove('flex');
    liveTvModal.classList.add('hidden');
    const mainPlayer = document.getElementById('main-player');
    mainPlayer.src = "";
    mainPlayer.removeAttribute('sandbox');
    liveCurrentUrl = "";
    if (epgUpdateInterval) {
        clearInterval(epgUpdateInterval);
        epgUpdateInterval = null;
    }
});

// --- RESTORED MOVIE/TV PLAYER CLOSE EVENT HANDLERS ---
modalCloseBtn.onclick = () => {
    document.body.style.overflow = "";
    videoModal.classList.remove('visible');
    setTimeout(() => {
        videoModal.classList.add('hidden');
        iframeContainer.innerHTML = '';
    }, 300);
};

fullscreenBtn.onclick = () => {
    if (iframeContainer.requestFullscreen) {
        iframeContainer.requestFullscreen();
    }
};

showNoSandboxBtn.onclick = () => {
    isSandboxMode = false;
    showNoSandboxBtn.classList.add('active', 'ring-2', 'ring-purple-300');
    showSandboxBtn.classList.remove('active', 'ring-2', 'ring-purple-300');
    populateSourceSelector();
};

showSandboxBtn.onclick = () => {
    isSandboxMode = true;
    showSandboxBtn.classList.add('active', 'ring-2', 'ring-purple-300');
    showNoSandboxBtn.classList.remove('active', 'ring-2', 'ring-purple-300');
    populateSourceSelector();
};

trailerBtn.onclick = async () => {
    if (!currentItemData) return;
    const trailerUrl = await fetchTrailer(currentItemData.id, currentType);
    if (trailerUrl) {
        iframeContainer.innerHTML = `<iframe class="w-full h-full absolute" src="${trailerUrl}" allowfullscreen></iframe>`;
    }
};

prevEpisodeBtn.onclick = () => navigateEpisode(-1);
nextEpisodeBtn.onclick = () => navigateEpisode(1);

// --- RESTORED SECRET HEART EVENT HANDLERS ---
floatingHeart.onclick = () => {
    document.body.style.overflow = "hidden";
    heartVideoModal.style.display = 'flex';
};

heartModalCloseBtn.onclick = () => {
    document.body.style.overflow = "";
    heartVideoModal.style.display = 'none';
    // Stop YouTube iframe from playing behind the scenes when closing
    const ytFrame = document.getElementById('heatherSecretYouTube');
    ytFrame.src = ytFrame.src;
};

// --- RESTORED FAVORITES CLICK TRIGGERS ---
openFavoritesBtn.onclick = openFavoritesModal;
closeFavoritesBtn.onclick = closeFavoritesModal;

document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
    loadRecentlyWatched();
    updateUI();
});

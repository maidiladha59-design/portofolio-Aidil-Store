(function () {
    const loader = document.getElementById('rex-loader');
    const loaderBar = document.getElementById('rex-loader-bar');
    const loaderPercent = document.getElementById('rex-loader-percent');
    if (!loader) return;

    let progress = 0;

    const interval = setInterval(() => {
        const step = progress < 70 ? Math.random() * 8 + 3 : Math.random() * 2 + 0.5;
        progress = Math.min(progress + step, 99);
        if (loaderBar) loaderBar.style.width = progress + '%';
        if (loaderPercent) loaderPercent.textContent = Math.floor(progress) + '%';
    }, 60);

    function hideLoader() {
        clearInterval(interval);
        if (loaderBar) loaderBar.style.width = '100%';
        if (loaderPercent) loaderPercent.textContent = '100%';
        setTimeout(() => {
            loader.classList.add('loader-done');
            setTimeout(() => loader.remove(), 700);
        }, 300);
    }

    if (document.readyState === 'complete') {
        setTimeout(hideLoader, 800);
    } else {
        window.addEventListener('load', () => setTimeout(hideLoader, 500));
        setTimeout(hideLoader, 4000);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    obs.unobserve(entry.target);
                }
            });
        },
        { root: null, rootMargin: '0px', threshold: 0.1 }
    );
    document.querySelectorAll('.fade-in-up').forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });

    const textToType = 'Hello World, I am';
    let i = 0;
    const targetElement = document.getElementById('typewriter');
    function typeWriter() {
        if (!targetElement) return;
        if (i < textToType.length) {
            targetElement.innerHTML += textToType.charAt(i++);
            setTimeout(typeWriter, 80);
        }
    }
    setTimeout(typeWriter, 1200);

    const audioEl  = document.getElementById('bg-audio');
    const btnPlay  = document.getElementById('btn-play');
    const btnNext  = document.getElementById('btn-next');
    const titleEl  = document.getElementById('music-title');
    const artistEl = document.getElementById('music-artist');
    const coverEl  = document.getElementById('music-cover');
    let playlist = [], isPlaying = false, currentIndex = 0, playlistLoaded = false;

    async function loadPlaylist() {
        if (playlistLoaded) return;
        playlistLoaded = true;
        try {
            const res = await fetch('./playlist.json');
            if (!res.ok) throw new Error('playlist.json tidak ditemukan');
            playlist = await res.json();
            if (!Array.isArray(playlist) || !playlist.length) throw new Error('playlist.json kosong');
            currentIndex = Math.floor(Math.random() * playlist.length);
            loadSong(currentIndex);
        } catch (err) {
            console.error(err);
            if (titleEl) titleEl.textContent = 'Playlist Error';
            if (artistEl) artistEl.textContent = 'Cek playlist.json';
        }
    }

    function loadSong(index) {
        if (!playlist.length) return;
        const song = playlist[index];
        titleEl.textContent  = song.nama  || 'Unknown Title';
        artistEl.textContent = song.artis || 'Unknown Artist';
        coverEl.src          = song.image || '';
        audioEl.src          = song.path  || '';
    }

    function playSong() {
        if (!audioEl.src) return;
        audioEl.play();
        btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
        coverEl.classList.add('spin-slow');
        isPlaying = true;
    }

    function pauseSong() {
        audioEl.pause();
        btnPlay.innerHTML = '<i class="fas fa-play ml-1"></i>';
        coverEl.classList.remove('spin-slow');
        isPlaying = false;
    }

    function nextSong() {
        if (!playlist.length) return;
        currentIndex = (currentIndex + 1) % playlist.length;
        loadSong(currentIndex);
        if (isPlaying) playSong();
    }

    btnPlay.addEventListener('click', async () => {
        await loadPlaylist();
        isPlaying ? pauseSong() : playSong();
    });
    btnNext.addEventListener('click', async () => {
        await loadPlaylist();
        nextSong();
    });
    audioEl.addEventListener('ended', nextSong);
    setTimeout(loadPlaylist, 2000);

    const canvas = document.getElementById('data-canvas');
    const ctx    = canvas.getContext('2d', { alpha: false });
    let w, h, pulses = [];
    const GRID_SIZE  = 70;
    const MAX_PULSES = 18;

    let gridCanvas = document.createElement('canvas');
    let gridCtx    = gridCanvas.getContext('2d');
    let gridDirty  = true;

    function buildGrid() {
        gridCanvas.width  = w;
        gridCanvas.height = h;
        gridCtx.clearRect(0, 0, w, h);
        gridCtx.beginPath();
        gridCtx.strokeStyle = 'rgba(255,255,255,0.018)';
        gridCtx.lineWidth = 1;
        for (let x = 0; x <= w; x += GRID_SIZE) { gridCtx.moveTo(x,0); gridCtx.lineTo(x,h); }
        for (let y = 0; y <= h; y += GRID_SIZE) { gridCtx.moveTo(0,y); gridCtx.lineTo(w,y); }
        gridCtx.stroke();
        gridDirty = false;
    }

    function initCanvas() {
        w = canvas.width  = window.innerWidth;
        h = canvas.height = window.innerHeight;
        gridDirty = true;
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { initCanvas(); createPulses(); }, 200);
    });

    class DataPulse {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.horizontal = Math.random() > 0.5;
            const range = this.horizontal ? h : w;
            this.gridPos   = Math.floor(Math.random() * Math.ceil(range / GRID_SIZE)) * GRID_SIZE;
            this.direction = Math.random() > 0.5 ? 1 : -1;
            this.speed     = (Math.random() * 1.2 + 0.4) * this.direction;
            this.length    = Math.random() * 90 + 40;
            this.alpha     = Math.random() * 0.35 + 0.15;
            if (initial) {
                this.x = this.horizontal ? Math.random() * w : this.gridPos;
                this.y = this.horizontal ? this.gridPos : Math.random() * h;
            } else {
                this.x = this.horizontal ? (this.direction===1 ? -this.length : w+this.length) : this.gridPos;
                this.y = this.horizontal ? this.gridPos : (this.direction===1 ? -this.length : h+this.length);
            }
        }
        update() {
            if (this.horizontal) {
                this.x += this.speed;
                if ((this.direction===1 && this.x > w+this.length) || (this.direction===-1 && this.x < -this.length)) this.reset();
            } else {
                this.y += this.speed;
                if ((this.direction===1 && this.y > h+this.length) || (this.direction===-1 && this.y < -this.length)) this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,106,221,${this.alpha})`;
            ctx.lineWidth = 2;
            ctx.moveTo(this.x, this.y);
            if (this.horizontal) ctx.lineTo(this.x - this.length*this.direction, this.y);
            else ctx.lineTo(this.x, this.y - this.length*this.direction);
            ctx.stroke();
        }
    }

    function createPulses() {
        const count = Math.min(Math.floor((w*h)/28000), MAX_PULSES);
        pulses = Array.from({length: count}, () => new DataPulse());
    }

    let animId, isPaused = false;

    function animate() {
        if (isPaused) return;
        animId = requestAnimationFrame(animate);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
        const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.6);
        grad.addColorStop(0, '#050505');
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        if (gridDirty) buildGrid();
        ctx.drawImage(gridCanvas, 0, 0);
        pulses.forEach(p => { p.update(); p.draw(); });
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { isPaused = true; cancelAnimationFrame(animId); }
        else { isPaused = false; animate(); }
    });

    initCanvas();
    createPulses();
    animate();

    const btnDonasi   = document.getElementById('btn-donasi');
    const modalQris   = document.getElementById('qris-modal');
    const btnClose    = document.getElementById('btn-close-modal');
    const qrisContent = document.getElementById('qris-content');

    function openModal() {
        modalQris.classList.remove('hidden');
        modalQris.classList.add('flex');
        setTimeout(() => {
            modalQris.classList.remove('opacity-0');
            qrisContent.classList.remove('scale-95');
            qrisContent.classList.add('scale-100');
        }, 10);
    }

    function closeModal() {
        modalQris.classList.add('opacity-0');
        qrisContent.classList.replace('scale-100', 'scale-95');
        setTimeout(() => {
            modalQris.classList.add('hidden');
            modalQris.classList.remove('flex');
        }, 300);
    }

    btnDonasi.addEventListener('click', openModal);
    btnClose.addEventListener('click', closeModal);
    modalQris.addEventListener('click', e => { if (e.target === modalQris) closeModal(); });
});

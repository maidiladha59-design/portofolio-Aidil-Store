document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = "running";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll(".fade-in-up").forEach(el => {
        el.style.animationPlayState = "paused";
        observer.observe(el);
    });

    const textToType = "Hello World, I am";
    const speed = 80;
    let i = 0;
    const targetElement = document.getElementById("typewriter");

    function typeWriter() {
        if (!targetElement) return;

        if (i < textToType.length) {
            targetElement.innerHTML += textToType.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }

    setTimeout(typeWriter, 500);

    const audioEl = document.getElementById("bg-audio");
    const btnPlay = document.getElementById("btn-play");
    const btnNext = document.getElementById("btn-next");
    const titleEl = document.getElementById("music-title");
    const artistEl = document.getElementById("music-artist");
    const coverEl = document.getElementById("music-cover");

    let playlist = [];
    let isPlaying = false;
    let currentIndex = 0;

    async function loadPlaylist() {
        try {
            const response = await fetch("./playlist.json");

            if (!response.ok) {
                throw new Error("playlist.json tidak ditemukan");
            }

            playlist = await response.json();

            if (!Array.isArray(playlist) || playlist.length === 0) {
                throw new Error("playlist.json kosong");
            }

            currentIndex = Math.floor(Math.random() * playlist.length);
            loadSong(currentIndex);
        } catch (error) {
            console.error(error);

            if (titleEl) titleEl.textContent = "Playlist Error";
            if (artistEl) artistEl.textContent = "Cek playlist.json";
        }
    }

    function loadSong(index) {
        if (!playlist.length) return;

        const song = playlist[index];

        titleEl.textContent = song.nama || "Unknown Title";
        artistEl.textContent = song.artis || "Unknown Artist";
        coverEl.src = song.image || "";
        audioEl.src = song.path || "";
    }

    function playSong() {
        if (!audioEl.src) return;

        audioEl.play();
        btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
        coverEl.classList.add("spin-slow");
        isPlaying = true;
    }

    function pauseSong() {
        audioEl.pause();
        btnPlay.innerHTML = '<i class="fas fa-play ml-1"></i>';
        coverEl.classList.remove("spin-slow");
        isPlaying = false;
    }

    function togglePlay() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    function nextSong() {
        if (!playlist.length) return;

        currentIndex++;

        if (currentIndex >= playlist.length) {
            currentIndex = 0;
        }

        loadSong(currentIndex);

        if (isPlaying) {
            playSong();
        }
    }

    loadPlaylist();

    btnPlay.addEventListener("click", togglePlay);

    btnNext.addEventListener("click", () => {
        nextSong();
    });

    audioEl.addEventListener("ended", () => {
        nextSong();
    });

    const canvas = document.getElementById("data-canvas");
    const ctx = canvas.getContext("2d");

    let w;
    let h;
    let pulses = [];
    const gridSize = 60;

    function initCanvas() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", () => {
        initCanvas();
        createPulses();
    });

    class DataPulse {
        constructor() {
            this.reset();
            this.x = this.horizontal ? Math.random() * w : this.gridPos;
            this.y = this.horizontal ? this.gridPos : Math.random() * h;
        }

        reset() {
            this.horizontal = Math.random() > 0.5;
            this.gridPos = Math.floor(Math.random() * ((this.horizontal ? h : w) / gridSize)) * gridSize;
            this.speed = Math.random() * 1.5 + 0.5;
            this.direction = Math.random() > 0.5 ? 1 : -1;
            this.speed *= this.direction;
            this.length = Math.random() * 100 + 40;

            if (this.horizontal) {
                this.x = this.direction === 1 ? -this.length : w + this.length;
                this.y = this.gridPos;
            } else {
                this.x = this.gridPos;
                this.y = this.direction === 1 ? -this.length : h + this.length;
            }

            this.alpha = Math.random() * 0.4 + 0.2;
        }

        update() {
            if (this.horizontal) {
                this.x += this.speed;

                if (
                    (this.direction === 1 && this.x > w + this.length) ||
                    (this.direction === -1 && this.x < -this.length)
                ) {
                    this.reset();
                }
            } else {
                this.y += this.speed;

                if (
                    (this.direction === 1 && this.y > h + this.length) ||
                    (this.direction === -1 && this.y < -this.length)
                ) {
                    this.reset();
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 106, 221, ${this.alpha})`;
            ctx.lineWidth = 2;

            ctx.moveTo(this.x, this.y);

            if (this.horizontal) {
                ctx.lineTo(this.x - this.length * this.direction, this.y);
            } else {
                ctx.lineTo(this.x, this.y - this.length * this.direction);
            }

            ctx.stroke();
        }
    }

    function createPulses() {
        pulses = [];

        const numPulses = Math.floor((w * h) / 25000);

        for (let i = 0; i < numPulses; i++) {
            pulses.push(new DataPulse());
        }
    }

    function drawGrid() {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
        ctx.lineWidth = 1;

        for (let x = 0; x <= w; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }

        for (let y = 0; y <= h; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }

        ctx.stroke();
    }

    function animate() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, w, h);

        drawGrid();

        pulses.forEach(pulse => {
            pulse.update();
            pulse.draw();
        });

        requestAnimationFrame(animate);
    }

    initCanvas();
    createPulses();
    animate();

    const btnDonasi = document.getElementById("btn-donasi");
    const modalQris = document.getElementById("qris-modal");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const qrisContent = document.getElementById("qris-content");

    function openModal() {
        modalQris.classList.remove("hidden");
        modalQris.classList.add("flex");

        setTimeout(() => {
            modalQris.classList.remove("opacity-0");
            qrisContent.classList.remove("scale-95");
            qrisContent.classList.add("scale-100");
        }, 10);
    }

    function closeModal() {
        modalQris.classList.add("opacity-0");
        qrisContent.classList.remove("scale-100");
        qrisContent.classList.add("scale-95");

        setTimeout(() => {
            modalQris.classList.add("hidden");
            modalQris.classList.remove("flex");
        }, 300);
    }

    btnDonasi.addEventListener("click", openModal);
    btnCloseModal.addEventListener("click", closeModal);

    modalQris.addEventListener("click", e => {
        if (e.target === modalQris) {
            closeModal();
        }
    });
});
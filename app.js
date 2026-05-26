document.addEventListener('DOMContentLoaded', () => {
    
    // Constant weight data
    const START_WEIGHT_LU = 88.0;
    const START_WEIGHT_TEMEN = 67.1;
    const START_DATE = new Date('2026-05-26T00:00:00');
    const END_DATE = new Date('2026-07-27T08:00:00');

    // DOM Elements
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const timelineProgress = document.getElementById('timeline-progress');
    
    // Simulator Elements
    const simLuInput = document.getElementById('sim-lu');
    const simTemenInput = document.getElementById('sim-temen');
    const simLuRes = document.getElementById('sim-lu-res');
    const simTemenRes = document.getElementById('sim-temen-res');
    const simWinner = document.getElementById('sim-winner');

    // Modal Elements
    const signModal = document.getElementById('sign-modal');
    const btnOpenSign = document.getElementById('btn-open-sign');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const btnClearCanvas = document.getElementById('btn-clear-canvas');
    const btnSaveSignature = document.getElementById('btn-save-signature');
    const signatureCanvas = document.getElementById('signature-canvas');
    const sigCtx = signatureCanvas.getContext('2d');

    // Agreement State Elements
    const sigTemenBox = document.getElementById('sig-temen-box');
    const sigTemenStatus = document.getElementById('sig-temen-status');
    const sigTemenContent = document.getElementById('sig-temen-content');
    const btnResetAgreement = document.getElementById('btn-reset-agreement');
    
    // Success Overlay Elements
    const successOverlay = document.getElementById('success-overlay');
    const btnCloseSuccess = document.getElementById('btn-close-success');

    // ----------------------------------------------------
    // 1. COUNTDOWN TIMER & TIMELINE PROGRESS
    // ----------------------------------------------------
    function updateCountdown() {
        const now = new Date();
        const diff = END_DATE - now;

        if (diff <= 0) {
            daysEl.textContent = '0';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            document.querySelector('.countdown-label').textContent = 'TANTANGAN SELESAI!';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        daysEl.textContent = days;
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');

        // Timeline Progress
        const totalDuration = END_DATE - START_DATE;
        const elapsed = now - START_DATE;
        let progressPct = (elapsed / totalDuration) * 100;
        progressPct = Math.max(0, Math.min(100, progressPct)); // Clamp between 0-100
        timelineProgress.style.width = `${progressPct}%`;
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // ----------------------------------------------------
    // 2. LIVE SIMULATOR
    // ----------------------------------------------------
    function calculateLossPercentage(start, end) {
        if (!end || end <= 0) return 0;
        return ((start - end) / start) * 100;
    }

    function runSimulation() {
        const valLu = parseFloat(simLuInput.value);
        const valTemen = parseFloat(simTemenInput.value);

        const pctLu = calculateLossPercentage(START_WEIGHT_LU, valLu);
        const pctTemen = calculateLossPercentage(START_WEIGHT_TEMEN, valTemen);

        // Update displays
        if (valLu > 0) {
            simLuRes.textContent = `${pctLu.toFixed(2)}% turun`;
            simLuRes.style.color = '#00d2ff';
            simLuRes.style.fontWeight = '700';
        } else {
            simLuRes.textContent = '0.00% turun';
            simLuRes.style.color = 'var(--text-secondary)';
        }

        if (valTemen > 0) {
            simTemenRes.textContent = `${pctTemen.toFixed(2)}% turun`;
            simTemenRes.style.color = '#ff3b70';
            simTemenRes.style.fontWeight = '700';
        } else {
            simTemenRes.textContent = '0.00% turun';
            simTemenRes.style.color = 'var(--text-secondary)';
        }

        // Determine winner
        if (valLu > 0 && valTemen > 0) {
            simWinner.classList.add('success-alert');
            
            if (pctLu > pctTemen) {
                const diff = pctLu - pctTemen;
                simWinner.innerHTML = `🏆 <strong>Pur memimpin!</strong> Penurunan Pur lebih besar <strong>${diff.toFixed(2)}%</strong> daripada Stevhan. (Traktiran gratis menanti!)`;
            } else if (pctTemen > pctLu) {
                const diff = pctTemen - pctLu;
                simWinner.innerHTML = `🏆 <strong>Stevhan memimpin!</strong> Penurunan Stevhan lebih besar <strong>${diff.toFixed(2)}%</strong> daripada Pur. (Traktiran gratis menanti!)`;
            } else {
                simWinner.innerHTML = `⚖️ <strong>Hasil Seri!</strong> Keduanya turun tepat <strong>${pctLu.toFixed(2)}%</strong>. Siap-siap patungan Gyukaku!`;
            }
        } else {
            simWinner.classList.remove('success-alert');
            simWinner.innerHTML = 'Masukkan berat badan di atas untuk melihat prediksi pemenang!';
        }
    }

    simLuInput.addEventListener('input', runSimulation);
    simTemenInput.addEventListener('input', runSimulation);

    // ----------------------------------------------------
    // 3. CANVAS SIGNATURE DRAWING
    // ----------------------------------------------------
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Adjust canvas for High DPI displays
    function resizeCanvas() {
        const rect = signatureCanvas.getBoundingClientRect();
        // Give canvas internal width & height matching its layout width & height
        signatureCanvas.width = rect.width;
        signatureCanvas.height = rect.height;
        
        // Canvas styling for drawing line
        sigCtx.strokeStyle = "#ffffff";
        sigCtx.lineWidth = 3.5;
        sigCtx.lineCap = "round";
        sigCtx.lineJoin = "round";
    }

    // Set drawing triggers
    function draw(e) {
        if (!isDrawing) return;
        
        // Get coordinates depending on touch or mouse
        let x, y;
        if (e.type.startsWith('touch')) {
            const touch = e.touches[0];
            const rect = signatureCanvas.getBoundingClientRect();
            x = touch.clientX - rect.left;
            y = touch.clientY - rect.top;
        } else {
            x = e.offsetX;
            y = e.offsetY;
        }

        sigCtx.beginPath();
        sigCtx.moveTo(lastX, lastY);
        sigCtx.lineTo(x, y);
        sigCtx.stroke();
        
        lastX = x;
        lastY = y;
    }

    function startDrawing(e) {
        isDrawing = true;
        
        let x, y;
        if (e.type.startsWith('touch')) {
            const touch = e.touches[0];
            const rect = signatureCanvas.getBoundingClientRect();
            x = touch.clientX - rect.left;
            y = touch.clientY - rect.top;
        } else {
            x = e.offsetX;
            y = e.offsetY;
        }
        
        lastX = x;
        lastY = y;
        e.preventDefault(); // Prevents page scrolling when drawing
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Mouse Listeners
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);

    // Touch Listeners (Mobile drawing)
    signatureCanvas.addEventListener('touchstart', startDrawing, { passive: false });
    signatureCanvas.addEventListener('touchmove', draw, { passive: false });
    signatureCanvas.addEventListener('touchend', stopDrawing);

    // Modal Control
    btnOpenSign.addEventListener('click', () => {
        signModal.classList.add('active');
        // Let UI lay out before resizing canvas to ensure getBoundingClientRect works correctly
        setTimeout(resizeCanvas, 50);
    });

    function closeModal() {
        signModal.classList.remove('active');
        sigCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    }

    btnCloseModal.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Clear Canvas
    btnClearCanvas.addEventListener('click', () => {
        sigCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    });

    // Save Signature
    btnSaveSignature.addEventListener('click', () => {
        // Check if canvas is empty
        const isCanvasEmpty = checkCanvasEmpty(signatureCanvas);
        if (isCanvasEmpty) {
            alert('Silakan coret tanda tangan Anda terlebih dahulu!');
            return;
        }

        const dataUrl = signatureCanvas.toDataURL();
        const now = new Date();
        const formattedDate = now.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Save to localStorage
        localStorage.setItem('weight_challenge_signed', 'true');
        localStorage.setItem('weight_challenge_sig_img', dataUrl);
        localStorage.setItem('weight_challenge_sig_date', formattedDate);

        // Apply signed state
        applySignedState(dataUrl, formattedDate);

        // Close modal, show success screen, explode confetti
        closeModal();
        successOverlay.classList.add('active');
        startConfetti();
    });

    function checkCanvasEmpty(canvas) {
        const buffer = new Uint32Array(
            sigCtx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        );
        return !buffer.some(color => color !== 0);
    }

    // ----------------------------------------------------
    // 4. PERSISTENT STATE MANAGEMENT
    // ----------------------------------------------------
    function applySignedState(imgUrl, dateStr) {
        sigTemenBox.classList.add('signed');
        sigTemenStatus.className = 'sig-status badge-success';
        sigTemenStatus.textContent = '✓ Telah Menyetujui';
        
        sigTemenContent.innerHTML = `
            <div class="signature-display">
                <img src="${imgUrl}" class="signature-img" alt="Tanda Tangan Stevhan">
            </div>
            <span class="sig-date">${dateStr}</span>
        `;
    }

    function applyDefaultSignedState() {
        sigTemenBox.classList.add('signed');
        sigTemenStatus.className = 'sig-status badge-success';
        sigTemenStatus.textContent = '✓ Telah Menyetujui';
        
        sigTemenContent.innerHTML = `
            <div class="signature-display">
                <span class="handwritten-sig" style="color: #ff3b70;">Stevhan (Signed)</span>
            </div>
            <span class="sig-date">26 Mei 2026, 15:00</span>
        `;
    }

    function applyUnsignedState() {
        sigTemenBox.classList.remove('signed');
        sigTemenStatus.className = 'sig-status badge-waiting';
        sigTemenStatus.textContent = '⏳ Menunggu Persetujuan';
        
        sigTemenContent.innerHTML = `
            <button class="btn btn-primary" id="btn-open-sign">
                <span class="btn-icon">✍️</span> Tanda Tangani Sekarang
            </button>
            <p class="sig-prompt">Ketuk tombol untuk menyetujui perjanjian ini</p>
        `;
        
        // Re-attach event listener to the button
        document.getElementById('btn-open-sign').addEventListener('click', () => {
            signModal.classList.add('active');
            setTimeout(resizeCanvas, 50);
        });
    }

    function checkExistingAgreement() {
        const isSigned = localStorage.getItem('weight_challenge_signed');
        const sigImg = localStorage.getItem('weight_challenge_sig_img');
        const sigDate = localStorage.getItem('weight_challenge_sig_date');

        if (isSigned === 'true') {
            if (sigImg) {
                applySignedState(sigImg, sigDate);
            } else {
                applyDefaultSignedState();
            }
        } else if (isSigned === null) {
            // First load: Default to signed
            localStorage.setItem('weight_challenge_signed', 'true');
            applyDefaultSignedState();
        } else {
            // isSigned === 'false': show unsigned state
            applyUnsignedState();
        }
    }

    checkExistingAgreement();

    // Reset logic (Escape reset persetujuannya)
    btnResetAgreement.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin me-reset persetujuan tanda tangan kontrak ini? Pihak Kedua harus menandatangani ulang.')) {
            localStorage.setItem('weight_challenge_signed', 'false');
            localStorage.removeItem('weight_challenge_sig_img');
            localStorage.removeItem('weight_challenge_sig_date');
            window.location.reload();
        }
    });

    btnCloseSuccess.addEventListener('click', () => {
        successOverlay.classList.remove('active');
        stopConfetti();
    });

    // Window resize handler
    window.addEventListener('resize', () => {
        if (signModal.classList.contains('active')) {
            resizeCanvas();
        }
    });

    // ----------------------------------------------------
    // 5. LIGHTWEIGHT CONFETTI PARTICLE SYSTEM
    // ----------------------------------------------------
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    let confettiActive = false;
    let confettiArray = [];
    const colors = ['#00d2ff', '#ff3b70', '#ffbd00', '#4f46e5', '#10b981'];

    class ConfettiParticle {
        constructor() {
            this.x = Math.random() * confettiCanvas.width;
            this.y = Math.random() * confettiCanvas.height - confettiCanvas.height;
            this.size = Math.random() * 8 + 6;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 + 4;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 4 - 2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;

            if (this.y > confettiCanvas.height) {
                this.y = -20;
                this.x = Math.random() * confettiCanvas.width;
            }
        }

        draw() {
            confettiCtx.save();
            confettiCtx.translate(this.x, this.y);
            confettiCtx.rotate((this.rotation * Math.PI) / 180);
            confettiCtx.fillStyle = this.color;
            confettiCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            confettiCtx.restore();
        }
    }

    function setupConfettiCanvas() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }

    function animateConfetti() {
        if (!confettiActive) return;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        confettiArray.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animateConfetti);
    }

    function startConfetti() {
        setupConfettiCanvas();
        confettiActive = true;
        confettiArray = [];
        for (let i = 0; i < 120; i++) {
            confettiArray.push(new ConfettiParticle());
        }
        window.addEventListener('resize', setupConfettiCanvas);
        animateConfetti();
    }

    function stopConfetti() {
        confettiActive = false;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        window.removeEventListener('resize', setupConfettiCanvas);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    
    // Constant weight data
    const START_WEIGHT_LU = 88.2;
    const START_WEIGHT_TEMEN = 67.3;
    const START_WEIGHT_DEWA = 84.5;
    const START_DATE = new Date('2026-05-29T00:00:00');
    const END_DATE = new Date('2026-07-29T08:00:00');

    // DOM Elements
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const timelineProgress = document.getElementById('timeline-progress');
    
    // Simulator Elements
    const simLuInput = document.getElementById('sim-lu');
    const simTemenInput = document.getElementById('sim-temen');
    const simDewaInput = document.getElementById('sim-dewa');
    const simLuRes = document.getElementById('sim-lu-res');
    const simTemenRes = document.getElementById('sim-temen-res');
    const simDewaRes = document.getElementById('sim-dewa-res');
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
    const sigDewaBox = document.getElementById('sig-dewa-box');
    const sigDewaStatus = document.getElementById('sig-dewa-status');
    const sigDewaContent = document.getElementById('sig-dewa-content');
    const btnResetAgreement = document.getElementById('btn-reset-agreement');
    const modalTitle = document.getElementById('modal-title');
    let currentSigningParty = 'stevhan'; // 'stevhan' or 'dewa'
    
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
        const valDewa = parseFloat(simDewaInput.value);

        const pctLu = calculateLossPercentage(START_WEIGHT_LU, valLu);
        const pctTemen = calculateLossPercentage(START_WEIGHT_TEMEN, valTemen);
        const pctDewa = calculateLossPercentage(START_WEIGHT_DEWA, valDewa);

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

        if (valDewa > 0) {
            simDewaRes.textContent = `${pctDewa.toFixed(2)}% turun`;
            simDewaRes.style.color = '#ffbd00';
            simDewaRes.style.fontWeight = '700';
        } else {
            simDewaRes.textContent = '0.00% turun';
            simDewaRes.style.color = 'var(--text-secondary)';
        }

        // Leaderboard standings — semua ikut taruhan
        let standings = [];
        if (valLu > 0) standings.push({ name: 'Pur', pct: pctLu, color: '#00d2ff' });
        if (valTemen > 0) standings.push({ name: 'Stevhan', pct: pctTemen, color: '#ff3b70' });
        if (valDewa > 0) standings.push({ name: 'Dewa', pct: pctDewa, color: '#ffbd00' });

        standings.sort((a, b) => b.pct - a.pct);

        let standingsHtml = '';
        if (standings.length > 0) {
            standingsHtml = `
            <div style="margin-top: 12px; text-align: left; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em; text-transform: uppercase;">📊 KLASEMEN PENURUNAN</div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
            `;
            standings.forEach((s, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                standingsHtml += `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                        <span>${medal} <span style="color: ${s.color}; font-weight: 700;">${s.name}</span></span>
                        <span style="font-family: var(--font-heading); font-weight: 700; color: #ffffff;">${s.pct.toFixed(2)}%</span>
                    </div>
                `;
            });
            standingsHtml += '</div></div>';
        }

        // Determine taruhan winner among all 3 participants
        let winText = '';
        let paymentHtml = '';
        if (valLu > 0 || valTemen > 0 || valDewa > 0) {
            simWinner.classList.add('success-alert');

            // Sort only parties who have entered values
            const betParties = [
                valLu > 0 ? { name: 'Pur', pct: pctLu, color: '#00d2ff' } : null,
                valTemen > 0 ? { name: 'Stevhan', pct: pctTemen, color: '#ff3b70' } : null,
                valDewa > 0 ? { name: 'Dewa', pct: pctDewa, color: '#ffbd00' } : null,
            ].filter(Boolean);
            betParties.sort((a, b) => b.pct - a.pct);

            const payRules = ['FREE 🎉', '10% tagihan 😅', '90% tagihan 😭'];
            const medals = ['🥇', '🥈', '🥉'];

            if (betParties.length >= 2) {
                const top = betParties[0];
                if (betParties.length >= 2 && top.pct > betParties[1].pct) {
                    winText = `🏆 <strong style="color:${top.color}">${top.name}</strong> makan <strong>GRATIS</strong>! Yang lain siap-siap patungan Gyukaku!`;
                } else {
                    winText = `⚖️ <strong>Ada yang seri!</strong> Perlu timbangan asli untuk menentukan urutan.`;
                }

                // Build payment breakdown table
                paymentHtml = `
                <div style="margin-top: 14px; text-align: left; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden;">
                    <div style="padding: 10px 14px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); border-bottom: 1px solid rgba(255,255,255,0.05);">💸 SIMULASI PEMBAYARAN</div>
                    ${betParties.map((p, idx) => {
                        const rule = payRules[idx] || '90% tagihan 😭';
                        const medal = medals[idx] || '🥉';
                        const isWinner = idx === 0;
                        const bgColor = isWinner ? 'rgba(255,189,0,0.07)' : 'transparent';
                        return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: ${bgColor}; border-bottom: 1px solid rgba(255,255,255,0.04);">
                            <span style="font-size:0.85rem;">${medal} <span style="color:${p.color}; font-weight:700;">${p.name}</span> <span style="font-size:0.7rem; color: var(--text-secondary);">(${p.pct.toFixed(2)}% turun)</span></span>
                            <span style="font-family: var(--font-heading); font-weight: 700; font-size: 0.9rem; color: ${isWinner ? '#ffbd00' : '#ffffff'};">${rule}</span>
                        </div>`;
                    }).join('')}
                </div>`;
            } else {
                winText = `📊 Masukkan berat lebih banyak peserta untuk melihat perbandingan!`;
            }
        } else {
            simWinner.classList.remove('success-alert');
            winText = 'Masukkan berat badan akhir untuk melihat prediksi!';
        }

        simWinner.innerHTML = `<div>${winText}</div>${standingsHtml}${paymentHtml}`;
    }

    simLuInput.addEventListener('input', runSimulation);
    simTemenInput.addEventListener('input', runSimulation);
    simDewaInput.addEventListener('input', runSimulation);

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

    // Modal Control — supports multiple signers
    function openModal(party) {
        currentSigningParty = party;
        if (party === 'stevhan') {
            modalTitle.textContent = 'Tanda Tangan Pihak II (Stevhan)';
        } else {
            modalTitle.textContent = 'Tanda Tangan Pihak III (Dewa)';
        }
        signModal.classList.add('active');
        setTimeout(resizeCanvas, 50);
    }

    document.getElementById('btn-open-sign').addEventListener('click', () => openModal('stevhan'));
    document.getElementById('btn-open-sign-dewa').addEventListener('click', () => openModal('dewa'));

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

        if (currentSigningParty === 'stevhan') {
            localStorage.setItem('weight_challenge_signed', 'true');
            localStorage.setItem('weight_challenge_sig_img', dataUrl);
            localStorage.setItem('weight_challenge_sig_date', formattedDate);
            applySignedState('stevhan', dataUrl, formattedDate);
        } else {
            localStorage.setItem('weight_challenge_dewa_signed', 'true');
            localStorage.setItem('weight_challenge_dewa_sig_img', dataUrl);
            localStorage.setItem('weight_challenge_dewa_sig_date', formattedDate);
            applySignedState('dewa', dataUrl, formattedDate);
        }

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
    function applySignedState(party, imgUrl, dateStr) {
        if (party === 'stevhan') {
            sigTemenBox.classList.add('signed');
            sigTemenStatus.className = 'sig-status badge-success';
            sigTemenStatus.textContent = '✓ Telah Menyetujui';
            sigTemenContent.innerHTML = `
                <div class="signature-display">
                    <img src="${imgUrl}" class="signature-img" alt="Tanda Tangan Stevhan">
                </div>
                <span class="sig-date">${dateStr}</span>
            `;
        } else {
            sigDewaBox.classList.add('signed');
            sigDewaStatus.className = 'sig-status badge-success';
            sigDewaStatus.textContent = '✓ Telah Menyetujui';
            sigDewaContent.innerHTML = `
                <div class="signature-display">
                    <img src="${imgUrl}" class="signature-img" alt="Tanda Tangan Dewa" style="filter: invert(1) brightness(0.8) sepia(1) hue-rotate(30deg) saturate(3);">
                </div>
                <span class="sig-date">${dateStr}</span>
            `;
        }
    }

    function applyUnsignedState(party) {
        if (party === 'stevhan') {
            sigTemenBox.classList.remove('signed');
            sigTemenStatus.className = 'sig-status badge-waiting';
            sigTemenStatus.textContent = '⏳ Menunggu Persetujuan';
            sigTemenContent.innerHTML = `
                <button class="btn btn-primary" id="btn-open-sign">
                    <span class="btn-icon">✍️</span> Tanda Tangani Sekarang
                </button>
                <p class="sig-prompt">Ketuk tombol untuk menyetujui perjanjian ini</p>
            `;
            document.getElementById('btn-open-sign').addEventListener('click', () => openModal('stevhan'));
        } else {
            sigDewaBox.classList.remove('signed');
            sigDewaStatus.className = 'sig-status badge-waiting';
            sigDewaStatus.textContent = '⏳ Menunggu Persetujuan';
            sigDewaContent.innerHTML = `
                <button class="btn btn-primary" id="btn-open-sign-dewa">
                    <span class="btn-icon">✍️</span> Tanda Tangani Sekarang
                </button>
                <p class="sig-prompt">Ketuk tombol untuk menyetujui perjanjian ini</p>
            `;
            document.getElementById('btn-open-sign-dewa').addEventListener('click', () => openModal('dewa'));
        }
    }

    function checkExistingAgreement() {
        // Stevhan
        const stevhanSigned = localStorage.getItem('weight_challenge_signed');
        const stevhanImg = localStorage.getItem('weight_challenge_sig_img');
        const stevhanDate = localStorage.getItem('weight_challenge_sig_date');
        if (stevhanSigned === 'true' && stevhanImg) {
            applySignedState('stevhan', stevhanImg, stevhanDate);
        } else {
            applyUnsignedState('stevhan');
        }

        // Dewa
        const dewaSigned = localStorage.getItem('weight_challenge_dewa_signed');
        const dewaImg = localStorage.getItem('weight_challenge_dewa_sig_img');
        const dewaDate = localStorage.getItem('weight_challenge_dewa_sig_date');
        if (dewaSigned === 'true' && dewaImg) {
            applySignedState('dewa', dewaImg, dewaDate);
        } else {
            applyUnsignedState('dewa');
        }
    }

    checkExistingAgreement();

    // Reset logic (Escape reset persetujuannya)
    btnResetAgreement.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin me-reset persetujuan? Stevhan & Dewa harus menandatangani ulang.')) {
            localStorage.removeItem('weight_challenge_signed');
            localStorage.removeItem('weight_challenge_sig_img');
            localStorage.removeItem('weight_challenge_sig_date');
            localStorage.removeItem('weight_challenge_dewa_signed');
            localStorage.removeItem('weight_challenge_dewa_sig_img');
            localStorage.removeItem('weight_challenge_dewa_sig_date');
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

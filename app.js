import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBro0-qMDhbzvrl1ZzwvNp27M8yAvnE2lg",
  authDomain: "weight-loss-challenge-38ab5.firebaseapp.com",
  projectId: "weight-loss-challenge-38ab5",
  storageBucket: "weight-loss-challenge-38ab5.firebasestorage.app",
  messagingSenderId: "130546003837",
  appId: "1:130546003837:web:a5f9ec3902d8cff0ca2614"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const agreementDocRef = doc(db, "agreements", "main");

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
    const btnCloseModal = document.getElementById('btn-close-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const btnClearCanvas = document.getElementById('btn-clear-canvas');
    const btnSaveSignature = document.getElementById('btn-save-signature');
    const signatureCanvas = document.getElementById('signature-canvas');
    const sigCtx = signatureCanvas.getContext('2d');

    // Agreement State Elements
    const sigPurBox = document.getElementById('sig-pur-box');
    const sigPurStatus = document.getElementById('sig-pur-status');
    const sigPurContent = document.getElementById('sig-pur-content');
    
    const sigTemenBox = document.getElementById('sig-temen-box');
    const sigTemenStatus = document.getElementById('sig-temen-status');
    const sigTemenContent = document.getElementById('sig-temen-content');
    
    const sigDewaBox = document.getElementById('sig-dewa-box');
    const sigDewaStatus = document.getElementById('sig-dewa-status');
    const sigDewaContent = document.getElementById('sig-dewa-content');
    
    const modalTitle = document.getElementById('modal-title');
    let currentSigningParty = 'pur'; // 'pur', 'stevhan' or 'dewa'
    
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
        if (party === 'pur') {
            modalTitle.textContent = 'Tanda Tangan Pihak I (Pur)';
        } else if (party === 'stevhan') {
            modalTitle.textContent = 'Tanda Tangan Pihak II (Stevhan)';
        } else {
            modalTitle.textContent = 'Tanda Tangan Pihak III (Dewa)';
        }
        signModal.classList.add('active');
        setTimeout(resizeCanvas, 50);
    }

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
    btnSaveSignature.addEventListener('click', async () => {
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

        btnSaveSignature.disabled = true;
        btnSaveSignature.textContent = 'Menyimpan...';

        try {
            await setDoc(agreementDocRef, {
                [currentSigningParty]: {
                    signed: true,
                    img: dataUrl,
                    date: formattedDate
                }
            }, { merge: true });

            closeModal();
        } catch (error) {
            console.error("Error saving signature: ", error);
            alert("Gagal menyimpan tanda tangan ke Firebase. Pastikan Rules Firestore sudah diset ke Test Mode.");
        } finally {
            btnSaveSignature.disabled = false;
            btnSaveSignature.textContent = 'Konfirmasi & Setuju ✓';
        }
    });

    function checkCanvasEmpty(canvas) {
        const buffer = new Uint32Array(
            sigCtx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        );
        return !buffer.some(color => color !== 0);
    }

    // ----------------------------------------------------
    // 4. PERSISTENT STATE MANAGEMENT (FIREBASE)
    // ----------------------------------------------------
    function applySignedState(party, imgUrl, dateStr) {
        if (party === 'pur') {
            sigPurBox.classList.add('signed');
            sigPurStatus.className = 'sig-status badge-success';
            sigPurStatus.textContent = '✓ Telah Menyetujui';
            sigPurContent.innerHTML = `
                <div class="signature-display">
                    <img src="${imgUrl}" class="signature-img" alt="Tanda Tangan Pur" style="filter: invert(1) brightness(0.8) sepia(1) hue-rotate(180deg) saturate(3);">
                </div>
                <span class="sig-date">${dateStr}</span>
            `;
        } else if (party === 'stevhan') {
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
        if (party === 'pur') {
            sigPurBox.classList.remove('signed');
            sigPurStatus.className = 'sig-status badge-waiting';
            sigPurStatus.textContent = '⏳ Menunggu Persetujuan';
            sigPurContent.innerHTML = `
                <button class="btn btn-primary" id="btn-open-sign-pur">
                    <span class="btn-icon">✍️</span> Tanda Tangani Sekarang
                </button>
                <p class="sig-prompt">Ketuk tombol untuk menyetujui perjanjian ini</p>
            `;
            document.getElementById('btn-open-sign-pur').addEventListener('click', () => openModal('pur'));
        } else if (party === 'stevhan') {
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

    // --- CHART & HISTORICAL TABLE LOGIC ---
    let progressChart = null;
    let milestoneChart = null;
    let localLogs = [];
    let currentChartType = 'weight';

    // Set up chart tab toggles
    document.querySelectorAll('.chart-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-tab-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            currentChartType = btn.getAttribute('data-chart-type');
            renderChart(localLogs);
        });
    });

    function renderChart(logs) {
        const ctx = document.getElementById('progress-chart').getContext('2d');
        const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Get unique sorted dates
        const dates = ['2026-05-29'];
        sortedLogs.forEach(log => {
            if (!dates.includes(log.date) && log.date >= '2026-05-29') {
                dates.push(log.date);
            }
        });
        dates.sort((a, b) => new Date(a) - new Date(b));

        const formatChartDate = (dateStr) => {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        };
        const labels = dates.map(formatChartDate);

        // Get weights per date
        let currentWeightPur = START_WEIGHT_LU;
        let currentWeightStevhan = START_WEIGHT_TEMEN;
        let currentWeightDewa = START_WEIGHT_DEWA;

        const weightsPur = [START_WEIGHT_LU];
        const weightsStevhan = [START_WEIGHT_TEMEN];
        const weightsDewa = [START_WEIGHT_DEWA];

        for (let i = 1; i < dates.length; i++) {
            const currentDate = dates[i];
            const logsPur = sortedLogs.filter(l => l.date === currentDate && l.party === 'pur');
            const logsStevhan = sortedLogs.filter(l => l.date === currentDate && l.party === 'stevhan');
            const logsDewa = sortedLogs.filter(l => l.date === currentDate && l.party === 'dewa');

            if (logsPur.length > 0) currentWeightPur = logsPur[logsPur.length - 1].weight;
            if (logsStevhan.length > 0) currentWeightStevhan = logsStevhan[logsStevhan.length - 1].weight;
            if (logsDewa.length > 0) currentWeightDewa = logsDewa[logsDewa.length - 1].weight;

            weightsPur.push(currentWeightPur);
            weightsStevhan.push(currentWeightStevhan);
            weightsDewa.push(currentWeightDewa);
        }

        // Calculate latest standing values for leaderboard
        const latestWeightPur = weightsPur[weightsPur.length - 1];
        const latestWeightStevhan = weightsStevhan[weightsStevhan.length - 1];
        const latestWeightDewa = weightsDewa[weightsDewa.length - 1];

        const pctPurLatest = ((START_WEIGHT_LU - latestWeightPur) / START_WEIGHT_LU) * 100;
        const pctStevhanLatest = ((START_WEIGHT_TEMEN - latestWeightStevhan) / START_WEIGHT_TEMEN) * 100;
        const pctDewaLatest = ((START_WEIGHT_DEWA - latestWeightDewa) / START_WEIGHT_DEWA) * 100;

        const kgPurLatest = START_WEIGHT_LU - latestWeightPur;
        const kgStevhanLatest = START_WEIGHT_TEMEN - latestWeightStevhan;
        const kgDewaLatest = START_WEIGHT_DEWA - latestWeightDewa;

        if (progressChart) {
            progressChart.destroy();
        }

        if (currentChartType === 'leaderboard') {
            // Render a horizontal bar chart of current standings
            progressChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Pur', 'Stevhan', 'Dewa'],
                    datasets: [
                        {
                            label: '% Penurunan Saat Ini',
                            data: [
                                parseFloat(pctPurLatest.toFixed(2)),
                                parseFloat(pctStevhanLatest.toFixed(2)),
                                parseFloat(pctDewaLatest.toFixed(2))
                            ],
                            backgroundColor: [
                                'rgba(0, 210, 255, 0.25)',
                                'rgba(255, 59, 112, 0.25)',
                                'rgba(255, 189, 0, 0.25)'
                            ],
                            borderColor: ['#00d2ff', '#ff3b70', '#ffbd00'],
                            borderWidth: 2,
                            borderRadius: 12,
                            borderSkipped: false,
                            maxBarThickness: 40
                        }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const idx = context.dataIndex;
                                    const kgs = [kgPurLatest, kgStevhanLatest, kgDewaLatest];
                                    const pct = context.parsed.x;
                                    return `${context.label}: ${pct.toFixed(2)}% turun (${kgs[idx].toFixed(1)} kg lost)`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: {
                                color: '#9ca3af',
                                callback: function(value) { return value + '%'; }
                            },
                            title: {
                                display: true,
                                text: 'Persentase Penurunan (%)',
                                color: '#9ca3af'
                            }
                        },
                        y: {
                            grid: { display: false },
                            ticks: {
                                color: function(context) {
                                    const colors = ['#00d2ff', '#ff3b70', '#ffbd00'];
                                    return colors[context.index] || '#ffffff';
                                },
                                font: { family: 'Plus Jakarta Sans', weight: 'bold', size: 12 }
                            }
                        }
                    }
                }
            });
            return;
        }

        // Generate line chart data
        let datasetLabel = '';
        let tooltipSuffix = '';
        let yAxisLabel = '';
        let dataPur = [];
        let dataStevhan = [];
        let dataDewa = [];

        if (currentChartType === 'percent') {
            datasetLabel = '% Turun';
            tooltipSuffix = '%';
            yAxisLabel = 'Total Penurunan (%)';
            dataPur = weightsPur.map(w => parseFloat((((START_WEIGHT_LU - w) / START_WEIGHT_LU) * 100).toFixed(2)));
            dataStevhan = weightsStevhan.map(w => parseFloat((((START_WEIGHT_TEMEN - w) / START_WEIGHT_TEMEN) * 100).toFixed(2)));
            dataDewa = weightsDewa.map(w => parseFloat((((START_WEIGHT_DEWA - w) / START_WEIGHT_DEWA) * 100).toFixed(2)));
        } else if (currentChartType === 'kg-lost') {
            datasetLabel = 'Kg Turun';
            tooltipSuffix = ' kg';
            yAxisLabel = 'Total Turun (kg)';
            dataPur = weightsPur.map(w => parseFloat((START_WEIGHT_LU - w).toFixed(1)));
            dataStevhan = weightsStevhan.map(w => parseFloat((START_WEIGHT_TEMEN - w).toFixed(1)));
            dataDewa = weightsDewa.map(w => parseFloat((START_WEIGHT_DEWA - w).toFixed(1)));
        } else if (currentChartType === 'weight') {
            datasetLabel = 'Berat';
            tooltipSuffix = ' kg';
            yAxisLabel = 'Berat Badan (kg)';
            dataPur = weightsPur.map(w => parseFloat(w.toFixed(1)));
            dataStevhan = weightsStevhan.map(w => parseFloat(w.toFixed(1)));
            dataDewa = weightsDewa.map(w => parseFloat(w.toFixed(1)));
        }

        progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: `Pur (${datasetLabel})`,
                        data: dataPur,
                        borderColor: '#00d2ff',
                        backgroundColor: 'rgba(0, 210, 255, 0.08)',
                        borderWidth: 3,
                        pointBackgroundColor: '#00d2ff',
                        pointBorderColor: '#ffffff',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.25
                    },
                    {
                        label: `Stevhan (${datasetLabel})`,
                        data: dataStevhan,
                        borderColor: '#ff3b70',
                        backgroundColor: 'rgba(255, 59, 112, 0.08)',
                        borderWidth: 3,
                        pointBackgroundColor: '#ff3b70',
                        pointBorderColor: '#ffffff',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.25
                    },
                    {
                        label: `Dewa (${datasetLabel})`,
                        data: dataDewa,
                        borderColor: '#ffbd00',
                        backgroundColor: 'rgba(255, 189, 0, 0.08)',
                        borderWidth: 3,
                        pointBackgroundColor: '#ffbd00',
                        pointBorderColor: '#ffffff',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.25
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e5e7eb', font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(context.parsed.y % 1 === 0 ? 0 : 2) + tooltipSuffix;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans' } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: {
                            color: '#9ca3af',
                            font: { family: 'Plus Jakarta Sans' },
                            callback: function(value) { return value + tooltipSuffix; }
                        },
                        title: {
                            display: true,
                            text: yAxisLabel,
                            color: '#9ca3af',
                            font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }
                        }
                    }
                }
            }
        });
    }

    function renderTable(logs) {
        const body = document.getElementById('history-table-body');
        body.innerHTML = '';

        const grouped = {};
        grouped['2026-05-29'] = {
            date: '2026-05-29',
            pur: { weight: START_WEIGHT_LU, id: 'start' },
            stevhan: { weight: START_WEIGHT_TEMEN, id: 'start' },
            dewa: { weight: START_WEIGHT_DEWA, id: 'start' },
            isStart: true
        };

        logs.forEach(log => {
            if (!grouped[log.date]) {
                grouped[log.date] = { date: log.date, pur: null, stevhan: null, dewa: null };
            }
            grouped[log.date][log.party] = { weight: log.weight, id: log.id };
        });

        const rows = Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));

        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';

            const formattedDate = new Date(row.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            const getColHtml = (partKey) => {
                const cell = row[partKey];
                if (!cell) return `<td style="padding: 0.75rem 0.5rem; color: var(--text-secondary);">-</td>`;
                
                let deleteBtn = '';
                if (!row.isStart) {
                    deleteBtn = `<button class="btn-delete-log" data-id="${cell.id}" title="Hapus log ini" style="font-size:0.75rem; padding:0; margin-left:6px; background:none; border:none; cursor:pointer;">❌</button>`;
                }
                
                let color = '#00d2ff';
                if (partKey === 'stevhan') color = '#ff3b70';
                if (partKey === 'dewa') color = '#ffbd00';

                return `
                    <td style="padding: 0.75rem 0.5rem; color: ${color}; font-weight: 700; white-space: nowrap;">
                        ${cell.weight.toFixed(1)} kg ${deleteBtn}
                    </td>
                `;
            };

            const purTd = getColHtml('pur');
            const stevhanTd = getColHtml('stevhan');
            const dewaTd = getColHtml('dewa');

            const actionHtml = row.isStart 
                ? `<span style="font-size:0.75rem; color:var(--text-secondary); font-style:italic;">Mulai</span>` 
                : `<span style="font-size:0.75rem; color:var(--text-secondary);">Log</span>`;

            tr.innerHTML = `
                <td style="padding: 0.75rem 0.5rem; font-weight: 500;">${formattedDate}</td>
                ${purTd}
                ${stevhanTd}
                ${dewaTd}
                <td style="padding: 0.75rem 0.5rem; text-align: center;">${actionHtml}</td>
            `;

            body.appendChild(tr);
        });

        body.querySelectorAll('.btn-delete-log').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const logId = btn.getAttribute('data-id');
                if (confirm('Hapus log timbangan ini?')) {
                    const updatedLogs = localLogs.filter(log => log.id !== logId);
                    try {
                        await setDoc(agreementDocRef, { weighIns: updatedLogs }, { merge: true });
                    } catch (error) {
                        console.error("Error deleting log: ", error);
                        alert("Gagal menghapus log timbangan.");
                    }
                }
            });
        });
    }

    function renderSchedules(logs) {
        const grid = document.getElementById('official-schedule-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const MILESTONES = [
            { name: 'Timbangan Awal', date: '2026-05-29', type: 'start', badgeClass: 'done', badgeText: 'Mulai' },
            { name: 'Timbangan Antara I', date: '2026-06-12', type: 'antara', badgeClass: 'done', badgeText: 'Done ✓' },
            { name: 'Timbangan Antara II', date: '2026-06-19', type: 'antara', badgeClass: 'nanti', badgeText: 'Nanti ⏳' },
            { name: 'Timbangan Antara III', date: '2026-06-26', type: 'antara', badgeClass: 'nanti', badgeText: 'Nanti ⏳' },
            { name: 'Timbangan Akhir', date: '2026-07-29', type: 'final', badgeClass: 'final', badgeText: 'Final 🏆' }
        ];

        MILESTONES.forEach(milestone => {
            // Find logs for this date
            const milestoneLogs = logs.filter(log => log.date === milestone.date);
            const isCompleted = milestone.type === 'start' || milestoneLogs.length > 0;

            const card = document.createElement('div');
            card.className = `schedule-card ${isCompleted ? 'completed' : 'upcoming'}`;

            // Format date to local Indonesian format
            const formattedDate = new Date(milestone.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            if (isCompleted) {
                // Determine weights for each party
                const getPartyData = (party, startWeight, shortName) => {
                    let weight = null;
                    if (milestone.type === 'start') {
                        weight = startWeight;
                    } else {
                        const log = milestoneLogs.find(l => l.party === party);
                        if (log) weight = log.weight;
                    }

                    if (weight === null) {
                        return {
                            shortName: shortName,
                            weightText: 'Belum',
                            lossText: '-',
                            lossColor: 'var(--text-secondary)'
                        };
                    }

                    const lossPct = ((startWeight - weight) / startWeight) * 100;
                    const kgDiff = startWeight - weight;
                    let lossText = '';
                    let lossColor = '';

                    if (milestone.type === 'start') {
                        lossText = '0.0%';
                        lossColor = 'var(--text-secondary)';
                    } else {
                        const kgText = kgDiff >= 0 ? `-${kgDiff.toFixed(1)}kg` : `+${Math.abs(kgDiff).toFixed(1)}kg`;
                        const pctText = lossPct >= 0 ? `-${lossPct.toFixed(1)}%` : `+${Math.abs(lossPct).toFixed(1)}%`;
                        lossText = `${kgText} (${pctText})`;
                        lossColor = kgDiff >= 0 ? '#10b981' : '#ff3b70';
                    }

                    return {
                        shortName: shortName,
                        weightText: `${weight.toFixed(1)} kg`,
                        lossText: lossText,
                        lossColor: lossColor
                    };
                };

                const purData = getPartyData('pur', START_WEIGHT_LU, 'Pur');
                const stevhanData = getPartyData('stevhan', START_WEIGHT_TEMEN, 'Stev');
                const dewaData = getPartyData('dewa', START_WEIGHT_DEWA, 'Dewa');

                // Use a shorter date representation
                const yearShort = new Date(milestone.date).getFullYear().toString().substr(-2);
                const monthName = new Date(milestone.date).toLocaleDateString('id-ID', { month: 'short' });
                const dayNum = new Date(milestone.date).getDate();
                const shortDateText = `${dayNum} ${monthName} '${yearShort}`;

                card.innerHTML = `
                    <span class="status-badge done">${milestone.type === 'start' ? 'Mulai' : 'Done ✓'}</span>
                    <h4 style="font-size: 0.85rem; font-weight: 700; margin-top: 0.15rem; margin-bottom: 0.1rem; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;">${milestone.name}</h4>
                    <span class="schedule-date" style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.6rem; display: block;">📅 ${shortDateText}</span>
                    
                    <div class="schedule-participants-list" style="display: flex; flex-direction: column; gap: 0.35rem; width: 100%;">
                        <!-- Pur Row -->
                        <div class="schedule-participant-row" style="display: flex; flex-direction: column; width: 100%; padding-bottom: 0.25rem; border-bottom: 1px solid rgba(255,255,255,0.03);">
                            <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; width: 100%; white-space: nowrap;">
                                <span class="pur-text" style="font-weight: 700;">${purData.shortName}</span>
                                <span style="font-family: monospace; color: #ffffff; font-weight: 600; white-space: nowrap;">${purData.weightText}</span>
                            </div>
                            <div style="display: flex; justify-content: flex-end; font-size: 0.65rem; font-weight: 700; font-family: monospace; color: ${purData.lossColor}; margin-top: -1px; white-space: nowrap;">
                                ${purData.lossText}
                            </div>
                        </div>
                        
                        <!-- Stevhan Row -->
                        <div class="schedule-participant-row" style="display: flex; flex-direction: column; width: 100%; padding-bottom: 0.25rem; border-bottom: 1px solid rgba(255,255,255,0.03);">
                            <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; width: 100%; white-space: nowrap;">
                                <span class="stevhan-text" style="font-weight: 700;">${stevhanData.shortName}</span>
                                <span style="font-family: monospace; color: #ffffff; font-weight: 600; white-space: nowrap;">${stevhanData.weightText}</span>
                            </div>
                            <div style="display: flex; justify-content: flex-end; font-size: 0.65rem; font-weight: 700; font-family: monospace; color: ${stevhanData.lossColor}; margin-top: -1px; white-space: nowrap;">
                                ${stevhanData.lossText}
                            </div>
                        </div>

                        <!-- Dewa Row -->
                        <div class="schedule-participant-row" style="display: flex; flex-direction: column; width: 100%;">
                            <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; width: 100%; white-space: nowrap;">
                                <span class="dewa-text" style="font-weight: 700;">${dewaData.shortName}</span>
                                <span style="font-family: monospace; color: #ffffff; font-weight: 600; white-space: nowrap;">${dewaData.weightText}</span>
                            </div>
                            <div style="display: flex; justify-content: flex-end; font-size: 0.65rem; font-weight: 700; font-family: monospace; color: ${dewaData.lossColor}; margin-top: -1px; white-space: nowrap;">
                                ${dewaData.lossText}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Use a shorter date representation for upcoming milestones
                const yearShort = new Date(milestone.date).getFullYear().toString().substr(-2);
                const monthName = new Date(milestone.date).toLocaleDateString('id-ID', { month: 'short' });
                const dayNum = new Date(milestone.date).getDate();
                const shortDateText = `${dayNum} ${monthName} '${yearShort}`;

                card.innerHTML = `
                    <span class="status-badge ${milestone.badgeClass}">${milestone.badgeText}</span>
                    <h4 style="font-size: 0.85rem; font-weight: 700; margin-top: 0.15rem; margin-bottom: 0.1rem; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;">${milestone.name}</h4>
                    <span class="schedule-date" style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.6rem; display: block;">📅 ${shortDateText}</span>
                    
                    <div class="upcoming-placeholder" style="padding: 1rem 0.25rem;">
                        <span class="lock-icon" style="font-size: 1.2rem; margin-bottom: 0.25rem;">🔒</span>
                        <p style="font-size: 0.65rem;">Menunggu jadwal timbangan resmi</p>
                    </div>
                `;
            }

            grid.appendChild(card);
        });
    }

    function renderMilestoneChart(logs) {
        const ctx = document.getElementById('milestone-chart').getContext('2d');
        
        const milestoneDates = ['2026-05-29', '2026-06-12', '2026-06-19', '2026-06-26', '2026-07-29'];
        const milestoneLabels = ['Awal (29 Mei)', 'Antara I (12 Jun)', 'Antara II (19 Jun)', 'Antara III (26 Jun)', 'Akhir (29 Jul)'];

        const dataPur = [START_WEIGHT_LU];
        const dataStevhan = [START_WEIGHT_TEMEN];
        const dataDewa = [START_WEIGHT_DEWA];

        for (let i = 1; i < milestoneDates.length; i++) {
            const dateStr = milestoneDates[i];
            const logsPur = logs.filter(l => l.date === dateStr && l.party === 'pur');
            const logsStevhan = logs.filter(l => l.date === dateStr && l.party === 'stevhan');
            const logsDewa = logs.filter(l => l.date === dateStr && l.party === 'dewa');

            if (logsPur.length > 0) {
                dataPur.push(parseFloat(logsPur[logsPur.length - 1].weight.toFixed(1)));
            } else {
                dataPur.push(null);
            }

            if (logsStevhan.length > 0) {
                dataStevhan.push(parseFloat(logsStevhan[logsStevhan.length - 1].weight.toFixed(1)));
            } else {
                dataStevhan.push(null);
            }

            if (logsDewa.length > 0) {
                dataDewa.push(parseFloat(logsDewa[logsDewa.length - 1].weight.toFixed(1)));
            } else {
                dataDewa.push(null);
            }
        }

        if (milestoneChart) {
            milestoneChart.destroy();
        }

        milestoneChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: milestoneLabels,
                datasets: [
                    {
                        label: 'Pur (Berat - kg)',
                        data: dataPur,
                        borderColor: '#00d2ff',
                        backgroundColor: 'rgba(0, 210, 255, 0.05)',
                        borderWidth: 3,
                        pointBackgroundColor: '#00d2ff',
                        pointBorderColor: '#ffffff',
                        pointRadius: 5,
                        tension: 0.2,
                        spanGaps: false
                    },
                    {
                        label: 'Stevhan (Berat - kg)',
                        data: dataStevhan,
                        borderColor: '#ff3b70',
                        backgroundColor: 'rgba(255, 59, 112, 0.05)',
                        borderWidth: 3,
                        pointBackgroundColor: '#ff3b70',
                        pointBorderColor: '#ffffff',
                        pointRadius: 5,
                        tension: 0.2,
                        spanGaps: false
                    },
                    {
                        label: 'Dewa (Berat - kg)',
                        data: dataDewa,
                        borderColor: '#ffbd00',
                        backgroundColor: 'rgba(255, 189, 0, 0.05)',
                        borderWidth: 3,
                        pointBackgroundColor: '#ffbd00',
                        pointBorderColor: '#ffffff',
                        pointRadius: 5,
                        tension: 0.2,
                        spanGaps: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e5e7eb', font: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.parsed.y === null) return '';
                                return context.dataset.label.split(' ')[0] + ': ' + context.parsed.y.toFixed(1) + ' kg';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.03)' },
                        ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 9 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.03)' },
                        ticks: {
                            color: '#9ca3af',
                            font: { family: 'Plus Jakarta Sans', size: 9 },
                            callback: function(value) { return value + ' kg'; }
                        }
                    }
                }
            }
        });
    }

    // --- FORM WEIGH IN EVENT LISTENERS ---
    const btnToggleWeighIn = document.getElementById('btn-toggle-weigh-in');
    const weighInFormWrapper = document.getElementById('weigh-in-form-wrapper');
    const btnCancelWeighIn = document.getElementById('btn-cancel-weigh-in');
    const btnSubmitWeighIn = document.getElementById('btn-submit-weigh-in');

    btnToggleWeighIn.addEventListener('click', () => {
        const isHidden = weighInFormWrapper.style.display === 'none';
        weighInFormWrapper.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            document.getElementById('weigh-in-date').value = `${year}-${month}-${day}`;
        }
    });

    btnCancelWeighIn.addEventListener('click', () => {
        weighInFormWrapper.style.display = 'none';
    });

    btnSubmitWeighIn.addEventListener('click', async () => {
        const party = document.getElementById('weigh-in-party').value;
        const weightVal = parseFloat(document.getElementById('weigh-in-weight').value);
        const dateVal = document.getElementById('weigh-in-date').value;

        if (!weightVal || weightVal <= 0) {
            alert('Masukkan angka berat badan yang valid!');
            return;
        }
        if (!dateVal) {
            alert('Pilih tanggal!');
            return;
        }

        btnSubmitWeighIn.disabled = true;
        btnSubmitWeighIn.textContent = 'Menyimpan...';

        const newLog = {
            id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            party: party,
            weight: weightVal,
            date: dateVal
        };

        const updatedLogs = [...localLogs, newLog];

        try {
            await setDoc(agreementDocRef, { weighIns: updatedLogs }, { merge: true });
            document.getElementById('weigh-in-weight').value = '';
            weighInFormWrapper.style.display = 'none';
        } catch (error) {
            console.error("Error saving log: ", error);
            alert("Gagal menyimpan data timbangan.");
        } finally {
            btnSubmitWeighIn.disabled = false;
            btnSubmitWeighIn.textContent = 'Simpan Data ✓';
        }
    });

    let overlayShownThisSession = sessionStorage.getItem('weight_challenge_overlay_shown') === 'true';

    // Firestore Sync Real-Time listener
    onSnapshot(agreementDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Check Pur
            if (data.pur && data.pur.signed) {
                applySignedState('pur', data.pur.img, data.pur.date);
            } else {
                applyUnsignedState('pur');
            }

            // Check Stevhan
            if (data.stevhan && data.stevhan.signed) {
                applySignedState('stevhan', data.stevhan.img, data.stevhan.date);
            } else {
                applyUnsignedState('stevhan');
            }

            // Check Dewa
            if (data.dewa && data.dewa.signed) {
                applySignedState('dewa', data.dewa.img, data.dewa.date);
            } else {
                applyUnsignedState('dewa');
            }

            // Load and render weekly progress logs
            localLogs = data.weighIns || [];
            renderChart(localLogs);
            renderTable(localLogs);
            renderSchedules(localLogs);
            renderMilestoneChart(localLogs);

            // Confetti Trigger if all 3 are signed
            const allSigned = data.pur?.signed && data.stevhan?.signed && data.dewa?.signed;
            if (allSigned && !overlayShownThisSession) {
                successOverlay.classList.add('active');
                startConfetti();
                sessionStorage.setItem('weight_challenge_overlay_shown', 'true');
                overlayShownThisSession = true;
            }
        } else {
            applyUnsignedState('pur');
            applyUnsignedState('stevhan');
            applyUnsignedState('dewa');
            renderChart([]);
            renderTable([]);
            renderSchedules([]);
            renderMilestoneChart([]);
        }
    }, (error) => {
        console.error("Firestore sync error: ", error);
        alert("Firestore Error. Harap periksa apakah Firestore Database sudah dibuat di Firebase Console Anda dan rulesnya diset ke test mode.");
    });



    // --- DAILY BANNER MOTIVATION BANNER LOGIC ---
    const quotes = [
        "Ingat Pur, donat hari ini adalah penyesalan di meja Gyukaku nanti! 🍩",
        "Stevhan, minum air putih 2 gelas sekarang bisa membantu metabolisme lemak! 💧",
        "Dewa diam-diam defisit kalori, jangan sampai kalian terkejut di akhir tantangan! 🤫",
        "Tip Hari Ini: Kurangi gorengan, perbanyak protein. Biar grafik penurunan Anda melesat ke atas! 🚀",
        "Gyukaku Paket Standar sudah menanti Juara 1. Juara 3 siap-siap gesek kartu dengan tabah! 🍖",
        "Katanya mau sehat, kok masih lirik martabak manis semalam? Ingat kontrak digital ini! ⚠️",
        "Tip Hari Ini: Cobalah 'Intermittent Fasting'. Batasi waktu makanmu agar kalori harian tetap aman. ⏱️",
        "Defisit kalori itu sederhana: bakar lebih banyak dari yang dimakan. Jangan kebalik! ⚖️",
        "Ingat, timbangan digital tidak pernah berbohong. Kecuali kalau Anda nimbang sambil pegangan tembok! 🤣",
        "Tip Hari Ini: Kurangi minuman manis instan. Satu gelas boba setara kalori makan siang lengkap! 🧋",
        "Stevhan, olahraga 30 menit sehari lebih baik daripada memikirkan menu curang (cheat meal)! 🏃‍♂️",
        "Pur, konsisten adalah kunci. Satu hari gagal bukan berarti tantangan selesai. Mulai lagi hari ini! 💪",
        "Dewa, ayo panaskan klasemen! Tunjukkan penurunan berat badanmu hari ini! 📊",
        "Tip Hari Ini: Perbanyak serat dari sayuran agar kenyang lebih lama tanpa kalori berlebih. 🥦",
        "Jangan ngambek di akhir tantangan ya, tanda tangan kalian bertiga sudah tersimpan abadi di database Firestore! 🔒",
        "Setiap langkah kaki hari ini mendekatkan Anda ke gelar juara makan gratis di Gyukaku! 🥇",
        "Tip Hari Ini: Makanlah secara perlahan. Butuh waktu 20 menit bagi otak untuk menerima sinyal kenyang. 🧠",
        "Jangan jadikan olahraga sebagai hukuman karena makan banyak, tapi jadikan perayaan atas apa yang tubuhmu bisa lakukan! ✨",
        "Pur, Stevhan, Dewa... mata Vercel memantau grafik penurunan kalian setiap detik! 👀",
        "Tip Hari Ini: Pastikan tidur cukup 7-8 jam. Kurang tidur bisa memicu hormon lapar (ghrelin) meningkat. 😴",
        "Timbangan akhir 29 Juli sudah menunggu. Jangan sampai menyesal di hari kerja! 📅",
        "Tip Hari Ini: Siapkan cemilan sehat seperti buah atau kacang almond sebelum rasa lapar melanda. 🍎",
        "Ingat, pemenang ditentukan dari PERSENTASE penurunan, bukan total kilogram. Semua orang punya peluang sama! ⚖️",
        "Lebih baik lelah kardio daripada lelah dompet karena harus bayar 90% bill Gyukaku! 💸",
        "Semangat bertarung sehat! Jaga sportivitas dan mari capai berat badan ideal bersama-sama! 🔥",
        "Tip Hari Ini: Minum air putih 500ml sebelum makan besar untuk membantu mengontrol porsi makan. 💧",
        "Pikirkan Gyukaku Paket Standar bergulir di lidah Anda, Pur. Letakkan garpu mie instan itu sekarang! 🍜",
        "Stevhan, jika lapar malam hari, cobalah tidur. Itu hanya keinginan mengunyah, bukan kebutuhan tubuh. 🛌",
        "Dewa, timbanganmu hari ini adalah cerminan dari disiplinmu kemarin! 🎯",
        "Tip Hari Ini: Kurangi penggunaan garam berlebih, karena garam bisa mengikat air dalam tubuh (water retention). 🧂",
        "Apakah Anda tahu? Berjalan kaki 10.000 langkah membakar sekitar 300-400 kalori. Yuk jalan kaki! 🚶‍♂️",
        "Pur, jika Anda tergoda makan pizza, ingatlah bayangan bill Gyukaku sebesar 900 ribu rupiah! 🍕",
        "Stevhan, jangan malas melakukan latihan beban. Massa otot yang tinggi membantu membakar kalori saat diam. 🏋️‍♂️",
        "Dewa sudah mulai jogging tiap pagi, kalian berdua (Pur & Stevhan) jangan mau ketinggalan! 🏃‍♂️",
        "Tip Hari Ini: Masak makanan sendiri di rumah membantu Anda mengontrol kalori dan minyak dengan presisi. 🍳",
        "Makan pelan-pelan, nikmati setiap gigitan. Perut kenyang, hati pun senang tanpa harus nambah porsi. 🍽️",
        "Ingat, turun berat badan adalah maraton, bukan sprint. Yang konsisten yang akan makan gratis! 🏆",
        "Tip Hari Ini: Hindari ngemil sambil nonton TV atau main HP, karena Anda tidak akan sadar berapa banyak yang dimakan. 📱",
        "Pur, kurangi porsi karbohidrat dan ganti dengan porsi protein lebih banyak. Kenyangnya lebih awet! 🍗",
        "Stevhan, defisit kalori tidak berarti kelaparan. Pilih makanan padat volume tapi rendah kalori (seperti semangka). 🍉",
        "Dewa, apakah hari ini beratmu sudah turun? Klasemen real-time sedang bergoyang! 📈",
        "Tip Hari Ini: Biasakan naik tangga daripada lift jika hanya naik 2-3 lantai. Lumayan bakar kalori ekstra! 🪜",
        "Defisit kalori 500 kalori per hari secara konsisten bisa menurunkan sekitar 0.5 kg lemak per minggu. 📉",
        "Pur, Stevhan, Dewa, siapa yang hari ini makannya paling bersih? Gyukaku menanti sang juara! 🥩",
        "Tip Hari Ini: Buatlah jurnal makanan (food tracking) agar Anda sadar kalori apa saja yang masuk. 📓",
        "Makan buah utuh jauh lebih mengenyangkan daripada minum jus buah yang ditambah gula. 🍊",
        "Stevhan, jika berat badanmu naik sedikit hari ini, itu mungkin hanya air. Jangan patah semangat! 💪",
        "Pur, hilangkan kebiasaan ngemil keripik saat kerja. Kalori kecilnya cepat menumpuk tanpa disadari. 🚫",
        "Dewa, persentase penurunanmu terlihat menjanjikan. Pertahankan pola makan bersihnya! 👍",
        "Tip Hari Ini: Hindari belanja bahan makanan ke supermarket saat perut sedang lapar. Anda akan tergoda membeli junk food. 🛒",
        "Diet yang berhasil adalah diet yang bisa dinikmati dalam jangka panjang, bukan cuma 2 minggu menyiksa. 🧘‍♂️",
        "Pur, bayangkan wajah Stevhan dan Dewa tertawa bahagia saat Anda membayar tagihan Gyukaku mereka. Ayo bakar lemak! 😈",
        "Stevhan, satu gelas teh manis hangat mengandung sekitar 100 kalori. Lebih baik ganti teh tawar atau air putih! 🍵",
        "Dewa, defisit kalori tanpa olahraga bisa membuat tubuh terasa lemas. Yuk, luangkan waktu bergerak! 🚴‍♂️",
        "Tip Hari Ini: Gunakan piring atau mangkok yang lebih kecil untuk trik psikologi porsi makan sedikit. 🥣",
        "Setiap tetes keringat saat kardio adalah investasi agar tidak tekor saat traktiran makan besar! 💦",
        "Tip Hari Ini: Jangan lewatkan sarapan jika itu membuat Anda makan porsi gila-gilaan di siang hari. 🍳",
        "Pur, tantangan ini tinggal beberapa minggu lagi. Jangan biarkan usaha kerasmu sia-sia karena satu 'cheat day' berlebihan! ⏳",
        "Stevhan, jadwalkan olahraga bersama teman agar motivasi latihan tetap membara. 🤝",
        "Dewa, klasemen hari ini membuktikan siapa yang paling niat dietnya. Tunjukkan taringmu! 🦁",
        "Tip Hari Ini: Konsumsi yogurt tawar (Greek yogurt) sebagai cemilan sehat berprotein tinggi. 🥛",
        "Air es tidak membakar lemak secara ajaib, tapi air dingin terbukti sedikit menaikkan metabolisme tubuh. 🧊",
        "Pur, jika Stevhan mengajak nongkrong di kafe, pesanlah Americano atau kopi hitam tanpa gula. ☕",
        "Stevhan, pastikan asupan lemak sehat tetap terpenuhi dari alpukat atau kuning telur. 🥑",
        "Dewa, apakah target berat badanmu sudah dekat? Jangan kendor di pertengahan jalan! 🏁",
        "Tip Hari Ini: Kurangi saus botolan atau mayones berlebih karena mereka tinggi kalori tersembunyi. 🥫",
        "Jangan tergoda obat pelangsing instan. Kuncinya tetap defisit kalori dan olahraga konsisten! 💊",
        "Pur, kurangi makan malam terlalu larut agar pencernaan bekerja optimal saat tidur. 🌙",
        "Stevhan, berat badan ideal membuat tubuh terasa lebih ringan, aktif, dan percaya diri! ✨",
        "Dewa, mari kita lihat grafik penurunanmu besok pagi. Apakah akan meluncur ke bawah? 📉",
        "Tip Hari Ini: Kurangi konsumsi daging olahan seperti sosis atau kornet. Pilih daging segar utuh. 🥩",
        "Bumbu dapur alami seperti cabai dan lada bisa membantu meningkatkan pembakaran kalori tubuh. 🌶️",
        "Pur, ingat janji tanda tangan kontrak digital ini: dilarang ngambek atau cari alasan di akhir! 😉",
        "Stevhan, fokus pada proses harian Anda. Hasil timbangan akhir akan mengikuti kedisiplinan Anda. 🎯",
        "Dewa, jangan biarkan porsi nasi padang merusak kerja keras jogging pagi Anda! 🍛",
        "Tip Hari Ini: Minum teh hijau tanpa gula. Teh hijau kaya antioksidan dan membantu membakar lemak. 🍵",
        "Defisit kalori ekstrem (<1000 kalori) tidak sehat dan bisa merusak metabolisme tubuh. Turunkan secara bertahap! ⚠️",
        "Pur, bayangkan kenikmatan daging Gyukaku gratis yang dibayari oleh peringkat 3! 🤤",
        "Stevhan, luangkan waktu jalan kaki sore. Selain membakar kalori, ini juga meredakan stres harian. 🌳",
        "Dewa, tantangan harian ini seru sekali karena datanya tersimpan langsung di cloud Firestore. Ayo update! ☁️",
        "Tip Hari Ini: Makanlah buah apel sebagai cemilan sore. Apel tinggi serat dan air sehingga mengenyangkan. 🍎",
        "Mencuci mobil atau membersihkan rumah sendiri juga termasuk aktivitas fisik pembakar kalori! 🧹",
        "Pur, jika lapar menyerang sore hari, cobalah minum air hangat terlebih dahulu. Seringkali itu hanya dehidrasi. 🥛",
        "Stevhan, kurangi makan roti putih dan beralihlah ke roti gandum utuh yang lebih padat serat. 🍞",
        "Dewa, posisi klasemenmu sangat kompetitif. Terus jaga pola makan sehatnya! 💪",
        "Tip Hari Ini: Ganti cemilan keripik dengan popcorn polos (popcorn tawar tanpa mentega/karamel). 🍿",
        "Olahraga kardio terbaik adalah olahraga yang Anda sukai, entah itu berenang, bersepeda, badminton, atau futsal. 🏊‍♂️",
        "Pur, apakah hari ini Anda sudah bergerak aktif? Ayo lakukan minimal 5.000 langkah! 🚶",
        "Stevhan, defisit kalori adalah satu-satunya hukum fisika yang diakui untuk menurunkan berat badan. ⚖️",
        "Dewa, jangan lupa cukupi kebutuhan air minum 2-3 liter per hari agar metabolisme lancar. 💧",
        "Tip Hari Ini: Kurangi konsumsi gorengan pinggir jalan. Minyak jenuhnya sangat tinggi kalori jahat! 🍤",
        "Kurangi porsi manis, perbanyak porsi senyum. Semangat diet sehatnya bertiga! 😄",
        "Pur, pertahankan semangatmu! Gyukaku Paket Standar sudah menanti sang juara sejati. 🥇",
        "Stevhan, jadikan tantangan 2 bulan ini sebagai batu loncatan untuk gaya hidup sehat selamanya. 🚀",
        "Dewa, jangan biarkan godaan martabak manis meruntuhkan pertahanan defisit kalori Anda! 🥞",
        "Tip Hari Ini: Pilihlah sumber protein rendah lemak seperti dada ayam tanpa kulit, ikan, atau putih telur. 🥚",
        "Jangan timbang berat badan berkali-kali sehari. Cukup sekali sehari di pagi hari untuk data yang akurat. 🗓️",
        "Pur, Stevhan, Dewa, buktikan siapa di antara kalian yang memiliki tekad paling kuat! 🔥",
        "Tip Hari Ini: Nikmati perjalanan penurunan berat badan ini tanpa stres berlebih. Stres bisa memicu hormon penimbun lemak (kortisol). 🧘",
        "Selamat berjuang sampai 29 Juli! Juara 1 siap makan gratis, Juara 2 bayar 10%, Juara 3 siap-siap 90%! 🏆🎉"
    ];

    const quoteTextEl = document.getElementById('daily-quote-text');
    const btnRefreshQuote = document.getElementById('btn-refresh-quote');

    function showRandomQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteTextEl.textContent = quotes[randomIndex];
    }

    // Initialize with a random quote
    showRandomQuote();

    // Listen for refresh button click
    btnRefreshQuote.addEventListener('click', () => {
        showRandomQuote();
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

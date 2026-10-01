/* ========== JS: CLASSIFICATION (TERHUBUNG KE BACKEND FLASK) ========== */
const predictBtn = document.getElementById('predictBtn');

if (predictBtn) {
  predictBtn.addEventListener('click', async () => {
    // Fungsi pembantu: membaca angka atau mengembalikan null jika elemen kosong/tidak ada
    const g = id => {
      const el = document.getElementById(id);
      if (!el || el.value.trim() === '') return null;
      const num = parseFloat(el.value);
      return isNaN(num) ? null : num;
    };

    const box = document.getElementById('clsResult');
    const label = document.getElementById('clsLabel');
    const note = document.getElementById('clsNote');
    const bar = document.getElementById('clsBar');

    // 1. Susun 6 parameter sensor wajib (disertai fallback jika form kosong/belum ada)
    const payload = {
      temperature: g('fTemp') ?? 75.0,
      vibration: g('fVib') ?? 4.5,
      humidity: g('fHum') ?? 60.0,
      pressure: g('fPres') ?? 101.3,
      energy_consumption: g('fEnergy') ?? 68.0,
      predicted_remaining_life: g('fLife') ?? g('fRul') ?? 120.0
    };

    // 2. Beri indikator proses dan kunci tombol sementara
    predictBtn.disabled = true;
    if (label) label.textContent = 'Menganalisis...';
    if (note) note.textContent = 'Menghubungi model Random Forest di backend...';

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Tangani respon jika status HTTP bukan 200 OK
      if (!response.ok) {
        let errorMsg = 'Gagal memproses inferensi AI.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (_) {
          errorMsg = `Server error (${response.status}): Periksa log terminal Flask.`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Evaluasi hasil prediksi (0 = Aman, 1 = Butuh Maintenance)
      const bad = data.prediction === 1;
      const probMaintenance = (data.probability.maintenance * 100).toFixed(1);

      // 3. Tampilkan hasil prediksi ke UI antarmuka
      if (box) box.classList.toggle('bad', bad);
      if (label) label.textContent = data.status;
      if (note) {
        note.textContent = `Probabilitas risiko maintenance: ${probMaintenance}% (Model: Random Forest).`;
      }

      if (bar) {
        bar.style.width = probMaintenance + '%';
        bar.style.background = bad ? 'var(--red)' : 'var(--green)';
      }

    } catch (err) {
      console.error('Error inferensi:', err);
      if (box) box.classList.remove('bad');
      if (label) label.textContent = 'Terjadi Kesalahan';
      if (note) note.textContent = err.message;
    } finally {
      // 4. Aktifkan kembali tombol setelah proses selesai
      predictBtn.disabled = false;
    }
  });
}
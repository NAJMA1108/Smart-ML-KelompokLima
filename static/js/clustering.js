/* ========== JS: CLUSTERING ========== */
const kNum=document.getElementById('kNum');
kNum.addEventListener('input',()=>document.getElementById('kOut').textContent=kNum.value);

function rng(seed){return()=>((seed=(seed*16807)%2147483647)/2147483647)}
function runClustering(){
  const k=+kNum.value, rand=rng(42+k*7), svg=document.getElementById('scatter');
  const sizes=Array.from({length:k},()=>0.5+rand()); const tot=sizes.reduce((a,b)=>a+b,0);
  let dots='', rows='', dist='', legend='';
  for(let c=0;c<k;c++){
    const cx=60+rand()*280, cy=40+rand()*180, n=45, pts=Math.round(sizes[c]/tot*100000);
    for(let i=0;i<n;i++){
      const x=cx+(rand()+rand()+rand()-1.5)*45, y=cy+(rand()+rand()+rand()-1.5)*35;
      dots+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${COLORS[c]}" opacity=".75"/>`;
    }
    rows+=`<tr><td style="color:${COLORS[c]}">Cluster ${c}</td><td>${pts.toLocaleString()}</td><td>${(55+rand()*35).toFixed(1)}°C</td><td>${(0.5+rand()*4).toFixed(2)}</td></tr>`;
    dist+=`<i style="width:${sizes[c]/tot*100}%;background:${COLORS[c]}"></i>`;
    legend+=`<span style="margin-right:14px"><i style="background:${COLORS[c]}"></i>Cluster ${c}</span>`;
  }
  svg.innerHTML=dots;
  document.getElementById('cTable').innerHTML=rows;
  document.getElementById('dist').innerHTML=dist;
  document.getElementById('legend').innerHTML=legend.replace(/<i /g,'<i class="dot" ');
  document.getElementById('sK').textContent=k;
  document.getElementById('sSil').textContent=(0.78-k*0.03).toFixed(2);
}
<<<<<<< Updated upstream
document.getElementById('clusterBtn').addEventListener('click',runClustering);
runClustering();
=======


// =========================================================
// HELPER & SANITY CHECK
// =========================================================

function getNumber(id, min, max, label) {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error(`Element #${id} tidak ditemukan.`);
    }

    const value = Number(element.value);

    if (!Number.isFinite(value)) {
        throw new Error(`Nilai ${label} harus berupa angka.`);
    }

    // Validasi batas wajar sensor industri
    if (value < min || value > max) {
        throw new Error(`Nilai ${label} (${value}) tidak valid. Batas wajar: ${min} - ${max}.`);
    }

    return value;
}


// =========================================================
// KAMUS MAKNA OPERASIONAL CLUSTER (SEMANTIK BISNIS)
// =========================================================

const clusterDescriptions = {
    0: {
        name: "Cluster 0: Operasional Normal",
        desc: "Kondisi suhu, getaran, dan parameter mesin stabil dalam batas toleransi kerja optimal."
    },
    1: {
        name: "Cluster 1: Peringatan Dini (Warning)",
        desc: "Terdeteksi deviasi anomali ringan pada suhu atau getaran; disarankan pemantauan berkala."
    },
    2: {
        name: "Cluster 2: Risiko Kritis / Beban Tinggi",
        desc: "Kondisi mesin menunjukkan indikasi beban berlebih atau potensi gangguan komponen."
    },
    3: {
        name: "Cluster 3: Anomali Konsumsi Energi",
        desc: "Pola penggunaan daya listrik tidak normal terhadap tekanan operasional."
    },
    4: {
        name: "Cluster 4: Fase Transisi Mesin",
        desc: "Mesin berada pada siklus transisi, start-up, atau penyesuaian beban."
    }
};


// =========================================================
// JALANKAN CLUSTERING
// =========================================================

async function runClustering() {

    const message = document.getElementById("clusterMessage");
    const result = document.getElementById("clusterResult");
    const resultNote = document.getElementById("clusterResultNote");
    const sK = document.getElementById("sK");

    try {

        // -----------------------------------------------------
        // AMBIL & VALIDASI INPUT SENSOR (DENGAN BATAS AMAN)
        // -----------------------------------------------------

        const temperature = getNumber("clusterTemp", -10, 300, "Suhu (°C)");
        const vibration = getNumber("clusterVib", 0, 100, "Getaran (mm/s)");
        const humidity = getNumber("clusterHum", 0, 100, "Kelembapan (%)");
        const pressure = getNumber("clusterPres", 0, 50, "Tekanan (bar)");
        const energy = getNumber("clusterEnergy", 0, 200, "Konsumsi Energi");


        // -----------------------------------------------------
        // TAMPILKAN STATUS LOADING
        // -----------------------------------------------------

        if (message) {
            message.textContent = "Mengirim data ke model clustering...";
        }

        if (result) {
            result.textContent = "Processing...";
        }

        if (resultNote) {
            resultNote.textContent =
                "Data sensor sedang diproses oleh model K-Means.";
        }


        // -----------------------------------------------------
        // DATA YANG DIKIRIM KE FLASK
        // -----------------------------------------------------

        const payload = {
            temperature: temperature,
            vibration: vibration,
            humidity: humidity,
            pressure: pressure,
            energy_consumption: energy
        };


        console.log("Data clustering yang dikirim:", payload);


        // -----------------------------------------------------
        // REQUEST KE FLASK
        // -----------------------------------------------------

        const response = await fetch("/cluster", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)

        });


        // -----------------------------------------------------
        // BACA RESPONSE
        // -----------------------------------------------------

        const data = await response.json();

        console.log("Response clustering:", data);


        // -----------------------------------------------------
        // JIKA SERVER ERROR
        // -----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.error || "Gagal melakukan clustering."
            );

        }


        // -----------------------------------------------------
        // HASIL CLUSTER
        // -----------------------------------------------------

        const cluster = Number(data.cluster);


        if (!Number.isInteger(cluster)) {
            throw new Error("Response cluster dari server tidak valid.");
        }


        // Ambil definisi makna operasional berdasarkan nomor cluster
        const clusterInfo = clusterDescriptions[cluster] || {
            name: `Cluster ${cluster}`,
            desc: `Data sensor dikategorikan oleh model K-Means ke dalam Cluster ${cluster}.`
        };


        // -----------------------------------------------------
        // TAMPILKAN HASIL KE ANTARMUKA
        // -----------------------------------------------------

        if (result) {
            result.textContent = clusterInfo.name;
        }

        if (sK) {
            sK.textContent = cluster;
        }

        if (resultNote) {
            resultNote.textContent = clusterInfo.desc;
        }

        if (message) {
            message.textContent = `Berhasil dikategorikan ke ${clusterInfo.name}.`;
        }


        // -----------------------------------------------------
        // WARNA HASIL
        // -----------------------------------------------------

        const clusterColors = [
            "#22d3ee",
            "#a78bfa",
            "#34d399",
            "#f59e0b",
            "#f472b6"
        ];

        const color = clusterColors[cluster] || "#22d3ee";


        if (result) {
            result.style.color = color;
        }


        // -----------------------------------------------------
        // UPDATE VISUALISASI
        // -----------------------------------------------------

        updateClusterVisualization(cluster);


    } catch (error) {

        console.error("Clustering error:", error);


        if (message) {
            message.textContent = "Error: " + error.message;
        }

        if (result) {
            result.textContent = "Input Tidak Valid";
            result.style.color = "#ef4444";
        }

        if (resultNote) {
            resultNote.textContent = error.message;
        }

    }

}


// =========================================================
// VISUALISASI CLUSTER
// =========================================================

function updateClusterVisualization(cluster) {

    const svg = document.getElementById("scatter");
    const legend = document.getElementById("legend");
    const dist = document.getElementById("dist");

    if (!svg) {
        return;
    }


    const colors = [
        "#22d3ee",
        "#a78bfa",
        "#34d399",
        "#f59e0b",
        "#f472b6"
    ];


    const color = colors[cluster] || "#22d3ee";


    // -----------------------------------------------------
    // HAPUS VISUALISASI LAMA
    // -----------------------------------------------------

    svg.innerHTML = "";


    // -----------------------------------------------------
    // TANDA CLUSTER YANG AKTIF
    // -----------------------------------------------------

    const cx = 200;
    const cy = 130;


    // Lingkaran pusat

    const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
    );

    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", "55");
    circle.setAttribute("fill", color);
    circle.setAttribute("opacity", "0.15");
    circle.setAttribute("stroke", color);
    circle.setAttribute("stroke-width", "2");

    svg.appendChild(circle);


    // Titik utama

    const centerPoint = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
    );

    centerPoint.setAttribute("cx", cx);
    centerPoint.setAttribute("cy", cy);
    centerPoint.setAttribute("r", "8");
    centerPoint.setAttribute("fill", color);

    svg.appendChild(centerPoint);


    // -----------------------------------------------------
    // TITIK-TITIK VISUAL
    // -----------------------------------------------------

    for (let i = 0; i < 25; i++) {

        const angle = (Math.PI * 2 * i) / 25;
        const radius = 20 + ((i * 17) % 35);
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius * 0.65;

        const point = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

        point.setAttribute("cx", x.toFixed(1));
        point.setAttribute("cy", y.toFixed(1));
        point.setAttribute("r", "3");
        point.setAttribute("fill", color);
        point.setAttribute("opacity", "0.7");

        svg.appendChild(point);

    }


    // -----------------------------------------------------
    // LEGEND
    // -----------------------------------------------------

    if (legend) {
        legend.innerHTML = `
            <span style="margin-right:14px">
                <i
                    class="dot"
                    style="
                        display:inline-block;
                        width:8px;
                        height:8px;
                        border-radius:50%;
                        background:${color};
                        margin-right:6px;
                    "
                ></i>
                Active Cluster ${cluster}
            </span>
        `;
    }


    // -----------------------------------------------------
    // DISTRIBUTION BAR
    // -----------------------------------------------------

    if (dist) {
        dist.innerHTML = `
            <i
                style="
                    display:block;
                    width:100%;
                    height:100%;
                    background:${color};
                    border-radius:inherit;
                "
            ></i>
        `;
    }

}


// =========================================================
// BUTTON EVENT
// =========================================================

if (clusterBtn) {
    clusterBtn.addEventListener("click", runClustering);
}
>>>>>>> Stashed changes

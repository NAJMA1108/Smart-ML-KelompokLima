/* =========================================================
   CLUSTERING - CONNECTED TO FLASK /cluster API
   ========================================================= */

const kNum = document.getElementById("kNum");
const kOut = document.getElementById("kOut");
const clusterBtn = document.getElementById("clusterBtn");


// =========================================================
// UPDATE NILAI K
// =========================================================

if (kNum && kOut) {
    kNum.addEventListener("input", () => {
        kOut.textContent = kNum.value;
    });
}


// =========================================================
// HELPER
// =========================================================

function getNumber(id) {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error(`Element #${id} tidak ditemukan.`);
    }

    const value = Number(element.value);

    if (!Number.isFinite(value)) {
        throw new Error(`Nilai ${id} harus berupa angka.`);
    }

    return value;
}


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
        // AMBIL INPUT SENSOR
        // -----------------------------------------------------

        const temperature = getNumber("clusterTemp");
        const vibration = getNumber("clusterVib");
        const humidity = getNumber("clusterHum");
        const pressure = getNumber("clusterPres");
        const energy = getNumber("clusterEnergy");


        // -----------------------------------------------------
        // TAMPILKAN STATUS
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


        // -----------------------------------------------------
        // TAMPILKAN HASIL
        // -----------------------------------------------------

        if (result) {
            result.textContent = `Cluster ${cluster}`;
        }

        if (sK) {
            sK.textContent = cluster;
        }

        if (resultNote) {

            resultNote.textContent =
                `Data sensor dikategorikan oleh model K-Means ke dalam Cluster ${cluster}.`;

        }

        if (message) {

            message.textContent =
                `Berhasil. Model menghasilkan Cluster ${cluster}.`;

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

        const color =
            clusterColors[cluster] || "#22d3ee";


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
            message.textContent =
                "Error: " + error.message;
        }

        if (result) {
            result.textContent = "Clustering gagal";
            result.style.color = "#ef4444";
        }

        if (resultNote) {
            resultNote.textContent =
                error.message;
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


    const color =
        colors[cluster] || "#22d3ee";


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

        const angle =
            (Math.PI * 2 * i) / 25;

        const radius =
            20 + ((i * 17) % 35);

        const x =
            cx + Math.cos(angle) * radius;

        const y =
            cy + Math.sin(angle) * radius * 0.65;


        const point = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

        point.setAttribute(
            "cx",
            x.toFixed(1)
        );

        point.setAttribute(
            "cy",
            y.toFixed(1)
        );

        point.setAttribute(
            "r",
            "3"
        );

        point.setAttribute(
            "fill",
            color
        );

        point.setAttribute(
            "opacity",
            "0.7"
        );

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

    clusterBtn.addEventListener(
        "click",
        runClustering
    );

}
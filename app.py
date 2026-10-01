import os
import json
import joblib
import numpy as np
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# ==============================================================================
# 1. PATH DAN DEFINISI FITUR
# ==============================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

CLASSIFIER_PATH = os.path.join(MODELS_DIR, 'maintenance_classifier.pkl')
CLUSTERING_PATH = os.path.join(MODELS_DIR, 'model_clustering.pkl')
SCALER_PATH     = os.path.join(MODELS_DIR, 'scaler_clustering.pkl')
META_PATH       = os.path.join(MODELS_DIR, 'clustering_meta.json')

# 6 Fitur wajib untuk klasifikasi
REQUIRED_FEATURES = [
    "temperature",
    "vibration",
    "humidity",
    "pressure",
    "energy_consumption",
    "predicted_remaining_life"
]

# 5 Fitur khusus untuk clustering
CLUSTERING_FEATURES = [
    "temperature",
    "vibration",
    "humidity",
    "pressure",
    "energy_consumption"
]

# ==============================================================================
# 2. MEMUAT SEMUA MODEL, SCALER, DAN METADATA KE MEMORI
# ==============================================================================
model_classifier = None
model_clustering = None
scaler_clustering = None
cluster_names_map = {"0": "Berat", "1": "Ringan", "2": "Normal"}

# A. Muat Model Klasifikasi (Supervised)
try:
    package_clf = joblib.load(CLASSIFIER_PATH)
    if isinstance(package_clf, dict):
        model_classifier = package_clf.get("model", package_clf)
        if "features" in package_clf:
            REQUIRED_FEATURES = package_clf["features"]
    elif isinstance(package_clf, (list, tuple)):
        model_classifier = package_clf[0]
        if len(package_clf) > 1 and isinstance(package_clf[1], list):
            REQUIRED_FEATURES = package_clf[1]
    else:
        model_classifier = package_clf

    print("[BERHASIL] Model 1: maintenance_classifier.pkl berhasil dimuat.")
except Exception as e:
    print(f"[GAGAL] Gagal memuat Model Klasifikasi: {e}")

# B. Muat Model Clustering (Unsupervised K-Means)
try:
    package_clt = joblib.load(CLUSTERING_PATH)
    if isinstance(package_clt, dict):
        model_clustering = package_clt.get("model", package_clt)
    elif isinstance(package_clt, (list, tuple)):
        model_clustering = package_clt[0]
    else:
        model_clustering = package_clt

    print("[BERHASIL] Model 2: model_clustering.pkl berhasil dimuat.")
except Exception as e:
    print(f"[GAGAL] Gagal memuat Model Clustering: {e}")

# C. Muat Scaler Clustering
try:
    scaler_clustering = joblib.load(SCALER_PATH)
    print("[BERHASIL] Scaler: scaler_clustering.pkl berhasil dimuat.")
except Exception as e:
    print(f"[GAGAL] Gagal memuat Scaler Clustering: {e}")

# D. Muat Metadata Clustering (clustering_meta.json)
try:
    with open(META_PATH, 'r') as f:
        meta_json = json.load(f)
        if "cluster_names" in meta_json:
            cluster_names_map = meta_json["cluster_names"]
        if "features" in meta_json:
            CLUSTERING_FEATURES = meta_json["features"]
    print("[BERHASIL] Metadata: clustering_meta.json berhasil dimuat.")
except Exception as e:
    print(f"[PERINGATAN] Gagal membaca metadata JSON, menggunakan mapping default: {e}")


# ==============================================================================
# 3. ROUTE HALAMAN UTAMA
# ==============================================================================
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


# ==============================================================================
# 4. ROUTE PREDIKSI GANDA (/predict)
# ==============================================================================
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data_masuk = request.get_json() if request.is_json else request.form

        # 1. Validasi: Seluruh 6 parameter sensor wajib ada
        for kolom in REQUIRED_FEATURES:
            if kolom not in data_masuk or data_masuk[kolom] == '':
                return jsonify({"error": f"Missing required field: {kolom}"}), 400

        # 2. Parsing seluruh input ke tipe numerik float
        try:
            temp = float(data_masuk["temperature"])
            vib = float(data_masuk["vibration"])
            hum = float(data_masuk["humidity"])
            press = float(data_masuk["pressure"])
            energy = float(data_masuk["energy_consumption"])
            rem_life = float(data_masuk["predicted_remaining_life"])
        except ValueError:
            return jsonify({"error": "Semua parameter sensor harus berupa angka (numeric)!"}), 400

        # ----------------------------------------------------------------------
        # EKSEKUSI MODEL 1: KLASIFIKASI (SUPERVISED)
        # Menggunakan 6 fitur sensor lengkap
        # ----------------------------------------------------------------------
        array_classifier = np.array([[temp, vib, hum, press, energy, rem_life]])
        prediction = int(model_classifier.predict(array_classifier)[0])
        probability = model_classifier.predict_proba(array_classifier)[0]

        status_teks = "Maintenance Required" if prediction == 1 else "No Maintenance Required"
        prob_no_maint = round(float(probability[0]), 4)
        prob_maint = round(float(probability[1]), 4)

        # ----------------------------------------------------------------------
        # EKSEKUSI MODEL 2: CLUSTERING (UNSUPERVISED)
        # Menggunakan 5 fitur sensor dan dinormalisasi dengan StandardScaler
        # ----------------------------------------------------------------------
        cluster_id = None
        cluster_label = "Tidak Diketahui"

        if model_clustering is not None and scaler_clustering is not None:
            array_clustering_raw = np.array([[temp, vib, hum, press, energy]])
            # Transformasi skala data sebelum masuk K-Means
            array_clustering_scaled = scaler_clustering.transform(array_clustering_raw)
            
            cluster_id = int(model_clustering.predict(array_clustering_scaled)[0])
            cluster_label = cluster_names_map.get(str(cluster_id), f"Cluster {cluster_id}")

        # ----------------------------------------------------------------------
        # PENGIRIMAN RESPON
        # ----------------------------------------------------------------------
        # A. Output JSON (REST API / Fetch JS)
        if request.is_json:
            return jsonify({
                "success": True,
                # Modul 1: Klasifikasi
                "prediction": prediction,
                "status": status_teks,
                "probability": {
                    "no_maintenance": prob_no_maint,
                    "maintenance": prob_maint
                },
                "risk_percentage": round(prob_maint * 100, 2),
                # Modul 2: Clustering
                "cluster_id": cluster_id,
                "cluster_name": cluster_label
            }), 200

        # B. Output Web (Render HTML Form)
        return render_template(
            'predict.html',
            temperature=temp,
            vibration=vib,
            humidity=hum,
            pressure=press,
            energy_consumption=energy,
            predicted_remaining_life=rem_life,
            prediction=prediction,
            status=status_teks,
            prob_no_maintenance=round(prob_no_maint * 100, 2),
            prob_maintenance=round(prob_maint * 100, 2),
            cluster_id=cluster_id,
            cluster_name=cluster_label
        )

    except Exception as e:
        return jsonify({"error": f"Terjadi kesalahan server: {str(e)}"}), 500


# ==============================================================================
# 5. MENJALANKAN SERVER
# ==============================================================================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
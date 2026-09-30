import os
import joblib
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# ==============================================================================
# 1. MEMUAT MODEL (Adaptif terhadap format Dictionary maupun List)
# ==============================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'maintenance_classifier.pkl')

# 6 Fitur wajib sesuai dokumen serah tugas ML Engineer 1
REQUIRED_FEATURES = [
    "temperature",
    "vibration",
    "humidity",
    "pressure",
    "energy_consumption",
    "predicted_remaining_life"
]

try:
    package = joblib.load(MODEL_PATH)
    
    # Deteksi otomatis apakah model disimpan sebagai Dict, List, atau objek langsung
    if isinstance(package, dict):
        model = package.get("model", package)
        if "features" in package:
            REQUIRED_FEATURES = package["features"]
    elif isinstance(package, (list, tuple)):
        # Jika disimpan sebagai list, elemen pertama adalah objek model
        model = package[0]
        if len(package) > 1 and isinstance(package[1], list):
            REQUIRED_FEATURES = package[1]
    else:
        model = package

    print("[BERHASIL] Model maintenance_classifier.pkl berhasil dimuat ke memori.")
    print(f"[INFO] Fitur input yang digunakan: {REQUIRED_FEATURES}")
except Exception as e:
    print(f"[GAGAL] Error saat memuat file model: {e}")

# ==============================================================================
# 2. ROUTE HALAMAN UTAMA
# ==============================================================================
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

# ==============================================================================
# 3. ROUTE PREDIKSI (/predict)
# ==============================================================================
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data_masuk = request.get_json() if request.is_json else request.form

        # Validasi 1: Pastikan seluruh 6 parameter sensor terisi
        for kolom in REQUIRED_FEATURES:
            if kolom not in data_masuk or data_masuk[kolom] == '':
                return jsonify({"error": f"Missing required field: {kolom}"}), 400

        # Validasi 2: Pastikan seluruh input adalah angka numerik
        try:
            temp = float(data_masuk["temperature"])
            vib = float(data_masuk["vibration"])
            hum = float(data_masuk["humidity"])
            press = float(data_masuk["pressure"])
            energy = float(data_masuk["energy_consumption"])
            rem_life = float(data_masuk["predicted_remaining_life"])
        except ValueError:
            return jsonify({"error": "Semua parameter sensor harus berupa angka (numeric)!"}), 400

        # Susun array 2D sesuai urutan yang dibutuhkan model
        array_input = [[temp, vib, hum, press, energy, rem_life]]

        # Jalankan prediksi
        prediction = int(model.predict(array_input)[0])
        probability = model.predict_proba(array_input)[0]

        # Pemetaan status (0 = No Maintenance, 1 = Maintenance Required)
        status_teks = "Maintenance Required" if prediction == 1 else "No Maintenance Required"
        prob_no_maint = round(float(probability[0]), 4)
        prob_maint = round(float(probability[1]), 4)

        # Output JSON (jika dipanggil via API/cURL)
        if request.is_json:
            return jsonify({
                "prediction": prediction,
                "status": status_teks,
                "probability": {
                    "no_maintenance": prob_no_maint,
                    "maintenance": prob_maint
                }
            }), 200

        # Output Web (jika dipanggil via browser form HTML)
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
            prob_maintenance=round(prob_maint * 100, 2)
        )

    except Exception as e:
        return jsonify({"error": f"Terjadi kesalahan server: {str(e)}"}), 500

# ==============================================================================
# 4. MENYALAKAN SERVER
# ==============================================================================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
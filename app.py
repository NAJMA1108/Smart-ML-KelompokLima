import os
import joblib

from flask import Flask, render_template, request, jsonify


app = Flask(__name__)

# ==============================================================================
# BASE DIRECTORY
# ==============================================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# ==============================================================================
# 1. MEMUAT MODEL ML ENGINEER 1 - CLASSIFICATION
# ==============================================================================

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "maintenance_classifier.pkl"
)

# 6 fitur wajib ML Engineer 1
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

    # Deteksi format model: dictionary, list/tuple, atau objek langsung
    if isinstance(package, dict):

        model = package.get("model", package)

        if "features" in package:
            REQUIRED_FEATURES = package["features"]

    elif isinstance(package, (list, tuple)):

        model = package[0]

        if len(package) > 1 and isinstance(package[1], list):
            REQUIRED_FEATURES = package[1]

    else:

        model = package

    print("[BERHASIL] Model maintenance_classifier.pkl berhasil dimuat.")
    print(f"[INFO] Fitur ML1: {REQUIRED_FEATURES}")

except Exception as e:

    print(f"[GAGAL] Error saat memuat model ML1: {e}")
    model = None


# ==============================================================================
# 2. MEMUAT MODEL ML ENGINEER 2 - CLUSTERING
# ==============================================================================

SCALER_PATH = os.path.join(
    BASE_DIR,
    "models",
    "scaler_clustering.pkl"
)

CLUSTER_MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "model_clustering.pkl"
)

# 5 fitur yang digunakan ML Engineer 2
CLUSTER_FEATURES = [
    "temperature",
    "vibration",
    "humidity",
    "pressure",
    "energy_consumption"
]

try:

    scaler = joblib.load(SCALER_PATH)
    cluster_model = joblib.load(CLUSTER_MODEL_PATH)

    print("[BERHASIL] Scaler clustering berhasil dimuat.")
    print("[BERHASIL] Model clustering berhasil dimuat.")
    print(f"[INFO] Fitur ML2: {CLUSTER_FEATURES}")
    print(f"[INFO] Jumlah cluster: {cluster_model.n_clusters}")

except Exception as e:

    print(f"[GAGAL] Error saat memuat model ML2: {e}")

    scaler = None
    cluster_model = None


# ==============================================================================
# 3. ROUTE HALAMAN UTAMA
# ==============================================================================

@app.route("/", methods=["GET"])
def index():

    return render_template("index.html")


# ==============================================================================
# 4. ROUTE PREDIKSI ML1 - CLASSIFICATION
# ==============================================================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # Pastikan model ML1 tersedia
        if model is None:

            return jsonify({
                "error": "Model classification belum berhasil dimuat."
            }), 500

        # Ambil data dari JSON atau form
        data_masuk = (
            request.get_json()
            if request.is_json
            else request.form
        )

        # ----------------------------------------------------------------------
        # Validasi field
        # ----------------------------------------------------------------------

        for kolom in REQUIRED_FEATURES:

            if kolom not in data_masuk or data_masuk[kolom] == "":

                return jsonify({
                    "error": f"Missing required field: {kolom}"
                }), 400

        # ----------------------------------------------------------------------
        # Konversi input menjadi angka
        # ----------------------------------------------------------------------

        try:

            temp = float(data_masuk["temperature"])
            vib = float(data_masuk["vibration"])
            hum = float(data_masuk["humidity"])
            press = float(data_masuk["pressure"])
            energy = float(data_masuk["energy_consumption"])
            rem_life = float(
                data_masuk["predicted_remaining_life"]
            )

        except (ValueError, TypeError):

            return jsonify({
                "error": "Semua parameter sensor harus berupa angka."
            }), 400

        # ----------------------------------------------------------------------
        # Susun input sesuai urutan ML1
        # ----------------------------------------------------------------------

        array_input = [[
            temp,
            vib,
            hum,
            press,
            energy,
            rem_life
        ]]

        # ----------------------------------------------------------------------
        # Prediksi
        # ----------------------------------------------------------------------

        prediction = int(
            model.predict(array_input)[0]
        )

        # Probability
        probability = model.predict_proba(array_input)[0]

        # ----------------------------------------------------------------------
        # Pemetaan hasil
        # ----------------------------------------------------------------------

        status_teks = (
            "Maintenance Required"
            if prediction == 1
            else "No Maintenance Required"
        )

        prob_no_maint = round(
            float(probability[0]),
            4
        )

        prob_maint = round(
            float(probability[1]),
            4
        )

        # ----------------------------------------------------------------------
        # Jika request berasal dari API / JavaScript
        # ----------------------------------------------------------------------

        if request.is_json:

            return jsonify({

                "prediction": prediction,

                "status": status_teks,

                "probability": {

                    "no_maintenance": prob_no_maint,

                    "maintenance": prob_maint
                }

            }), 200

        # ----------------------------------------------------------------------
        # Jika request berasal dari form HTML
        # ----------------------------------------------------------------------

        return render_template(

            "predict.html",

            temperature=temp,
            vibration=vib,
            humidity=hum,
            pressure=press,
            energy_consumption=energy,
            predicted_remaining_life=rem_life,

            prediction=prediction,

            status=status_teks,

            prob_no_maintenance=round(
                prob_no_maint * 100,
                2
            ),

            prob_maintenance=round(
                prob_maint * 100,
                2
            )
        )

    except Exception as e:

        return jsonify({
            "error": f"Terjadi kesalahan server: {str(e)}"
        }), 500


# ==============================================================================
# 5. ROUTE CLUSTERING ML2
# ==============================================================================

@app.route("/cluster", methods=["POST"])
def cluster():

    try:

        # ----------------------------------------------------------------------
        # Pastikan model tersedia
        # ----------------------------------------------------------------------

        if scaler is None or cluster_model is None:

            return jsonify({
                "error": "Model clustering belum berhasil dimuat."
            }), 500

        # ----------------------------------------------------------------------
        # Ambil JSON
        # ----------------------------------------------------------------------

        data_masuk = request.get_json()

        if not data_masuk:

            return jsonify({
                "error": "Request body harus berupa JSON."
            }), 400

        # ----------------------------------------------------------------------
        # Validasi 5 fitur
        # ----------------------------------------------------------------------

        for kolom in CLUSTER_FEATURES:

            if kolom not in data_masuk or data_masuk[kolom] == "":

                return jsonify({
                    "error": f"Missing required field: {kolom}"
                }), 400

        # ----------------------------------------------------------------------
        # Konversi input menjadi angka
        # ----------------------------------------------------------------------

        try:

            temperature = float(
                data_masuk["temperature"]
            )

            vibration = float(
                data_masuk["vibration"]
            )

            humidity = float(
                data_masuk["humidity"]
            )

            pressure = float(
                data_masuk["pressure"]
            )

            energy = float(
                data_masuk["energy_consumption"]
            )

        except (ValueError, TypeError):

            return jsonify({
                "error": "Semua parameter clustering harus berupa angka."
            }), 400

        # ----------------------------------------------------------------------
        # Susun input sesuai urutan ML2
        # ----------------------------------------------------------------------

        array_input = [[

            temperature,

            vibration,

            humidity,

            pressure,

            energy

        ]]

        # ----------------------------------------------------------------------
        # Standardisasi menggunakan scaler ML2
        # ----------------------------------------------------------------------

        scaled_input = scaler.transform(
            array_input
        )

        # ----------------------------------------------------------------------
        # Prediksi cluster
        # ----------------------------------------------------------------------

        cluster_prediction = int(
            cluster_model.predict(
                scaled_input
            )[0]
        )

        # ----------------------------------------------------------------------
        # Response
        # ----------------------------------------------------------------------

        return jsonify({

            "cluster": cluster_prediction,

            "status": f"Cluster {cluster_prediction}"

        }), 200

    except Exception as e:

        return jsonify({

            "error": (
                "Terjadi kesalahan saat clustering: "
                f"{str(e)}"
            )

        }), 500


# ==============================================================================
# 6. MENJALANKAN SERVER
# ==============================================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )
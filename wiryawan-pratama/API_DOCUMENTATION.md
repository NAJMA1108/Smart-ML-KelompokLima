# ML API Documentation

## Maintenance Prediction

Dokumentasi ini menjelaskan integrasi model **Random Forest Classifier** untuk memprediksi apakah sebuah mesin membutuhkan maintenance.

Model merupakan hasil pekerjaan **ML Engineer 1 - Supervised Machine Learning**.

---

## 1. Model Information

### Model

```text
Random Forest Classifier
```

### Target

```text
maintenance_required
```

### Output Prediction

| Nilai | Status                  |
| ----- | ----------------------- |
| 0     | No Maintenance Required |
| 1     | Maintenance Required    |

### File Model

```text
models/maintenance_classifier.pkl
```

---

## 2. Model Input

Model membutuhkan 6 feature berikut:

| No  | Parameter                | Tipe Data | Keterangan               |
| --- | ------------------------ | --------- | ------------------------ |
| 1   | temperature              | float     | Temperatur mesin         |
| 2   | vibration                | float     | Tingkat getaran mesin    |
| 3   | humidity                 | float     | Kelembapan               |
| 4   | pressure                 | float     | Tekanan                  |
| 5   | energy_consumption       | float     | Konsumsi energi          |
| 6   | predicted_remaining_life | float     | Prediksi sisa umur mesin |

### Feature Order

Urutan feature yang digunakan model adalah:

1. `temperature`
2. `vibration`
3. `humidity`
4. `pressure`
5. `energy_consumption`
6. `predicted_remaining_life`

Backend harus memastikan urutan feature tersebut tetap sama ketika melakukan prediction.

---

## 3. Loading Model

File `.pkl` berisi package yang terdiri dari model dan daftar feature.

Backend harus melakukan loading seperti berikut:

```python
import joblib

package = joblib.load("models/maintenance_classifier.pkl")

model = package["model"]
features = package["features"]
```

Jangan melakukan:

```python
model = joblib.load("models/maintenance_classifier.pkl")
```

lalu langsung menggunakan:

```python
model.predict(...)
```

karena file `.pkl` berisi package/dictionary, bukan langsung object classifier.

---

## 4. Recommended API Endpoint

Endpoint yang direkomendasikan:

```text
POST /predict
```

Endpoint digunakan untuk menerima data sensor dan menghasilkan prediksi kebutuhan maintenance.

---

## 5. Request Body

Format request menggunakan JSON.

### Example Request

```json
{
  "temperature": 75.2,
  "vibration": 4.8,
  "humidity": 62.1,
  "pressure": 101.3,
  "energy_consumption": 68.5,
  "predicted_remaining_life": 120
}
```

### Request Parameters

| Parameter                  | Contoh | Keterangan               |
| -------------------------- | -----: | ------------------------ |
| `temperature`              |   75.2 | Temperatur mesin         |
| `vibration`                |    4.8 | Tingkat getaran          |
| `humidity`                 |   62.1 | Kelembapan               |
| `pressure`                 |  101.3 | Tekanan                  |
| `energy_consumption`       |   68.5 | Konsumsi energi          |
| `predicted_remaining_life` |    120 | Prediksi sisa umur mesin |

---

## 6. Prediction Process

Backend dapat melakukan prediction dengan menggunakan feature sesuai urutan model.

```python
input_data = [[
    data["temperature"],
    data["vibration"],
    data["humidity"],
    data["pressure"],
    data["energy_consumption"],
    data["predicted_remaining_life"]
]]

prediction = model.predict(input_data)
probability = model.predict_proba(input_data)
```

Nilai prediction dapat diambil dari hasil:

```python
prediction[0]
```

Probability dapat diambil dari:

```python
probability[0]
```

---

## 7. Prediction Result

Mapping hasil prediction:

```text
0 → No Maintenance Required
1 → Maintenance Required
```

Contoh implementasi:

```python
if prediction[0] == 1:
    status = "Maintenance Required"
else:
    status = "No Maintenance Required"
```

---

## 8. Probability

Model juga dapat menghasilkan probability menggunakan:

```python
model.predict_proba(input_data)
```

Probability terdiri dari probability untuk masing-masing class.

Contoh hasil:

```text
No Maintenance Required : 82.67%
Maintenance Required     : 17.33%
```

### Example Response JSON

```json
{
  "prediction": 0,
  "status": "No Maintenance Required",
  "probability": {
    "no_maintenance": 0.8267,
    "maintenance": 0.1733
  }
}
```

---

## 9. Example API Response

### No Maintenance Required

Contoh response ketika model menghasilkan prediction `0`:

```json
{
  "prediction": 0,
  "status": "No Maintenance Required",
  "probability": {
    "no_maintenance": 0.8267,
    "maintenance": 0.1733
  }
}
```

### Maintenance Required

Contoh response ketika model menghasilkan prediction `1`:

```json
{
  "prediction": 1,
  "status": "Maintenance Required",
  "probability": {
    "no_maintenance": 0.2,
    "maintenance": 0.8
  }
}
```

Nilai probability pada response harus berasal dari hasil `predict_proba()` model.

---

## 10. Input Validation

Backend sebaiknya melakukan validasi sebelum data dikirim ke model.

Field yang wajib tersedia:

```text
temperature
vibration
humidity
pressure
energy_consumption
predicted_remaining_life
```

Semua field tersebut harus berupa nilai numerik.

Jika terdapat field yang tidak tersedia atau memiliki format yang tidak sesuai, API sebaiknya mengembalikan response error.

### Example Error Response

```json
{
  "error": "Invalid input"
}
```

---

## 11. Data Leakage

`maintenance_required` merupakan target model dan tidak boleh digunakan sebagai input prediction.

Input model hanya terdiri dari:

```text
temperature
vibration
humidity
pressure
energy_consumption
predicted_remaining_life
```

Feature lain yang berpotensi menyebabkan data leakage juga tidak digunakan sebagai input model.

---

## 12. Integration Flow

Alur integrasi model dengan backend:

```text
Sensor Data
     |
     v
Backend API
     |
     v
Input Validation
     |
     v
Prepare Model Input
     |
     v
Random Forest Classifier
     |
     v
Prediction + Probability
     |
     v
JSON Response
```

---

## 13. Example Python Integration

Contoh sederhana integrasi model:

```python
import joblib

# Load model package
package = joblib.load("models/maintenance_classifier.pkl")

model = package["model"]
features = package["features"]


def predict_maintenance(data):

    input_data = [[
        data["temperature"],
        data["vibration"],
        data["humidity"],
        data["pressure"],
        data["energy_consumption"],
        data["predicted_remaining_life"]
    ]]

    prediction = model.predict(input_data)[0]
    probability = model.predict_proba(input_data)[0]

    if prediction == 1:
        status = "Maintenance Required"
    else:
        status = "No Maintenance Required"

    return {
        "prediction": int(prediction),
        "status": status,
        "probability": {
            "no_maintenance": float(probability[0]),
            "maintenance": float(probability[1])
        }
    }
```

---

## 14. Example Usage

Contoh input:

```python
data = {
    "temperature": 75.2,
    "vibration": 4.8,
    "humidity": 62.1,
    "pressure": 101.3,
    "energy_consumption": 68.5,
    "predicted_remaining_life": 120
}

result = predict_maintenance(data)

print(result)
```

Contoh hasil:

```json
{
  "prediction": 0,
  "status": "No Maintenance Required",
  "probability": {
    "no_maintenance": 0.8267,
    "maintenance": 0.1733
  }
}
```

---

## 15. Model Performance

Hasil evaluasi model yang telah dilakukan:

| Metric    |  Score |
| --------- | -----: |
| Accuracy  | 90.90% |
| Precision | 98.21% |
| Recall    | 55.16% |
| F1-Score  | 70.65% |
| ROC-AUC   | 78.11% |
| PR-AUC    | 70.55% |

### Confusion Matrix

```text
                 Predicted
                 0       1
Actual 0       1599      4
Actual 1        178    219
```

Metric tersebut merupakan hasil evaluasi pada data evaluasi yang digunakan saat proses pengembangan model.

---

## 16. Related Files

### Model

```text
models/maintenance_classifier.pkl
```

### Notebook Training dan Evaluasi

```text
notebooks/model_supervised_ML_Engineer_1.ipynb
```

### README Project

```text
README.md
```

---

## Summary

Model **Random Forest Classifier** digunakan untuk memprediksi apakah sebuah mesin membutuhkan maintenance berdasarkan enam parameter input, yaitu `temperature`, `vibration`, `humidity`, `pressure`, `energy_consumption`, dan `predicted_remaining_life`.

Backend harus melakukan validasi input, memuat package model dengan benar, menjaga urutan feature sesuai dengan model, kemudian menjalankan `predict()` dan `predict_proba()` untuk menghasilkan prediction, status maintenance, dan probability.

Endpoint yang direkomendasikan untuk integrasi adalah:

```text
POST /predict
```

Response API menggunakan format JSON dan menghasilkan status `No Maintenance Required` atau `Maintenance Required` berdasarkan hasil prediction model.

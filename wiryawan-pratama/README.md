# Wiryawan Pratama

## ML Engineer 1 - Supervised Machine Learning

### Deskripsi

Bagian ini berisi hasil pekerjaan ML Engineer 1 pada proyek Smart Machine Maintenance.

Model yang digunakan adalah **Random Forest Classifier** untuk memprediksi apakah sebuah mesin membutuhkan maintenance berdasarkan data sensor dan prediksi remaining life.

### Model

- **Algoritma:** Random Forest Classifier
- **Target:** `maintenance_required`

Output model:

| Nilai | Keterangan              |
| ----- | ----------------------- |
| `0`   | No Maintenance Required |
| `1`   | Maintenance Required    |

### Input Features

Model menggunakan 6 fitur:

| No  | Feature                    | Keterangan               |
| --- | -------------------------- | ------------------------ |
| 1   | `temperature`              | Temperatur mesin         |
| 2   | `vibration`                | Tingkat getaran mesin    |
| 3   | `humidity`                 | Kelembapan               |
| 4   | `pressure`                 | Tekanan                  |
| 5   | `energy_consumption`       | Konsumsi energi          |
| 6   | `predicted_remaining_life` | Prediksi sisa umur mesin |

Urutan input harus mengikuti urutan feature tersebut.

### File Model

Model tersimpan pada:

```text
models/maintenance_classifier.pkl
```

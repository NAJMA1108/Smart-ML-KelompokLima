import joblib
import numpy as np

SCALER_PATH = r".\models\scaler_clustering.pkl"
MODEL_PATH = r".\models\model_clustering.pkl"

scaler = joblib.load(SCALER_PATH)
model = joblib.load(MODEL_PATH)

print("=" * 60)
print("MODEL")
print("=" * 60)

print("Model          :", type(model).__name__)
print("Jumlah cluster :", model.n_clusters)

print("\nCluster centers:")
print(model.cluster_centers_)

print("\n" + "=" * 60)
print("SCALER")
print("=" * 60)

print("Scaler         :", type(scaler).__name__)
print("Mean           :", scaler.mean_)
print("Scale          :", scaler.scale_)

# ============================================================
# TEST INPUT
# ============================================================

samples = np.array([
    [78.2, 1.8, 45, 6.2, 140],
    [30, 0.5, 30, 3, 50],
    [100, 8, 90, 10, 300],
    [50, 3, 60, 5, 150],
    [20, 0.1, 10, 1, 20],
    [120, 10, 100, 15, 500]
])

scaled = scaler.transform(samples)

predictions = model.predict(scaled)

print("\n" + "=" * 60)
print("HASIL PREDIKSI")
print("=" * 60)

for i, (raw, scaled_row, prediction) in enumerate(
    zip(samples, scaled, predictions),
    start=1
):
    print(f"\nSample {i}")
    print("Input   :", raw)
    print("Scaled  :", np.round(scaled_row, 4))
    print("Cluster :", prediction)

# ============================================================
# JARAK KE SETIAP CENTROID
# ============================================================

print("\n" + "=" * 60)
print("JARAK KE CENTROID")
print("=" * 60)

centers = model.cluster_centers_

for i, scaled_row in enumerate(scaled, start=1):

    distances = np.linalg.norm(
        centers - scaled_row,
        axis=1
    )

    print(f"\nSample {i}")
    print("Distance ke Cluster 0:", round(distances[0], 4))
    print("Distance ke Cluster 1:", round(distances[1], 4))
    print("Distance ke Cluster 2:", round(distances[2], 4))
    print("Cluster terdekat     :", np.argmin(distances))
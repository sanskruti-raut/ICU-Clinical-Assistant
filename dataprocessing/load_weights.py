import os
import io
import boto3
import joblib
import numpy as np
import psycopg2

# ─── 0) Read connection info from your env vars ─────────────────────────────────
S3_BUCKET = "vital-databucket"
MODEL_KEY = "sepsis_model.pkl"   # uploaded at the root of that bucket

DB_HOST = os.environ["PGHOST"]
DB_NAME = os.environ["PGDATABASE"]
DB_USER = os.environ["PGUSER"]
DB_PASS = os.environ["PGPASSWORD"]
DB_PORT = int(os.environ.get("PGPORT", 5432))

# ─── 1) Download the model from S3 ───────────────────────────────────────────────
s3 = boto3.client("s3")
buf = io.BytesIO()
s3.download_fileobj(S3_BUCKET, MODEL_KEY, buf)
buf.seek(0)
pipeline = joblib.load(buf)

# ─── 2) Extract raw‐feature weights ───────────────────────────────────────────────
scaler = pipeline.named_steps["scaler"]
clf    = pipeline.named_steps["clf"]

feat_names      = scaler.feature_names_in_
means, scales   = scaler.mean_, scaler.scale_
coefs_scaled    = clf.coef_[0]
intercept_scaled= clf.intercept_[0]

# undo scaling to get raw‐space coefficients
coefs_raw     = coefs_scaled / scales
intercept_raw = intercept_scaled - np.sum(coefs_scaled * (means / scales))

# ─── 3) Connect to your Postgres RDS and upsert weights ─────────────────────────
conn = psycopg2.connect(
    host=DB_HOST, port=DB_PORT,
    dbname=DB_NAME, user=DB_USER, password=DB_PASS
)
cur = conn.cursor()

# create the weights table if it doesn’t exist
cur.execute("""
CREATE TABLE IF NOT EXISTS lr_weights (
    feature TEXT PRIMARY KEY,
    weight  DOUBLE PRECISION NOT NULL
);
""")
conn.commit()

# upsert intercept
cur.execute("""
INSERT INTO lr_weights(feature, weight)
VALUES (%s, %s)
ON CONFLICT (feature) DO UPDATE
  SET weight = EXCLUDED.weight;
""", ("intercept", float(intercept_raw)))
conn.commit()

# upsert each feature weight
for feat, w in zip(feat_names, coefs_raw):
    cur.execute("""
    INSERT INTO lr_weights(feature, weight)
    VALUES (%s, %s)
    ON CONFLICT (feature) DO UPDATE
      SET weight = EXCLUDED.weight;
    """, (feat, float(w)))

conn.commit()
cur.close()
conn.close()

print("raw weights loaded ffrom s3")

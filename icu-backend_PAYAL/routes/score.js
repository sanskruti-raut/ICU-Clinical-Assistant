const express = require('express');
const pool = require('../db');

const router = express.Router();

// Logistic function for risk score
function logistic(z) {
  return 1 / (1 + Math.exp(-z));
}

// Global weight object
let weights = {};

// Load all logistic regression weights into memory with timeout and error handling
async function loadWeights() {
  try {
    console.log("Starting to load weights...");
    
    // Set a timeout for the database query
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Weights loading timed out after 10 seconds"));
      }, 10000); // 10 second timeout
    });
    
    // Step 1: Fetch all column names from vitals_features with timeout
    console.log("Fetching column names from vitals_features...");
    let columnResult;
    try {
      columnResult = await Promise.race([
        pool.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'vitals_features'
        `),
        timeoutPromise
      ]);
      console.log("Successfully fetched columns from vitals_features");
    } catch (err) {
      console.error("Error or timeout fetching columns:", err.message);
      // Initialize with empty array and continue
      columnResult = { rows: [] };
    }
    
    const validColumns = columnResult.rows.map(r => r.column_name);
    console.log("Valid columns in vitals_features:", validColumns);

    // Step 2: Fetch all weights from lr_weights with timeout
    console.log("Fetching weights from lr_weights...");
    let weightsResult;
    try {
      weightsResult = await Promise.race([
        pool.query("SELECT feature, weight FROM lr_weights"),
        timeoutPromise
      ]);
      console.log("Successfully fetched weights from lr_weights");
    } catch (err) {
      console.error("Error or timeout fetching weights:", err.message);
      // Initialize with empty result and continue
      weightsResult = { rows: [] };
    }

    weights = {};
    let skipped = 0;
    let loaded = 0;

    weightsResult.rows.forEach(row => {
      if (row.feature === 'intercept' || validColumns.includes(row.feature)) {
        weights[row.feature] = parseFloat(row.weight);
        loaded++;
      } else {
        skipped += 1;
        console.warn(`Skipping unknown feature: ${row.feature}`);
      }
    });

    console.log(`Loaded ${loaded} valid weights (skipped ${skipped})`);
    
    // If no weights were loaded, add a default intercept
    if (Object.keys(weights).length === 0) {
      console.log("No weights loaded, adding default intercept of 0");
      weights.intercept = 0;
    }
    
    return true;
  } catch (err) {
    console.error("Unhandled error loading weights from DB:", err);
    console.log("Continuing with empty weights object");
    // Initialize with default weights to prevent errors
    weights = { intercept: 0 };
    return false;
  }
}

// GET /score/:id - Compute patient risk score
router.get('/score/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    console.warn("Invalid patient ID:", req.params.id);
    return res.status(400).json({ error: "Invalid patient ID" });
  }

  try {
    // Check if weights are loaded
    if (Object.keys(weights).length <= 1) {
      console.warn("No feature weights loaded, returning default risk score");
      return res.json({ subject_id: id, risk_score: 0.5, note: "Using default score" });
    }
    
    const featCols = Object.keys(weights).filter(f => f !== "intercept");
    console.log("Using features:", featCols);

    // Handle empty feature list
    if (featCols.length === 0) {
      console.warn("No features available for risk calculation");
      return res.json({ subject_id: id, risk_score: 0.5, note: "No features available" });
    }

    // Query with timeout
    const queryPromise = pool.query(
      `SELECT ${featCols.join(", ")} FROM vitals_features WHERE subject_id = $1`, 
      [id]
    );
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Database query timed out after 5 seconds"));
      }, 5000);
    });
    
    const { rows } = await Promise.race([queryPromise, timeoutPromise]);

    if (rows.length === 0) {
      console.warn("No data found for patient ID", id);
      return res.status(404).json({ error: "Patient not found" });
    }

    const features = rows[0];

    let z = weights["intercept"] || 0;
    featCols.forEach(f => {
      const val = features[f] == null ? 0 : parseFloat(features[f]);
      z += weights[f] * val;
    });

    const risk_score = logistic(z);
    console.log("Computed risk score for subject", id, ":", risk_score);

    res.json({ subject_id: id, risk_score });
  } catch (err) {
    console.error("Error in /score/:id:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET /dashboard - Show top 5 and next 3 simulated patients
router.get('/dashboard', async (req, res) => {
  try {
    // Top 5 patients with highest risk scores
    const top5QueryPromise = pool.query(`
      SELECT id, risk_score
      FROM priority_patients
      ORDER BY risk_score DESC
      LIMIT 5
    `);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Query timed out after 5 seconds"));
      }, 5000);
    });
    
    let top5;
    try {
      top5 = await Promise.race([top5QueryPromise, timeoutPromise]);
      console.log("Top 5 priority patients:", top5.rows);
    } catch (err) {
      console.error("Error or timeout fetching top 5 patients:", err.message);
      top5 = { rows: [] };
    }

    // Next 3 patients by descending risk score, offset by 5
    let next3;
    try {
      next3 = await Promise.race([
        pool.query(`
          SELECT id
          FROM priority_patients
          ORDER BY risk_score DESC
          OFFSET 5 LIMIT 3
        `),
        timeoutPromise
      ]);
      console.log("Next 3 simulated patients:", next3.rows);
    } catch (err) {
      console.error("Error or timeout fetching next 3 patients:", err.message);
      next3 = { rows: [] };
    }

    // Dynamically calculate scores for the next 3
    const scores3Promise = Promise.all(next3.rows.map(async (r) => {
      try {
        if (Object.keys(weights).length <= 1) {
          return { subject_id: r.id, risk_score: 0.5, note: "Using default score" };
        }
        
        const featCols = Object.keys(weights).filter(f => f !== "intercept");
        if (featCols.length === 0) {
          return { subject_id: r.id, risk_score: 0.5, note: "No features available" };
        }
        
        const queryPromise = pool.query(
          `SELECT ${featCols.join(", ")} FROM vitals_features WHERE subject_id = $1`, 
          [r.id]
        );
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Query for subject ${r.id} timed out after 3 seconds`));
          }, 3000);
        });
        
        const { rows } = await Promise.race([queryPromise, timeoutPromise]);

        if (!rows.length) {
          console.warn("Missing vitals for subject", r.id);
          return { subject_id: r.id, error: "Vitals not found" };
        }

        const feats = rows[0];
        let z = weights["intercept"] || 0;
        featCols.forEach(f => {
          const v = feats[f] == null ? 0 : parseFloat(feats[f]);
          z += weights[f] * v;
        });

        const risk_score = logistic(z);
        console.log("Live risk score for subject", r.id, ":", risk_score);
        return { subject_id: r.id, risk_score };
      } catch (err) {
        console.error(`Error calculating score for subject ${r.id}:`, err.message);
        return { subject_id: r.id, error: err.message };
      }
    }));
    
    // Set a global timeout for all score calculations
    const scores3TimeoutPromise = new Promise(resolve => {
      setTimeout(() => {
        console.warn("Score calculations timed out, returning partial results");
        resolve([]);
      }, 8000);
    });
    
    const scores3 = await Promise.race([scores3Promise, scores3TimeoutPromise]);

    res.json({
      top5: top5.rows,
      simulated_arrivals: scores3
    });
  } catch (err) {
    console.error("Error in /dashboard:", err);
    res.status(500).json({ 
      error: "Server error", 
      details: err.message,
      top5: [],
      simulated_arrivals: []
    });
  }
});

module.exports = {
  scoreRouter: router,
  loadWeights
};

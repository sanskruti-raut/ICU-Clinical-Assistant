const express = require('express');
const router = express.Router();
const pool = require('../db');
const { calculateSepsisRisk } = require('./score');

// Keep a cache of sepsis alerts to avoid recalculating too frequently
let sepsisAlertsCache = [];
let lastUpdateTime = 0;
const CACHE_TTL = 20000; // 20 seconds cache TTL

// Define thresholds for sepsis risk alerts
const HIGH_RISK_THRESHOLD = 0.6;  // 60% and above is high risk
const MEDIUM_RISK_THRESHOLD = 0.4; // 40% and above is medium risk

// GET /sepsis-alerts - Get all patients with significant sepsis risk
router.get('/sepsis-alerts', async (req, res) => {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (now - lastUpdateTime < CACHE_TTL) {
      console.log("Using cached sepsis alerts");
      return res.json(sepsisAlertsCache);
    }

    console.log("Calculating fresh sepsis alerts...");
    
    // Get all priority patients
    const patientsResult = await pool.query(`
      SELECT id FROM priority_patients 
      ORDER BY risk_score DESC
    `);

    // Calculate sepsis risk for each patient
    const alerts = [];
    for (const row of patientsResult.rows) {
      try {
        const subjectId = row.id;
        const score = await calculateSepsisRisk(subjectId);
        
        // Only include patients with significant risk
        if (score && score.risk_score >= MEDIUM_RISK_THRESHOLD) {
          alerts.push({
            subject_id: subjectId,
            risk_score: score.risk_score,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error(`Error calculating sepsis risk for patient ${row.id}:`, err);
      }
    }

    // Sort by risk score, highest first
    alerts.sort((a, b) => b.risk_score - a.risk_score);
    
    // Take only top 5 alerts to avoid overwhelming the UI
    const topAlerts = alerts.slice(0, 5);
    
    // Update cache
    sepsisAlertsCache = topAlerts;
    lastUpdateTime = now;
    
    res.json(topAlerts);
  } catch (err) {
    console.error("Error in /sepsis-alerts:", err);
    res.status(500).json({ 
      error: "Server error", 
      details: err.message 
    });
  }
});

// AWS SNS notification for high-risk sepsis alerts
async function notifySepsisRisk(patientId, riskScore) {
  // This is a placeholder - you mentioned you'd handle the AWS SNS integration
  console.log(`[SNS NOTIFICATION] High sepsis risk for patient ${patientId}: ${riskScore}`);
}

module.exports = router;

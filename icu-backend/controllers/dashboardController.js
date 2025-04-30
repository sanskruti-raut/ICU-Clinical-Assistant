// const { stats } = require('../data/dashboardData');

// const getDashboardStats = (req, res) => {
//   res.json(stats);
// };

// module.exports = {
//   getDashboardStats
// };
// icu-backend/controllers/dashboardController.js
const db = require('../db');

const getDashboardStats = async (req, res) => {
  try {
    // Query to get high risk patient percentage
    const highRiskQuery = `
      WITH patient_risks AS (
        SELECT 
          p.subject_id,
          CASE 
            WHEN hr.valuenum > 120 OR sbp.valuenum < 90 OR rr.valuenum > 25 THEN 'high'
            ELSE 'normal'
          END as risk_level
        FROM mimiciv.patients p
        JOIN mimiciv.icustays i ON p.subject_id = i.subject_id
        LEFT JOIN (
          SELECT subject_id, valuenum FROM mimiciv.chartevents 
          WHERE itemid = 220045  -- Heart Rate
          ORDER BY charttime DESC
          LIMIT 1
        ) hr ON p.subject_id = hr.subject_id
        LEFT JOIN (
          SELECT subject_id, valuenum FROM mimiciv.chartevents 
          WHERE itemid = 220050  -- Systolic BP
          ORDER BY charttime DESC
          LIMIT 1
        ) sbp ON p.subject_id = sbp.subject_id
        LEFT JOIN (
          SELECT subject_id, valuenum FROM mimiciv.chartevents 
          WHERE itemid = 220210  -- Respiratory Rate
          ORDER BY charttime DESC
          LIMIT 1
        ) rr ON p.subject_id = rr.subject_id
        WHERE i.outtime IS NULL
      )
      SELECT 
        ROUND(100.0 * COUNT(CASE WHEN risk_level = 'high' THEN 1 END) / COUNT(*)) as "highRiskPercentage"
      FROM patient_risks;
    `;
    
    // Query to get most common treatments
    const treatmentsQuery = `
      SELECT 
        drug as name,
        COUNT(*) as count
      FROM mimiciv.prescriptions
      GROUP BY drug
      ORDER BY count DESC
      LIMIT 2;
    `;
    
    // Query to get average ICU stay duration
    const avgStayQuery = `
      SELECT 
        ROUND(AVG(EXTRACT(EPOCH FROM (outtime - intime)) / 86400), 1) || ' days' as "avgICUStay"
      FROM mimiciv.icustays
      WHERE outtime IS NOT NULL;
    `;
    
    // Query to get alert frequency trend (last 3 hours)
    const alertTrendQuery = `
      WITH time_buckets AS (
        SELECT generate_series(
          date_trunc('hour', NOW() - interval '3 hours'),
          date_trunc('hour', NOW()),
          interval '1 hour'
        ) as time
      ),
      alert_counts AS (
        SELECT 
          date_trunc('hour', charttime) as hour,
          COUNT(*) as count
        FROM mimiciv.chartevents
        WHERE (
          (itemid = 220045 AND (valuenum > 120 OR valuenum < 50)) OR  -- Heart Rate alerts
          (itemid = 220050 AND valuenum < 90) OR                       -- BP alerts
          (itemid = 220210 AND valuenum > 25)                          -- Respiratory Rate alerts
        )
        AND charttime > NOW() - interval '3 hours'
        GROUP BY hour
      )
      SELECT 
        to_char(tb.time, 'HH24:00') as time,
        COALESCE(ac.count, 0) as count
      FROM time_buckets tb
      LEFT JOIN alert_counts ac ON tb.time = ac.hour
      ORDER BY tb.time;
    `;
    
    // Execute all queries in parallel
    const [highRiskResult, treatmentsResult, avgStayResult, alertTrendResult] = await Promise.all([
      db.query(highRiskQuery),
      db.query(treatmentsQuery),
      db.query(avgStayQuery),
      db.query(alertTrendQuery)
    ]);
    
    // Combine results into a single response
    const stats = {
      highRiskPercentage: parseInt(highRiskResult.rows[0].highRiskPercentage) || 0,
      mostCommonTreatments: treatmentsResult.rows.map(row => row.name),
      avgICUStay: avgStayResult.rows[0].avgICUStay || '0 days',
      alertFrequencyTrend: alertTrendResult.rows
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

module.exports = {
  getDashboardStats
};
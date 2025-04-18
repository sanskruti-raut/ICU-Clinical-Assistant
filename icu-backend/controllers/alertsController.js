// const { alerts } = require('../data/alertsData');

// const getRecentAlerts = (req, res) => {
//   res.json(alerts);
// };

// module.exports = {
//   getRecentAlerts
// };
// icu-backend/controllers/alertsController.js
const db = require('../db');

const getRecentAlerts = async (req, res) => {
  try {
    // Query to get recent alerts based on abnormal vital signs and lab values
    const query = `
      WITH abnormal_vitals AS (
        -- Heart rate alerts (above 120 or below 50)
        SELECT 
          ce.subject_id as "patientId",
          CASE 
            WHEN ce.valuenum > 120 THEN 'HR critical (high)'
            WHEN ce.valuenum < 50 THEN 'HR critical (low)'
          END as "type",
          ce.charttime as "time"
        FROM mimiciv.chartevents ce
        WHERE ce.itemid = 220045  -- Heart Rate
        AND (ce.valuenum > 120 OR ce.valuenum < 50)
        
        UNION ALL
        
        -- Blood pressure alerts (below 90 systolic)
        SELECT 
          ce.subject_id as "patientId",
          'BP Low' as "type",
          ce.charttime as "time"
        FROM mimiciv.chartevents ce
        WHERE ce.itemid = 220050  -- Systolic BP
        AND ce.valuenum < 90
        
        UNION ALL
        
        -- High sepsis risk alerts (based on multiple abnormal values)
        SELECT DISTINCT ON (ce.subject_id)
          ce.subject_id as "patientId",
          'Sepsis risk > 80%' as "type",
          ce.charttime as "time"
        FROM mimiciv.chartevents ce
        JOIN mimiciv.chartevents ce2 ON ce.subject_id = ce2.subject_id
        JOIN mimiciv.chartevents ce3 ON ce.subject_id = ce3.subject_id
        WHERE ce.itemid = 220045 AND ce.valuenum > 100  -- High heart rate
        AND ce2.itemid = 220210 AND ce2.valuenum > 22   -- High respiratory rate
        AND ce3.itemid = 223761 AND ce3.valuenum > 38   -- High temperature
      )
      
      SELECT * FROM abnormal_vitals
      ORDER BY "time" DESC
      LIMIT 20;
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

module.exports = {
  getRecentAlerts
};
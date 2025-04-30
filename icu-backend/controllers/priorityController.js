// const { priorityList } = require('../data/priorityData');

// const getPriorityList = (req, res) => {
//   res.json(priorityList);
// };

// module.exports = {
//   getPriorityList
// };
// icu-backend/controllers/priorityController.js
const db = require('../db');

const getPriorityList = async (req, res) => {
  try {
    const query = `
      WITH patient_risks AS (
        SELECT 
          p.subject_id as "patientId",
          CASE
            WHEN hr.valuenum > 120 OR sbp.valuenum < 90 OR temp.valuenum > 38.5 THEN
              CASE
                WHEN (hr.valuenum > 130 OR sbp.valuenum < 80 OR temp.valuenum > 39) THEN 91
                WHEN (hr.valuenum > 120 OR sbp.valuenum < 90 OR temp.valuenum > 38.5) THEN 86
                ELSE 75
              END
            ELSE 65
          END as "riskScore"
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
          WHERE itemid = 223761  -- Temperature
          ORDER BY charttime DESC
          LIMIT 1
        ) temp ON p.subject_id = temp.subject_id
        WHERE i.outtime IS NULL
      ),
      unacknowledged_alerts AS (
        SELECT 
          ce.subject_id as "patientId",
          COUNT(*) as "unacknowledgedAlerts"
        FROM mimiciv.chartevents ce
        WHERE (
          (ce.itemid = 220045 AND (ce.valuenum > 120 OR ce.valuenum < 50)) OR  -- Heart Rate alerts
          (ce.itemid = 220050 AND ce.valuenum < 90) OR                         -- BP alerts
          (ce.itemid = 220210 AND ce.valuenum > 25)                            -- Respiratory Rate alerts
        )
        AND ce.charttime > NOW() - interval '24 hours'
        GROUP BY ce.subject_id
      ),
      critical_labs AS (
        SELECT 
          le.subject_id as "patientId",
          ARRAY_AGG(
            CASE
              WHEN le.itemid = 51265 AND le.valuenum < 100 THEN 'Platelets low'
              WHEN le.itemid = 50912 AND le.valuenum > 1.5 THEN 'Creatinine high'
              WHEN le.itemid = 50883 AND le.valuenum > 1.2 THEN 'Bilirubin high'
              WHEN le.itemid = 50813 AND le.valuenum > 2 THEN 'Lactate high'
              ELSE NULL
            END
          ) FILTER (WHERE 
            (le.itemid = 51265 AND le.valuenum < 100) OR
            (le.itemid = 50912 AND le.valuenum > 1.5) OR
            (le.itemid = 50883 AND le.valuenum > 1.2) OR
            (le.itemid = 50813 AND le.valuenum > 2)
          ) as "criticalLabs"
        FROM mimiciv.labevents le
        WHERE le.charttime > NOW() - interval '24 hours'
        AND (
          (le.itemid = 51265 AND le.valuenum < 100) OR  -- Platelets
          (le.itemid = 50912 AND le.valuenum > 1.5) OR  -- Creatinine
          (le.itemid = 50883 AND le.valuenum > 1.2) OR  -- Bilirubin
          (le.itemid = 50813 AND le.valuenum > 2)       -- Lactate
        )
        GROUP BY le.subject_id
      )
      
      SELECT 
        pr."patientId",
        pr."riskScore",
        COALESCE(ua."unacknowledgedAlerts", 0) as "unacknowledgedAlerts",
        COALESCE(cl."criticalLabs", ARRAY[]::text[]) as "criticalLabs"
      FROM patient_risks pr
      LEFT JOIN unacknowledged_alerts ua ON pr."patientId" = ua."patientId"
      LEFT JOIN critical_labs cl ON pr."patientId" = cl."patientId"
      WHERE pr."riskScore" >= 70
      ORDER BY pr."riskScore" DESC, ua."unacknowledgedAlerts" DESC
      LIMIT 10;
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching priority patients:', error);
    res.status(500).json({ error: 'Failed to fetch priority patients' });
  }
};

module.exports = {
  getPriorityList
};
// const { patients } = require('../data/patientsData');

// const getPatientsOverview = (req, res) => {
//   res.json(patients);
// };

// module.exports = {
//   getPatientsOverview
// };
// icu-backend/controllers/patientsController.js
const db = require('../db');

const getPatientsOverview = async (req, res) => {
  try {
    // Query to get patient data from MIMIC database
    const query = `
      SELECT 
        p.subject_id as "patientId",
        'Anon-' || p.subject_id as "name",
        d.long_title as "diagnosis",
        'ICU-' || i.stay_id as "room",
        CASE 
          WHEN vs.valuenum > 100 OR v2.valuenum < 90 THEN 85
          WHEN vs.valuenum > 90 OR v2.valuenum < 100 THEN 75
          ELSE 45
        END as "sepsisScore",
        vs.charttime as "lastUpdate"
      FROM mimiciv.patients p
      JOIN mimiciv.icustays i ON p.subject_id = i.subject_id
      LEFT JOIN mimiciv.diagnoses_icd d ON p.subject_id = d.subject_id
      LEFT JOIN mimiciv.d_icd_diagnoses diag ON d.icd_code = diag.icd_code
      LEFT JOIN mimiciv.chartevents vs ON p.subject_id = vs.subject_id AND vs.itemid = 220045 -- Heart Rate
      LEFT JOIN mimiciv.chartevents v2 ON p.subject_id = v2.subject_id AND v2.itemid = 220050 -- Blood Pressure
      WHERE i.outtime IS NULL
      AND d.seq_num = 1
      ORDER BY "sepsisScore" DESC
      LIMIT 20;
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

module.exports = {
  getPatientsOverview
};
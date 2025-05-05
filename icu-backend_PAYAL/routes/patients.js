const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get top 5 priority patients
router.get('/priority-patients', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, gender, age, diseases
      FROM priority_patients
      ORDER BY age DESC
      LIMIT 5
    `);
    console.log("Priority patients fetched:", result.rows); 
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching priority patients");
  }
});

// Get full patient overview
router.get('/patient-overview/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const patient = await pool.query(`
      SELECT id, gender, age, diseases
      FROM priority_patients
      WHERE id = $1
    `, [id]);

    const icu = await pool.query(`
      SELECT intime, outtime, los
      FROM icustays
      WHERE subject_id = $1
      ORDER BY intime DESC
      LIMIT 1
    `, [id]);

    const vitals = await pool.query(`
      SELECT charttime, label, valuenum
      FROM vitals
      WHERE subject_id = $1
      ORDER BY charttime DESC
      LIMIT 5
    `, [id]);

    res.json({
      patient: patient.rows[0],
      icuStay: icu.rows[0],
      vitals: vitals.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching patient overview");
  }
});

module.exports = router;

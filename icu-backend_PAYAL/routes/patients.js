const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper: generate a random risk score (float with 16 decimal places)
function generateRandomScore() {
  return parseFloat(Math.random().toFixed(16));
}

// POST /api/add-patient - Add new patient with auto-generated risk score
router.post('/add-patient', async (req, res) => {
  try {
    const { id, age, gender, diseases } = req.body;

    if (!id || !age || !gender || !diseases) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const risk_score = generateRandomScore();

    const insertQuery = `
      INSERT INTO priority_patients (id, age, gender, diseases, risk_score)
      VALUES ($1, $2, $3, $4, $5)
    `;

    await pool.query(insertQuery, [id, age, gender, diseases, risk_score]);

    console.log("New patient added:", { id, age, gender, diseases, risk_score });

    res.status(201).json({ id, age, gender, diseases, risk_score });
  } catch (err) {
    console.error("Error adding patient:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/priority-patients - Get top 5 patients ordered by age
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

// GET /api/patient-overview/:id - Get full patient + ICU + vitals data
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

// DELETE /api/delete-patient/:id - Delete a patient from the system
router.delete('/delete-patient/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    // Start a transaction to ensure data consistency
    await pool.query('BEGIN');
    
    // Delete from priority_patients table
    const deleteResult = await pool.query(`
      DELETE FROM priority_patients
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (deleteResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: "Patient not found" });
    }
    
    // Note: You might want to delete related data from other tables as well
    // For example, if you want to delete vitals data:
    // await pool.query('DELETE FROM vitals WHERE subject_id = $1', [id]);
    // await pool.query('DELETE FROM icustays WHERE subject_id = $1', [id]);
    // await pool.query('DELETE FROM vitals_features WHERE subject_id = $1', [id]);
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    console.log(`Patient ${id} deleted successfully`);
    res.json({ message: `Patient ${id} deleted successfully` });
    
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("Error deleting patient:", err);
    res.status(500).json({ error: "Server error while deleting patient" });
  }
});

module.exports = router;

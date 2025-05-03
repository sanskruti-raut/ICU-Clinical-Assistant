async function getAnalyticsSummary(pool) {
  const [stayStats, vitalsCount] = await Promise.all([
    pool.query(`SELECT AVG(los) AS avg_los, COUNT(*) AS total_stays FROM icustays`),
    pool.query(`SELECT COUNT(*) FROM vitals`)
  ]);
  return {
    avg_stay_length: parseFloat(stayStats.rows[0].avg_los).toFixed(2),
    total_stays: stayStats.rows[0].total_stays,
    total_vitals: vitalsCount.rows[0].count
  };
}

module.exports = { getAnalyticsSummary };

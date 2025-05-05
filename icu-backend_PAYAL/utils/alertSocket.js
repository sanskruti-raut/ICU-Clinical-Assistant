function startAlertEmitter(io, pool) {
  setInterval(async () => {
    try {
      const result = await pool.query(`
        SELECT subject_id, label, valuenum 
        FROM vitals 
        WHERE valuenum > 130 AND label = 'Heart Rate'
        ORDER BY charttime DESC 
        LIMIT 1
      `);

      if (result.rows.length > 0) {
        io.emit('alert', result.rows[0]); // send to all clients
      }
    } catch (err) {
      console.error("Alert emitter error:", err);
    }
  }, 2000); // check every 2 seconds
}

module.exports = { startAlertEmitter };

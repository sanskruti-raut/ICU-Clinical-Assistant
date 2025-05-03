let simulatedVitals = [];
let currentIndex = 0;
let latestVital = null;

function startSimulation() {
  setInterval(() => {
    if (currentIndex < simulatedVitals.length) {
      latestVital = simulatedVitals[currentIndex];
      currentIndex++;
    }
  }, 1000); // 1 new record per second
}

async function preloadVitals(pool) {
  const result = await pool.query(`
    SELECT * FROM vitals 
    WHERE subject_id IN (SELECT DISTINCT subject_id FROM vitals LIMIT 3)
    ORDER BY charttime ASC
  `);
  simulatedVitals = result.rows;
}
function getLatestVital() {
  return latestVital;
}

function checkForAlert(vital) {
  if (!vital) return null;
  if (vital.label === 'Heart Rate' && vital.valuenum > 100) {
    return `ALERT: High Heart Rate = ${vital.valuenum}`;
  }
  if (vital.label === 'Systolic BP' && vital.valuenum > 180) {
    return `ALERT: High Blood Pressure = ${vital.valuenum}`;
  }
  return null;
}



const simulators = {};  // Holds state per subject_id

async function preloadVitalsForSubject(pool, subjectId) {
  const result = await pool.query(`
    SELECT * FROM vitals 
    WHERE subject_id = $1
    ORDER BY charttime ASC
  `, [subjectId]);
  return result.rows;
}

function startSubjectSimulation(subjectId, vitals) {
  if (simulators[subjectId]) return; // Already running

  let index = 0;
  let latest = null;

  simulators[subjectId] = {
    interval: setInterval(() => {
      if (index < vitals.length) {
        latest = vitals[index];
        index++;
      }
    }, 1000),
    getLatest: () => latest
  };
}

function getLatestForSubject(subjectId) {
  const sim = simulators[subjectId];
  return sim ? sim.getLatest() : null;
}

module.exports = {
  preloadVitals,
  startSimulation,
  getLatestVital,
  checkForAlert,
  preloadVitalsForSubject,
  startSubjectSimulation,
  getLatestForSubject
};

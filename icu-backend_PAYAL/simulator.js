let simulatedVitals = [];
let currentIndex = 0;
let latestVital = null;
let socketInstance = null;  // Store socket.io instance

// at the top of your module
const AWS = require('aws-sdk');

// choose the region of your SNS Topic
AWS.config.update({ region: 'us-west-1' });

const sns = new AWS.SNS();

// your SNS Topic ARN
const HEART_RATE_TOPIC_ARN = "arn:aws:sns:us-west-1:141571820144:heartAlerts";


// Accept socket.io instance when starting simulation
function startSimulation(io) {
  socketInstance = io;  // Store the io instance for later use
  console.log('Starting global simulation with socket.io');

  setInterval(() => {
    if (currentIndex < simulatedVitals.length) {
      latestVital = simulatedVitals[currentIndex];
      currentIndex++;

      console.log('Global simulator emitting vital for patient: ' + (latestVital ? latestVital.subject_id : 'null'));

      // Emit to everyone for alerts
      if (socketInstance && latestVital) {
        socketInstance.emit('vital-update', latestVital);

        // Also emit to specific patient room
        if (latestVital.subject_id) {
          console.log('Emitting to room patient-' + latestVital.subject_id);
          socketInstance.to('patient-' + latestVital.subject_id).emit('vital-update', latestVital);
        }
      }
    } else {
      // Reset index to continue cycling through vitals
      console.log('Resetting global simulation index');
      currentIndex = 0;
    }
  }, 1000); // 1 new record per second
}

async function preloadVitals(pool) {
  console.log('Preloading vitals from database');

  // Load vitals for specific patient IDs that appear in the UI
  const result = await pool.query(`
    SELECT * FROM vitals
    WHERE subject_id IN (10002443, 10014729, 18676703, 12468016, 11281568, 15573773, 17585185)
    ORDER BY charttime ASC
  `);

  console.log('Loaded ' + result.rows.length + ' vitals for global simulation');
  simulatedVitals = result.rows;
}

function getLatestVital() {
  return latestVital;
}

// function checkForAlert(vital) {
//   if (!vital) return null;

//   // Instead of returning early, collect alerts in an array
//   let alerts = [];

//   if (vital.label === 'Heart Rate' && vital.valuenum > 50) {
//     alerts.push('ALERT: High Heart Rate = ' + vital.valuenum + ' for Patient ' + vital.subject_id);
//   }

//   if (vital.label === 'Systolic BP' && vital.valuenum > 50) {
//     alerts.push('ALERT: High Blood Pressure = ' + vital.valuenum + ' for Patient ' + vital.subject_id);
//   }

//   return alerts.length > 0 ? alerts[0] : null; // Return just the first alert to maintain compatibility
// }

function checkForAlert(vital) {
  if (!vital) return null;

  // only care about heart‐rate here
  if (vital.label === 'Heart Rate' && vital.valuenum > 90) {
    const alertMsg = `ALERT: High Heart Rate = ${vital.valuenum} for Patient ${vital.subject_id}`;
    
    // publish to SNS
    try {
        sns.publish({
        TopicArn: HEART_RATE_TOPIC_ARN,
        Message: alertMsg,
        Subject: 'High Heart Rate Alert'
      }).promise();
      console.log('SNS notification sent:', alertMsg);
    } catch (err) {
      console.error('Failed to publish SNS:', err);
    }

    return alertMsg;
  }

  // other alerts unchanged
  if (vital.label === 'Systolic BP' && vital.valuenum > 50) {
    return `ALERT: High Blood Pressure = ${vital.valuenum} for Patient ${vital.subject_id}`;
  }

  return null;
}


const simulators = {};  // Holds state per subject_id

async function preloadVitalsForSubject(pool, subjectId) {
  console.log('Preloading vitals for specific patient: ' + subjectId);
  const result = await pool.query(`
    SELECT * FROM vitals
    WHERE subject_id = $1
    ORDER BY charttime ASC
  `, [subjectId]);

  console.log('Loaded ' + result.rows.length + ' vitals for patient ' + subjectId);
  if (result.rows.length === 0) {
    console.log('WARNING: No vitals found for patient ' + subjectId);
  }

  return result.rows;
}

function startSubjectSimulation(subjectId, vitals) {
  console.log('Starting simulation for patient ' + subjectId + ' with ' + vitals.length + ' vitals');

  if (simulators[subjectId]) {
    console.log('Simulation already running for patient ' + subjectId);
    return; // Already running
  }

  let index = 0;
  let latest = null;

  simulators[subjectId] = {
    interval: setInterval(() => {
      if (index < vitals.length) {
        latest = vitals[index];
        index++;

        console.log('Patient ' + subjectId + ' simulator: emitting vital ' + index + '/' + vitals.length);

        // Emit to patient-specific room if socket is available
        if (socketInstance && latest) {
          socketInstance.to('patient-' + subjectId).emit('vital-update', latest);
        }
      } else {
        // Reset index to continue cycling through vitals
        console.log('Resetting index for patient ' + subjectId + ' simulation');
        index = 0;
      }
    }, 1000),
    getLatest: () => latest
  };
}

function getLatestForSubject(subjectId) {
  const sim = simulators[subjectId];
  return sim ? sim.getLatest() : null;
}

// Setup function for socket handlers
function setupSocketHandlers(io) {
  socketInstance = io;  // Store the io instance

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('join-patient-room', (patientId) => {
      socket.join('patient-' + patientId);
      console.log('Client joined patient-' + patientId + ' room');

      // Send initial vital immediately after joining room
      const simulator = simulators[patientId];
      if (simulator) {
        const latestVital = simulator.getLatest();
        if (latestVital) {
          console.log('Sending initial vital to new client for patient ' + patientId);
          socket.emit('vital-update', latestVital);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}

module.exports = {
  preloadVitals,
  startSimulation,
  getLatestVital,
  checkForAlert,
  preloadVitalsForSubject,
  startSubjectSimulation,
  getLatestForSubject,
  setupSocketHandlers,
  simulatedVitals
};

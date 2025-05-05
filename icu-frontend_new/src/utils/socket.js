import { io } from 'socket.io-client';

const socket = io(window.location.origin);

export const joinPatientRoom = (patientId) => {
  socket.emit('join-patient-room', patientId);
};

export const subscribeToVitals = (callback) => {
  socket.on('vital-update', (data) => {
    callback(data);
  });
  
  return () => socket.off('vital-update');
};

export default socket;

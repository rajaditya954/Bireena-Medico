import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  autoConnect: false,
  transports: ['websocket'],
});

export const connectSocket = () => {
  if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export const joinDoctorQueue = (doctorId) => {
  socket.emit('join-doctor-queue', doctorId);
};

export const leaveDoctorQueue = (doctorId) => {
  socket.emit('leave-doctor-queue', doctorId);
};

export const onQueueUpdated = (callback) => {
  socket.on('queue-updated', callback);
  return () => socket.off('queue-updated', callback);
};

export default socket;

import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // change if your server is deployed

export default socket;

export default interface User {
    _id: string;
    username: string;
    name: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: string;
    avatar?: string;
    socketId?: string;
  }
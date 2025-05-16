 export default interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'file';
  fileType?: string;
  isRead: boolean;
}
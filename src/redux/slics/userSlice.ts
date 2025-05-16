import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type User from '../../pages/types/User';
import type Message from '../../pages/types/Message';

interface UserState {
  currentUserId: string;
  showModal: boolean;
  currentUser: User | null;
  showEmojiPicker: boolean;
  selectedUser: User | null;
  users: User[];
  message: string;
  messagesMap: { [userId: string]: Message[] };
  isTyping: boolean;
  modalFileUrl: string;
  selectedFile: File | null;
}

const initialState: UserState = {
  currentUserId: '',
  showModal: false,
  currentUser: null,
  showEmojiPicker: false,
  selectedUser: null,
  users: [],
  message: '',
  messagesMap: {},
  isTyping: false,
  modalFileUrl: '',
  selectedFile: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUserId: (state, action: PayloadAction<string>) => {
      state.currentUserId = action.payload;
    },
    setShowModal: (state, action: PayloadAction<boolean>) => {
      state.showModal = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    setShowEmojiPicker: (state, action: PayloadAction<boolean>) => {
      state.showEmojiPicker = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    setMessagesMap: (state, action: PayloadAction<{ [userId: string]: Message[] }>) => {
      state.messagesMap = action.payload;
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setModalFileUrl: (state, action: PayloadAction<string>) => {
      state.modalFileUrl = action.payload;
    },
    setSelectedFile: (state, action: PayloadAction<File | null>) => {
      state.selectedFile = action.payload;
    },
  },
});

export const {
  setCurrentUserId,
  setShowModal,
  setCurrentUser,
  setShowEmojiPicker,
  setSelectedUser,
  setUsers,
  setMessage,
  setMessagesMap,
  setIsTyping,
  setModalFileUrl,
  setSelectedFile,
} = userSlice.actions;
export default userSlice.reducer;
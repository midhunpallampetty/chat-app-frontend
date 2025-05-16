'use client';
import { useEffect, useRef, useCallback } from 'react';
import { Video, Phone, Info, Smile, Mic, Send, Paperclip, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import axios from 'axios';
import type User from './types/User';
import type Message from './types/Message';
import { transformFileUrl } from '../utils/transformUrl';
import { inferMessageType } from '../utils/inferMessageType';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import {
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
} from '../redux/slics/userSlice';
import { debounce } from 'lodash';

const ChatLayout = () => {
  const dispatch = useAppDispatch();
  const {
    currentUserId,
    showModal,
    currentUser,
    showEmojiPicker,
    selectedUser,
    users,
    message,
    messagesMap,
    isTyping,
    modalFileUrl,
    selectedFile,
  } = useAppSelector((state) => state.user);

  const socketRef = useRef<Socket | null>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [messageId: string]: HTMLDivElement }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const username = Cookies.get('username');
    const jwt = Cookies.get('jwt');

    if (!username || !jwt) {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    const username = Cookies.get('username');
    axios
      .post('http://localhost:5000/getuser', { username })
      .then((res) => {
        dispatch(setCurrentUserId(res.data.userId[0]._id));
      })
      .catch((err) => {
        console.error('Error fetching user:', err);
      });
  }, [dispatch]);

  const fetchOldMessages = useCallback(
    async (userId: string) => {
      if (!currentUser) return;

      try {
        const res = await fetch('http://localhost:5000/messages/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderId: currentUser.username,
            receiverId: userId,
          }),
        });

        if (!res.ok) throw new Error('Failed to fetch messages');

        const data: Message[] = await res.json();
        const processedData = data.map(inferMessageType).map((msg) => {
          console.log(`Fetched message ${msg._id} - isRead: ${msg.isRead}, status: ${msg.status}`);
          return {
            ...msg,
            isRead: !!msg.isRead,
          };
        });
        dispatch(
          setMessagesMap({
            ...messagesMap,
            [userId]: processedData.sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            ),
          })
        );
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    },
    [currentUser, messagesMap, dispatch]
  );

  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            const message = messagesMap[selectedUser._id]?.find(
              (msg) => msg._id === messageId && msg.senderId === selectedUser._id && !msg.isRead
            );

            if (message) {
              try {
                console.log('Marking message as read:', message._id);
                await axios.post('http://localhost:5000/messages/mark-read', {
                  messageId: message._id,
                });

                dispatch(
                  setMessagesMap({
                    ...messagesMap,
                    [selectedUser._id]: messagesMap[selectedUser._id].map((msg) =>
                      msg._id === message._id ? { ...msg, status: 'read', isRead: true } : msg
                    ),
                  })
                );

                socketRef.current?.emit('message_read', {
                  messageIds: [message._id],
                  senderId: selectedUser._id,
                  receiverId: currentUser._id,
                });
              } catch (error) {
                console.error('Error marking message as read:', error);
              }
            }
          }
        });
      },
      { threshold: 0.9 }
    );

    Object.values(messageRefs.current).forEach((element) => {
      if (element) observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [selectedUser, currentUser, messagesMap, dispatch]);

  useEffect(() => {
    const username = Cookies.get('username') || 'Unknown User';
    const tempUser = {
      username: username.toLowerCase().replace(/\s/g, '') || 'guest',
      name: username,
      status: 'online' as const,
      avatar: '/avatar.jpg',
    };

    fetch(`http://localhost:5000/user/${tempUser.username}`)
      .then((res) => res.json())
      .then((user: User) => dispatch(setCurrentUser(user)))
      .catch(() => dispatch(setCurrentUser(tempUser as any)));
  }, [dispatch]);

  useEffect(() => {
    if (!currentUser) return;

    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register', currentUser.username);
    });

    fetch('http://localhost:5000/users')
      .then((res) => res.json())
      .then((data: { users: User[] }) => {
        const filtered = data.users.filter((u) => u.username !== currentUser.username);
        dispatch(setUsers(filtered));
      });

    socket.on('private_message', (msg: Message) => {
      const processedMsg = inferMessageType({
        ...msg,
        isRead: !!msg.isRead,
      });
      console.log(`Received private_message ${msg._id} - isRead: ${processedMsg.isRead}`);
      dispatch(
        setMessagesMap({
          ...messagesMap,
          [processedMsg.senderId]: [
            ...(messagesMap[processedMsg.senderId] || []),
            processedMsg,
          ],
        })
      );
    });

    socket.on('message_sent', (msg: Message) => {
      const processedMsg = inferMessageType({
        ...msg,
        isRead: !!msg.isRead,
      });
      console.log(`Received message_sent ${msg._id} - isRead: ${processedMsg.isRead}`);
      dispatch(
        setMessagesMap({
          ...messagesMap,
          [selectedUser?._id || '']: (messagesMap[selectedUser?._id || ''] || []).map((m) =>
            m._id === processedMsg._id ? processedMsg : m
          ),
        })
      );
    });

    socket.on('message_read', ({ messageIds, senderId, receiverId }) => {
      console.log('Received message_read event:', { messageIds, senderId, receiverId });
      dispatch(
        setMessagesMap({
          ...messagesMap,
          [senderId]: (messagesMap[senderId] || []).map((msg) =>
            messageIds.includes(msg._id) && msg.senderId === receiverId && msg.receiverId === senderId
              ? { ...msg, status: 'read', isRead: true }
              : msg
          ),
        })
      );
    });

    socket.on('typing', ({ senderId }) => {
      if (senderId === selectedUser?._id) {
        dispatch(setIsTyping(true));
      }
    });

    socket.on('stop_typing', ({ senderId }) => {
      if (senderId === selectedUser?._id) {
        dispatch(setIsTyping(false));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser, selectedUser, messagesMap, dispatch]);

  const handleUserSelect = async (user: User) => {
    dispatch(setSelectedUser(user));
    dispatch(setIsTyping(false)); // Reset typing state when switching users
    await fetchOldMessages(user._id);
  };

  const debouncedTyping = useCallback(
    debounce(() => {
      if (!socketRef.current || !selectedUser || !currentUser) return;
      socketRef.current.emit('typing', {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
      });
    }, 500),
    [currentUser, selectedUser]
  );

  const handleTyping = () => {
    if (!socketRef.current || !selectedUser || !currentUser) return;
    if (message) {
      debouncedTyping();
    } else {
      socketRef.current.emit('stop_typing', {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
      });
    }
  };

  const handleSend = async () => {
    if (!selectedUser || !currentUser) return;

    // Handle text message
    if (message.trim()) {
      const newMessage: Message = {
        _id: Date.now().toString(),
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        text: message,
        timestamp: new Date(),
        status: 'sent',
        type: 'text',
        isRead: false,
      };

      dispatch(
        setMessagesMap({
          ...messagesMap,
          [selectedUser._id]: [...(messagesMap[selectedUser._id] || []), newMessage],
        })
      );

      socketRef.current?.emit('private_message', newMessage);
      dispatch(setMessage(''));
    }

    // Handle file upload
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const response = await axios.post('http://localhost:5000/upload/file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });

        const newMessage: Message = {
          _id: Date.now().toString(),
          senderId: currentUser._id,
          receiverId: selectedUser._id,
          text: response.data.url,
          timestamp: new Date(),
          status: 'sent',
          type: 'file',
          fileType: selectedFile.type || response.data.fileType,
          isRead: false,
        };

        dispatch(
          setMessagesMap({
            ...messagesMap,
            [selectedUser._id]: [...(messagesMap[selectedUser._id] || []), newMessage],
          })
        );

        socketRef.current?.emit('private_message', newMessage);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        dispatch(setSelectedFile(null));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }

    socketRef.current?.emit('stop_typing', {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      dispatch(setSelectedFile(file));
    }
  };

  const handleCancelFile = () => {
    dispatch(setSelectedFile(null));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesMap, selectedUser]);

  const handleEmojiClick = (emojiData: any) => {
    dispatch(setMessage(message + emojiData.emoji));
    dispatch(setShowEmojiPicker(false));
  };

  const handleFileClick = (url: string) => {
    const transformedUrl = transformFileUrl(url);
    dispatch(setModalFileUrl(transformedUrl));
    dispatch(setShowModal(true));
  };

  const closeModal = () => {
    dispatch(setShowModal(false));
    dispatch(setModalFileUrl(''));
  };

  const renderFileContent = (url: string, fileType?: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    const inferredType =
      fileType ||
      (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '') ? 'image/*' : extension === 'pdf' ? 'application/pdf' : '');

    if (inferredType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return (
        <img
          src={url}
          alt="File"
          className="max-w-full max-h-[80vh] object-contain"
          onError={(e) => console.error('Image load error:', e)}
        />
      );
    } else if (inferredType === 'application/pdf' || extension === 'pdf') {
      return (
        <iframe
          src={url}
          title="PDF Preview"
          className="w-full h-[80vh]"
          onError={(e) => console.error('Iframe load error:', e)}
        />
      );
    } else {
      return (
        <div className="text-center">
          <p>File type not supported for preview.</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline"
          >
            Download File
          </a>
        </div>
      );
    }
  };

  const renderMessageStatus = (isRead: boolean) => {
    console.log('Rendering status for isRead:', isRead);
    return (
      <span className={`text-xs ${isRead ? 'text-white/70 italic font-extrabold' : 'text-white font-extrabold'}`}>
        {isRead ? '✓✓' : '✓'}
      </span>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-72 bg-white border-r p-4">
        <h2 className="text-lg font-semibold mb-4">Available Users</h2>
        <div className="space-y-2 overflow-y-auto h-[90vh] pr-2">
          {users.map((user) => (
            <div
              key={user._id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                selectedUser?._id === user._id ? 'bg-indigo-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleUserSelect(user)}
            >
              <div className="relative w-10 h-10 rounded-full bg-gray-300" />
              <div className="flex-1">
                <div className="font-medium">{user.username}</div>
                <div className="text-xs text-gray-500">
                  {user.status === 'offline'
                    ? `Last seen: ${new Date(user.lastSeen || '').toLocaleString()}`
                    : user.status}
                </div>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${
                  user.status === 'online'
                    ? 'bg-green-500'
                    : user.status === 'away'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedUser ? (
          <>
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-green-500">
                    {isTyping ? 'typing...' : selectedUser.status}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 text-gray-500">
                <Phone className="w-5 h-5 cursor-pointer" />
                <Video className="w-5 h-5 cursor-pointer" />
                <Info className="w-5 h-5 cursor-pointer" />
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {(messagesMap[selectedUser._id] || []).map((msg) => {
                console.log(`Rendering message ${msg._id} - isRead: ${msg.isRead}, senderId: ${msg.senderId}, receiverId: ${msg.receiverId}`);
                return (
                  <div
                    key={msg._id}
                    ref={(el) => {
                      if (el) {
                        messageRefs.current[msg ._id] = el;
                        if (msg.senderId === selectedUser._id && !msg.isRead) {
                          observerRef.current?.observe(el);
                        }
                      }
                    }}
                    data-message-id={msg._id}
                    className={`max-w-sm px-4 py-2 rounded-2xl mb-4 text-sm shadow flex items-end gap-2 ${
                      msg.senderId === currentUser?._id || msg.senderId === currentUserId
                        ? 'ml-auto bg-indigo-600 text-white'
        : 'bg-white text-black'
                    }`}
                  >
                    <div>
                      {msg.type === 'file' ? (
                        <button
                          onClick={() => handleFileClick(msg.text)}
                          className="underline hover:text-indigo-300"
                        >
                          📎 View File
                        </button>
                      ) : (
                        msg.text
                      )}
                    </div>
                    {(msg.senderId === currentUser?._id || msg.senderId === currentUserId) && (
                      <div>{renderMessageStatus(msg.isRead)}</div>
                    )}
                  </div>
                );
              })}
              <div ref={lastMessageRef} />
            </div>

            <div className="flex items-center p-4 border-t bg-white gap-3">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />
                  <Paperclip className="w-6 h-6 text-gray-300" />
                </label>
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="truncate max-w-[150px]">{selectedFile.name}</span>
                    <button onClick={handleCancelFile}>
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <Smile
                  className="w-6 h-6 text-gray-300 cursor-pointer"
                  onClick={() => dispatch(setShowEmojiPicker(!showEmojiPicker))}
                />
                {showEmojiPicker && (
                  <div className="absolute bottom-12 z-10">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
              </div>
              <input
                value={message}
                onChange={(e) => dispatch(setMessage(e.target.value))}
                onKeyUp={handleTyping}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-4 py-2 text-sm border rounded-2xl focus:outline-none"
                placeholder="Type your message..."
              />
              <Mic className="w-6 h-6 text-gray-300" />
              <Send className="w-6 h-6 text-indigo-600 cursor-pointer" onClick={handleSend} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a user to start chatting
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">File Preview</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center min-h-[200px]">
              {renderFileContent(
                modalFileUrl,
                messagesMap[selectedUser?._id]?.find((m) => m.text === modalFileUrl)?.fileType
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLayout;
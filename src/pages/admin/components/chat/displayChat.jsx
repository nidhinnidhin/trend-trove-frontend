import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Badge,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Send } from '@mui/icons-material';
import io from 'socket.io-client';
import adminAxiosInstance from '@/utils/adminAxiosInstance';

const DisplayChat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Modified handleScroll function
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      setIsAutoScrolling(isNearBottom);
    }
  };

  // Scroll to bottom on initial load and when new messages arrive
  useEffect(() => {
    if (selectedChat?.messages && isInitialLoad) {
      scrollToBottom();
      setIsInitialLoad(false);
    } else if (isAutoScrolling && selectedChat?.messages) {
      scrollToBottom();
    }
  }, [selectedChat?.messages, isInitialLoad]);

  // Reset initial load state when changing chats
  useEffect(() => {
    if (selectedChatId) {
      setIsInitialLoad(true);
    }
  }, [selectedChatId]);

  // Load chats when the component mounts
  useEffect(() => {
    loadChats();

    const newSocket = io('http://localhost:9090', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Admin socket connected:', newSocket.id);
      newSocket.emit('admin-join');
    });

    newSocket.on('new-message', (data) => {
      console.log('New message received:', data);
      if (data.message && data.chatId) {
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat._id !== data.chatId) return chat;

            // Check if message already exists
            const messageExists = chat.messages.some(msg => msg._id === data.message._id);
            if (messageExists) return chat;

            // Add new message
            return {
              ...chat,
              messages: [...chat.messages, data.message]
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            };
          });
        });
      }
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Update selected chat when selectedChatId or chats change
  useEffect(() => {
    if (selectedChatId && chats.length > 0) {
      const currentChat = chats.find(chat => chat._id === selectedChatId);
      if (currentChat) {
        setSelectedChat(currentChat);
        markChatAsRead(selectedChatId);
      }
    }
  }, [chats, selectedChatId]);

  // Function to load chats
  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await adminAxiosInstance.get('/chat/admin-chats');
      if (response.data) {
        setChats(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading chats:', error);
      setError('Failed to load chats');
      setLoading(false);
    }
  };

  // Function to send a message
  const handleSend = async () => {
    if (!message.trim() || !selectedChat) return;

    const messageText = message.trim();
    setMessage('');

    try {
      const response = await adminAxiosInstance.post('/chat/send-message', {
        userId: selectedChat.user._id,
        message: messageText,
        senderType: 'Admin'
      });

      if (response.data.success) {
        // Update the chat with the new message immediately
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat._id !== selectedChat._id) return chat;

            return {
              ...chat,
              messages: [...chat.messages, response.data.data]
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            };
          });
        });

        // Emit socket event
        socket?.emit('send-message', {
          userId: selectedChat.user._id,
          message: messageText,
          senderType: 'Admin'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      setMessage(messageText);
    }
  };

  // Function to handle chat selection
  const handleChatSelect = (chat) => {
    setSelectedChatId(chat._id);
    setIsAutoScrolling(true); // Enable auto-scroll when a new chat is selected
  };

  // Function to mark chat as read
  const markChatAsRead = async (chatId) => {
    try {
      await adminAxiosInstance.put(`/chat/mark-read/${chatId}`);
      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === chatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.senderType === 'User' ? { ...msg, read: true } : msg
                )
              }
            : chat
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Function to get unread message count
  const getUnreadCount = (chat) => {
    return chat.messages.filter(msg => !msg.read && msg.senderType === 'User').length;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', p: 2, gap: 2 }}>
      {/* Chat List */}
      <Paper sx={{ width: 300, overflow: 'auto' }}>
        <List>
          {chats.map((chat) => (
            <React.Fragment key={chat._id}>
              <ListItem
                button
                selected={selectedChatId === chat._id}
                onClick={() => handleChatSelect(chat)}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={getUnreadCount(chat)}
                    color="error"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                  >
                    <Avatar src={chat.user?.image}>
                      {chat.user?.username?.[0]?.toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={chat.user?.username || 'Anonymous'}
                  secondary={chat.user?.email}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Chat Messages */}
      {selectedChat ? (
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">
              {selectedChat.user?.username || 'Anonymous'}
            </Typography>
            <Typography variant="body2">
              {selectedChat.user?.email}
            </Typography>
          </Box>

          <Box
            ref={chatContainerRef}
            onScroll={handleScroll}
            sx={{
              flex: 1,
              p: 2,
              overflow: 'auto',
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              },
            }}
          >
            {selectedChat.messages.map((msg) => (
              <Box
                key={msg._id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.senderType === 'Admin' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Paper
                  sx={{
                    p: 1,
                    bgcolor: msg.senderType === 'Admin' ? 'primary.light' : 'grey.100',
                    color: msg.senderType === 'Admin' ? 'white' : 'inherit',
                    maxWidth: '70%'
                  }}
                >
                  <Typography variant="body1">{msg.message}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
            />
            <IconButton
              onClick={handleSend}
              color="primary"
              disabled={!message.trim()}
            >
              <Send />
            </IconButton>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Select a chat to start messaging
          </Typography>
        </Paper>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        message={error}
      />
    </Box>
  );
};

export default DisplayChat;
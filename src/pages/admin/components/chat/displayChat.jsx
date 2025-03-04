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
import { Send, Circle } from '@mui/icons-material';
import io from 'socket.io-client';
import adminAxiosInstance from '@/utils/adminAxiosInstance';
import getCookie from '@/utils/getCookie';

const DisplayChat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageMap, setMessageMap] = useState(new Map());
  const messagesEndRef = useRef(null);

  const addUniqueMessage = (chatId, newMessage) => {
    if (!newMessage._id) return;

    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat._id !== chatId) return chat;

        const existingMessages = new Map(
          chat.messages.map(msg => [msg._id.toString(), msg])
        );

        if (!existingMessages.has(newMessage._id.toString())) {
          existingMessages.set(newMessage._id.toString(), newMessage);
        }

        return {
          ...chat,
          messages: Array.from(existingMessages.values())
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        };
      });
    });
  };

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

  useEffect(() => {
    loadChats(); // Load chats immediately when component mounts

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
            const messageExists = chat.messages.some(msg => 
              msg._id === data.message._id
            );
            
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

  useEffect(() => {
    if (selectedChatId && chats.length > 0) {
      const currentChat = chats.find(chat => chat._id === selectedChatId);
      if (currentChat) {
        setSelectedChat(currentChat);
        markChatAsRead(selectedChatId);
      }
    }
  }, [chats, selectedChatId]);

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

  const handleChatSelect = (chat) => {
    setSelectedChatId(chat._id);
  };

  const markChatAsRead = async (chatId) => {
    try {
      await adminAxiosInstance.put(`/chat/mark-read/${chatId}`);
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === chatId 
            ? {
                ...chat, 
                messages: chat.messages.map(msg => 
                  msg.senderType === 'User' ? {...msg, read: true} : msg
                )
              }
            : chat
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

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

          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
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
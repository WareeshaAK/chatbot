'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Stack, TextField, Button } from '@mui/material';
import { styled } from '@mui/system';

// Styled components for better UI
const ChatContainer = styled(Box)({
    width: '100%',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: '16px',
    boxSizing: 'border-box',
});

const ChatBox = styled(Stack)({
    width: '100%',
    maxWidth: '600px',
    height: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#ffffff',
    overflowY: 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '8px',
    flexGrow: 1,
});

const MessageBubble = styled(Box)(({ theme, role }) => ({
    backgroundColor: role === 'assistant' ? '#e3f2fd' : '#cfe9ff',
    color: '#333',
    borderRadius: '16px',
    padding: '12px',
    maxWidth: '75%',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    alignSelf: role === 'assistant' ? 'flex-start' : 'flex-end',
    marginBottom: '8px',
}));

const InputContainer = styled(Stack)({
    width: '100%',
    maxWidth: '600px',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
});

const InputField = styled(TextField)({
    flex: 1,
});

export default function Home() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Welcome to PAAW Customer Support!" }
    ]);
    const [input, setInput] = useState('');
    const endOfChatRef = useRef(null);

    const sendMessage = async () => {
        try {
            const newMessage = { role: 'user', content: input };
            setMessages([...messages, newMessage]);
            setInput('');

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: input }),
            });
            const data = await response.json();
            setMessages([...messages, newMessage, { role: 'assistant', content: data.data.generated_text }]);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <ChatContainer>
            <ChatBox>
                <Stack direction="column" spacing={2} flexGrow={1}>
                    {messages.map((message, index) => (
                        <MessageBubble key={index} role={message.role}>
                            {message.content}
                        </MessageBubble>
                    ))}
                    <div ref={endOfChatRef} /> {/* For auto-scrolling */}
                </Stack>
                <InputContainer>
                    <InputField
                        label="Type your message..."
                        fullWidth
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        variant="outlined"
                    />
                    <Button variant="contained" onClick={sendMessage} style={{ minWidth: '100px' }}>
                        Send
                    </Button>
                </InputContainer>
            </ChatBox>
        </ChatContainer>
    );
}


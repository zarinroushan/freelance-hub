import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Send, User, Search } from 'lucide-react';

interface Conversation {
  conversation: {
    id: number;
    participant_1_id: number;
    participant_2_id: number;
    last_message_at: string;
  };
  other_user: {
    id: number;
    email: string;
  };
  last_message?: {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
  };
}

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
}

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('unigigs_token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/messages/conversation/${selectedConversation}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('unigigs_token')}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setMessages(data);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('unigigs_token')}`,
        },
        body: JSON.stringify({
          conversation_id: selectedConversation,
          content: newMessage,
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages([...messages, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartConversation = async (userId: number) => {
    try {
      const response = await fetch(`/api/messages/start/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('unigigs_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedConversation(data.conversation_id);
        // Refresh conversations
        const convs = await fetch('/api/messages/conversations', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('unigigs_token')}` },
        });
        if (convs.ok) {
          setConversations(await convs.json());
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[var(--color-text-muted)]">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Messages</h1>
        <p className="text-[var(--color-text-muted)]">
          Communicate with clients and freelancers
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-sm"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(600px-80px)]">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-muted)]">
                <User size={48} className="mx-auto mb-4 opacity-20" />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.conversation.id}
                  onClick={() => setSelectedConversation(conv.conversation.id)}
                  className={`w-full p-4 text-left border-b border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-colors ${
                    selectedConversation === conv.conversation.id ? 'bg-[var(--color-surface-alt)]' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                      <User size={20} className="text-[var(--color-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--color-text)] truncate">
                        {conv.other_user?.email || 'User'}
                      </div>
                      {conv.last_message && (
                        <div className="text-sm text-[var(--color-text-muted)] truncate">
                          {conv.last_message.content}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === parseInt(localStorage.getItem('user_id') || '0');
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-surface-alt)] text-[var(--color-text)]'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[var(--color-border)]">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send size={18} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)]">
              <div className="text-center">
                <Send size={64} className="mx-auto mb-4 opacity-20" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
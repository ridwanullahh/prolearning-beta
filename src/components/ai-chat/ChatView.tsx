import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { aiChatService } from '@/lib/ai-chat-service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLocation } from 'react-router-dom';
import { ScrollArea } from '../ui/scroll-area';

interface ChatViewProps {
  session: any;
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ session, onBack }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = authService.getCurrentUser();
  const location = useLocation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const data = await db.queryBuilder('aiChatMessages').where((m: any) => m.sessionId === session.id).orderBy('createdAt', 'asc').exec();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, [session.id]);

  useEffect(() => {
    // @ts-ignore
    if (scrollAreaRef.current?.scrollTo) {
        // @ts-ignore
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const getContextualPrompt = async () => {
    const courseRegex = /course\/([^/]+)/;
    const lessonRegex = /lesson\/([^/]+)/;

    const courseMatch = location.pathname.match(courseRegex);
    const lessonMatch = location.pathname.match(lessonRegex);

    let contextPrompt = 'You are a helpful AI assistant for the Prolearning platform. ';
    let contextData: any = {};

    // Determine user role for appropriate assistance
    const userRole = currentUser?.role || 'learner';
    contextData.userRole = userRole;

    if (userRole === 'instructor') {
      contextPrompt += 'You are assisting an instructor. Focus on helping with course creation, teaching strategies, content development, assessment design, and educational best practices. ';
    } else {
      contextPrompt += 'You are assisting a learner. Focus on explaining concepts clearly, providing examples, helping with understanding the material, and supporting their learning journey. ';
    }

    if (lessonMatch) {
      const lesson = await db.getItem('lessons', lessonMatch[1]);
      if (lesson) {
        contextData.lessonId = lesson.id;
        contextPrompt += `The user is currently on the lesson "${lesson.title}". `;
        contextPrompt += `Lesson description: ${lesson.description}. `;

        if (lesson.contents && lesson.contents.length > 0) {
          contextPrompt += 'Lesson content: ';
          lesson.contents.forEach((content: any, index: number) => {
            contextPrompt += `${index + 1}. ${content.type}: ${content.content?.substring(0, 200)}... `;
          });
        }

        if (lesson.keyPoints && lesson.keyPoints.length > 0) {
          contextPrompt += 'Key learning points: ';
          lesson.keyPoints.forEach((point: any) => {
            contextPrompt += `- ${point.point}: ${point.explanation} `;
          });
        }

        if (lesson.quiz) {
          contextPrompt += `This lesson includes a quiz with ${lesson.quiz.questions?.length || 0} questions. `;
        }

        contextPrompt += 'Use this lesson context to provide relevant, helpful responses. ';
      }
    } else if (courseMatch) {
      const course = await db.getItem('courses', courseMatch[1]);
      if (course) {
        contextData.courseId = course.id;
        contextPrompt += `The user is currently on the course "${course.title}". `;
        contextPrompt += `Course description: ${course.description}. `;
        contextPrompt += `Course level: ${course.level}. `;

        // Get course lessons for broader context
        const lessons = await db.queryBuilder('lessons')
          .where((l: any) => l.courseId === course.id)
          .orderBy('order', 'asc')
          .exec();

        if (lessons.length > 0) {
          contextPrompt += `This course has ${lessons.length} lessons: `;
          lessons.slice(0, 5).forEach((lesson: any, index: number) => {
            contextPrompt += `${index + 1}. ${lesson.title} `;
          });
          if (lessons.length > 5) {
            contextPrompt += `and ${lessons.length - 5} more lessons. `;
          }
        }
      }
    }

    // Update session context if we have new context data
    if (session && Object.keys(contextData).length > 0) {
      try {
        await db.update('aiChatSessions', session.id, {
          context: {
            ...session.context,
            ...contextData,
            lastUpdated: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error updating session context:', error);
      }
    }

    contextPrompt += 'Please provide helpful, accurate, and contextually relevant responses. ';

    return contextPrompt;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser || isLoading) return;

    setIsLoading(true);

    const userMessage = {
      sessionId: session.id,
      role: 'user',
      content: input,
    };
    await db.insert('aiChatMessages', userMessage);
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    const contextualPrompt = await getContextualPrompt();
    const history = newMessages.slice(-10); // Use last 10 messages for history
    
    try {
      const context = {
        courseId: session.context?.courseId,
        lessonId: session.context?.lessonId,
        userRole: currentUser?.role
      };

      const response = await aiChatService.generateResponse(history, input, context);

      const modelMessage = {
        sessionId: session.id,
        role: 'assistant',
        content: response,
        tokens: response.length, // Rough token estimate
        model: 'gemini-2.5-flash',
        isContextual: !!(context.courseId || context.lessonId),
        metadata: {
          responseTime: Date.now() - Date.now(), // Will be calculated properly in service
          contextUsed: context
        }
      };
      await db.insert('aiChatMessages', modelMessage);
      setMessages([...newMessages, modelMessage]);

      // Update session metadata
      await db.update('aiChatSessions', session.id, {
        lastMessageAt: new Date().toISOString(),
        messageCount: (session.messageCount || 0) + 2 // User + AI message
      });

    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage = {
        sessionId: session.id,
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. This might be due to high demand or a temporary issue. Please try again in a moment.',
        tokens: 0,
        model: 'gemini-2.5-flash',
        isContextual: false,
        metadata: {
          error: true,
          errorType: error instanceof Error ? error.message : 'Unknown error'
        }
      };
      await db.insert('aiChatMessages', errorMessage);
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Button onClick={onBack} variant="link" className="self-start">Back to sessions</Button>
      <h2 className="text-xl font-bold mb-4">{session.title}</h2>
      <ScrollArea className="flex-grow p-4 border rounded-md" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center">Thinking...</div>}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="flex-grow"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>Send</Button>
      </form>
    </div>
  );
};

export default ChatView;
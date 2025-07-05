
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Eye,
  Edit
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  height = "300px"
}) => {
  const [activeTab, setActiveTab] = useState('edit');
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      if (textareaRef) {
        const newCursorPos = start + before.length + selectedText.length + after.length;
        textareaRef.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.focus();
      }
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertText('**', '**'), tooltip: 'Bold' },
    { icon: Italic, action: () => insertText('*', '*'), tooltip: 'Italic' },
    { icon: Underline, action: () => insertText('<u>', '</u>'), tooltip: 'Underline' },
    { icon: Quote, action: () => insertText('> '), tooltip: 'Quote' },
    { icon: Code, action: () => insertText('`', '`'), tooltip: 'Inline Code' },
    { icon: List, action: () => insertText('\n- '), tooltip: 'Bullet List' },
    { icon: ListOrdered, action: () => insertText('\n1. '), tooltip: 'Numbered List' },
    { icon: Link, action: () => insertText('[', '](url)'), tooltip: 'Link' },
    { icon: Image, action: () => insertText('![alt text](', ')'), tooltip: 'Image' },
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {toolbarButtons.map((button, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={button.action}
                    title={button.tooltip}
                    className="h-8 w-8 p-0"
                  >
                    <button.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
              <TabsList className="h-8">
                <TabsTrigger value="edit" className="h-6 px-3 text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="h-6 px-3 text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="edit" className="m-0">
            <textarea
              ref={setTextareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 border-0 resize-none focus:outline-none focus:ring-0"
              style={{ height }}
            />
          </TabsContent>

          <TabsContent value="preview" className="m-0">
            <div 
              className="p-4 prose max-w-none"
              style={{ height, overflowY: 'auto' }}
            >
              {value ? (
                <ReactMarkdown>{value}</ReactMarkdown>
              ) : (
                <p className="text-gray-500 italic">Nothing to preview</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RichTextEditor;

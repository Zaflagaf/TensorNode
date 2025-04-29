"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Send, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: { type: string; url: string }[];
}

export default function AIPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<
    { type: string; url: string }[]
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim() && attachments.length === 0) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I received your message${input ? `: "${input}"` : ""}${
          attachments.length > 0 ? " and your attachments" : ""
        }.`,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);

    // Clear input and attachments
    setInput("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            type: file.type,
            url: result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col w-full h-full bg-white border border-gray-200 rounded-md shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-800">AI Assistant</h3>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex flex-col max-w-[85%] rounded-lg p-3",
              message.role === "user"
                ? "ml-auto bg-black text-white"
                : "bg-gray-100 text-gray-800"
            )}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index}>
                    {attachment.type.startsWith("image/") ? (
                      <img
                        src={attachment.url || "/placeholder.svg"}
                        alt="Attachment"
                        className="max-w-full rounded-md max-h-[200px] object-contain"
                      />
                    ) : (
                      <div className="bg-gray-200 p-2 rounded-md text-sm">
                        {attachment.type} file
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative">
              {attachment.type.startsWith("image/") ? (
                <div className="relative h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                  <img
                    src={attachment.url || "/placeholder.svg"}
                    alt="Attachment preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute top-0 right-0 bg-gray-800 bg-opacity-70 rounded-bl-md p-0.5"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="relative h-16 w-16 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                  <div className="text-xs text-center text-gray-500">File</div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute top-0 right-0 bg-gray-800 bg-opacity-70 rounded-bl-md p-0.5"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t border-gray-200">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="resize-none pr-24 min-h-[60px] max-h-[200px]"
            rows={2}
          />
          <div className="absolute bottom-2 right-2 flex space-x-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              multiple
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSubmit}
              size="icon"
              className="h-8 w-8"
              disabled={!input.trim() && attachments.length === 0}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Plus, Replace, Loader2, AlertCircle, Bot, User, Trash2 } from "lucide-react";
import { ComponentDefinition, ChatMessage, CustomComponents, GlobalComponents } from "@/types/editor";
import { cn } from "@/lib/utils";

interface AIChatPanelProps {
  onApplyComponents: (components: ComponentDefinition[], mode: "add" | "replace") => void;
  onApplyPages?: (pages: { name: string; path: string; components: ComponentDefinition[] }[]) => void;
  existingComponents: ComponentDefinition[];
  customComponents?: CustomComponents;
  globalComponents?: GlobalComponents;
  messages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

export const AI_MODELS = [
  { id: "gemini-1.5-flash-latest", name: "Gemini 1.5 Flash (Fast & Free)" },
  { id: "gemini-1.5-pro-latest", name: "Gemini 1.5 Pro (High Quality)" },
  { id: "gemini-flash-latest", name: "Gemini Flash Latest" },
  { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro" },
  { id: "gemini-pro", name: "Gemini Pro" },
];

export function AIChatPanel({ 
  onApplyComponents, 
  onApplyPages, 
  existingComponents, 
  customComponents,
  globalComponents,
  messages: externalMessages, 
  onMessagesChange 
}: AIChatPanelProps) {
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([]);
  const messages = externalMessages ?? internalMessages;
  
  // Use a ref to keep track of the latest messages for async callbacks
  const messagesRef = useRef<ChatMessage[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const setMessages = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    const newMessages = typeof updater === 'function' ? updater(messagesRef.current) : updater;
    if (onMessagesChange) {
      onMessagesChange(newMessages);
    } else {
      setInternalMessages(newMessages);
    }
    // Optimistically update the ref to prevent stale closures within the same render cycle
    messagesRef.current = newMessages;
  };
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const generateId = () => Math.random().toString(36).substring(2, 10);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          existingComponents,
          customComponents,
          globalComponents,
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "error",
            content: data.error || "Something went wrong",
            timestamp: new Date().toISOString(),
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: data.pages?.length > 0 
            ? `Generated ${data.pages.length} page${data.pages.length !== 1 ? "s" : ""}`
            : `Generated ${data.components?.length || 0} component${data.components?.length !== 1 ? "s" : ""}`,
          components: data.components,
          pages: data.pages,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "error",
          content: "Failed to connect to AI service. Check your network connection.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Count total components including nested children
  const countComponents = (comps: ComponentDefinition[]): number => {
    let count = 0;
    for (const c of comps) {
      count += 1;
      if (c.children?.length) count += countComponents(c.children);
    }
    return count;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI Builder
          </h3>
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-[10px] bg-card border border-border rounded px-1.5 py-0.5 text-muted-foreground outline-none focus:border-primary/50 max-w-[120px] truncate"
          >
            {AI_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">AI Builder</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Describe what you want to build and I&apos;ll generate the components for you.
            </p>
            <div className="mt-4 space-y-2 w-full">
              {[
                "Build a landing page for a SaaS product",
                "Create a pricing section with 3 tiers",
                "Make a hero with features grid below",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="w-full text-left text-[11px] px-3 py-2 rounded-md border border-border bg-card hover:bg-muted hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
                >
                  &quot;{suggestion}&quot;
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            {/* User message */}
            {msg.role === "user" && (
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <div className="flex-1 bg-muted rounded-lg px-3 py-2">
                  <p className="text-xs text-foreground whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )}

            {/* Assistant message */}
            {msg.role === "assistant" && (
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-purple-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg px-3 py-2">
                    <p className="text-xs text-foreground">{msg.content}</p>
                    {msg.components && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {countComponents(msg.components)} total elements
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  {msg.components && msg.components.length > 0 && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onApplyComponents(msg.components!, "add")}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add to Page
                      </button>
                      <button
                        onClick={() => onApplyComponents(msg.components!, "replace")}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium bg-muted text-foreground rounded-md hover:bg-muted/80 border border-border transition-colors"
                      >
                        <Replace className="w-3 h-3" />
                        Replace Page
                      </button>
                    </div>
                  )}

                  {msg.pages && msg.pages.length > 0 && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onApplyPages && onApplyPages(msg.pages!)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Pages
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error message */}
            {msg.role === "error" && (
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-3 h-3 text-destructive" />
                </div>
                <div className="flex-1 bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                  <p className="text-xs text-destructive">{msg.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-purple-400" />
            </div>
            <div className="flex-1 bg-purple-500/5 border border-purple-500/10 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                <p className="text-xs text-muted-foreground">Generating components...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            rows={1}
            className={cn(
              "flex-1 resize-none text-xs bg-background border border-border rounded-lg px-3 py-2.5",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
              "min-h-[36px] max-h-[120px]"
            )}
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-2.5 rounded-lg transition-colors shrink-0",
              input.trim() && !isLoading
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 ml-0.5">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

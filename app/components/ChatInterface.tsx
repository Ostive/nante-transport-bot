
"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, MapPin, Bus, Sparkles, User } from "lucide-react";
import BusStopsWidget from "./BusStopsWidget";
import { TanStop } from "../lib/tan-service";

const WELCOME_MESSAGE = "Bonjour ! 👋 Je suis votre assistant TAN.\n\nDites-moi où vous souhaitez aller ou donnez-moi une adresse, et je trouverai les arrêts et horaires à proximité !\n\nExemple : \"Arrêts à Gare Sud\" ou \"11 rue Paul Bellamy\". 🚌";

const ChatInterface = () => {
    const [localInput, setLocalInput] = useState("");
    const { messages, status, sendMessage } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    const isLoading = status === 'streaming' || status === 'submitted';

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!localInput.trim() || isLoading) return;

        const userMessage = localInput;
        setLocalInput('');

        sendMessage({ text: userMessage });
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-full w-full bg-white font-sans text-gray-900">
            <header className="p-4 border-b border-gray-100 flex justify-center sticky top-0 bg-white/80 backdrop-blur-md z-10 shadow-sm">
                <div className="font-semibold text-gray-700 flex items-center gap-2">
                    <Bus className="text-[#0064B0]" size={22} />
                    <span className="bg-gradient-to-r from-[#0064B0] to-[#64A70B] bg-clip-text text-transparent font-bold">
                        Nantes Bus Assistant
                    </span>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30">
                <div className="max-w-3xl mx-auto p-4 space-y-6 py-10">
                    {messages.length === 0 && (
                        <div className="flex justify-start w-full gap-2 md:gap-3">
                            <div className="hidden md:flex w-8 h-8 rounded-full bg-white border border-gray-200 items-center justify-center shrink-0 shadow-sm">
                                <Sparkles size={14} className="text-[#0064B0]" />
                            </div>
                            <div className="max-w-[88%] md:max-w-xl px-5 py-3.5 shadow-sm transition-all duration-200 hover:shadow-md bg-white border border-gray-100/80 text-gray-700 rounded-[20px] rounded-tl-[4px]">
                                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">{WELCOME_MESSAGE}</div>
                            </div>
                        </div>
                    )}
                    {messages.map((m, index) => (
                        <div
                            key={m.id || index}
                            className={`flex w-full gap-2 md:gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {m.role === 'assistant' && (
                                <div className="hidden md:flex w-8 h-8 rounded-full bg-white border border-gray-200 items-center justify-center shrink-0 shadow-sm">
                                    <Sparkles size={14} className="text-[#0064B0]" />
                                </div>
                            )}
                            <div
                                className={`max-w-[88%] md:max-w-xl px-5 py-3.5 shadow-sm transition-all duration-200 hover:shadow-md ${
                                    m.role === "user"
                                        ? "bg-gradient-to-br from-[#0064B0] to-[#004e8a] text-white rounded-[20px] rounded-br-[4px]"
                                        : "bg-white border border-gray-100/80 text-gray-700 rounded-[20px] rounded-tl-[4px]"
                                }`}
                            >
                                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                                    {m.parts.map((part, partIndex) => {
                                        if (part.type === 'text') {
                                            return (
                                                <div key={partIndex} className="my-2">
                                                    {part.text}
                                                </div>
                                            );
                                        }

                                        if (part.type === 'tool-getBusStops') {
                                            const callId = part.toolCallId;
                                            const isNotFirstTool = partIndex > 0 && m.parts.slice(0, partIndex).some(p => p.type === 'tool-getBusStops' && p.state === 'output-available');
                                            const hasNoTextBefore = !m.parts.slice(0, partIndex).some(p => p.type === 'text' && p.text.trim());

                                            switch (part.state) {
                                                case 'input-streaming':
                                                case 'input-available':
                                                    return (
                                                        <div key={callId} className="mt-2 text-xs text-gray-400 flex items-center gap-2 animate-pulse">
                                                            <MapPin size={12} /> Recherche des arrêts...
                                                        </div>
                                                    );
                                                case 'output-available': {
                                                    const output = part.output as { found: boolean; stops?: TanStop[]; error?: string };

                                                    if (output.found && output.stops) {
                                                        return (
                                                            <div key={callId}>
                                                                {!isNotFirstTool && hasNoTextBefore && (
                                                                    <div className="mb-3 text-sm text-gray-600">
                                                                        Voici les arrêts à proximité :
                                                                    </div>
                                                                )}
                                                                {isNotFirstTool && (
                                                                    <div className="my-6 border-t border-gray-200"></div>
                                                                )}
                                                                <div className="mt-4">
                                                                    <BusStopsWidget stops={output.stops} />
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (!output.found) {
                                                        return (
                                                            <div key={callId} className="mt-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                                                {output.error || "Aucun arrêt trouvé à cette adresse."}
                                                            </div>
                                                        );
                                                    }
                                                    break;
                                                }
                                                case 'output-error':
                                                    return (
                                                        <div key={callId} className="mt-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                                            Erreur: {part.errorText}
                                                        </div>
                                                    );
                                            }
                                        }

                                        return null;
                                    })}
                                </div>
                            </div>

                            {m.role === 'user' && (
                                <div className="hidden md:flex w-8 h-8 rounded-full bg-gray-200 items-center justify-center shrink-0">
                                    <User size={14} className="text-gray-500" />
                                </div>
                            )}
                        </div>
                    ))}


                    {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                        <div className="flex justify-start w-full gap-3">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                <Sparkles size={14} className="text-[#0064B0]" />
                            </div>
                            <div className="bg-white border border-gray-100 p-4 rounded-[20px] rounded-tl-sm shadow-sm flex items-center gap-2 text-gray-400">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-0"></div>
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-300"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={scrollRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="max-w-3xl mx-auto">
                    <form
                        onSubmit={handleFormSubmit}
                        className={`flex items-center gap-3 bg-gray-50 rounded-full px-2 py-2 border border-gray-200 transition-all ${
                            isLoading ? 'opacity-60 cursor-not-allowed' : 'focus-within:ring-2 focus-within:ring-[#0064B0]/20 focus-within:bg-white'
                        }`}
                    >
                        <div className="pl-3">
                            <MapPin size={20} className="text-gray-400" />
                        </div>
                        <input
                            className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 text-[15px] disabled:cursor-not-allowed"
                            placeholder={isLoading ? "L'assistant écrit..." : "Ex: 11 rue Paul Bellamy..."}
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            title="Envoyer le message"
                            className="w-10 h-10 flex items-center justify-center bg-[#0064B0] rounded-full text-white hover:bg-[#00509d] transition-all disabled:opacity-50 shadow-md hover:shadow-lg active:scale-95 transform duration-100"
                            disabled={!localInput.trim() || isLoading}
                        >
                            <Send size={18} className="-ml-0.5 mt-0.5" />
                        </button>
                    </form>
                    <div className="text-center text-[11px] text-gray-400 mt-3 font-medium">
                        Propulsé par Nantes Métropole Open Data & AI
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;

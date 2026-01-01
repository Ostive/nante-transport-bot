import React, { useState } from "react";
import { cn } from "../lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

import { TanStop } from "../lib/tan-service";

interface BusStopsWidgetProps {
    stops?: TanStop[];
}

const getLineColor = (num: string) => {
    const n = num.toUpperCase();

    // Tramways
    if (n === '1') return "bg-[#00A453] text-white"; // Line 1: Green
    if (n === '2') return "bg-[#E1000F] text-white"; // Line 2: Red
    if (n === '3') return "bg-[#0057B7] text-white"; // Line 3: Blue

    // Busways
    if (n === '4') return "bg-[#8B008B] text-white"; // Line 4: Purple 
    if (n === '5') return "bg-[#AB0066] text-white"; // Line 5: Violet

    // Chronobus (C1..C20)
    if (n.startsWith('C')) return "bg-[#E37600] text-white"; // Chronobus: Orange/Gold

    // Navibus
    if (n.startsWith('N') && n !== 'NO') return "bg-[#009EE0] text-white"; // Navibus: Blue

    // Night / Luciole
    if (n === 'NO' || n === 'L') return "bg-[#282C35] text-white"; // Dark

    // Standard Bus / Default
    return "bg-[#64A70B] text-white"; // Standard TAN Green
};

const StopCard = ({ stop }: { stop: TanStop }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasManyLines = stop.ligne.length > 5;

    const toggle = () => {
        if (hasManyLines) setIsExpanded(!isExpanded);
    };

    const displayLines = isExpanded ? stop.ligne : stop.ligne.slice(0, 4);

    return (
        <div
            className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex flex-col gap-2 transition-all hover:scale-[1.01] cursor-pointer"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            onClick={toggle}
        >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-[19px] font-extrabold text-[#111] tracking-tight">{stop.libelle}</h3>
                    <p className="text-gray-400 text-[13px] font-medium mt-0.5">{stop.distance} <span className="text-[11px] opacity-70">({stop.codeLieu})</span></p>
                </div>

                <div className="flex gap-2 flex-wrap justify-end max-w-[12rem] md:max-w-[14rem]">
                    {displayLines.map((line, linIdx) => (
                        <div key={linIdx} className="relative group">
                            <div
                                className={cn(
                                    "w-[34px] h-[34px] rounded-full flex items-center justify-center text-white text-[13px] font-bold shadow-sm tracking-tighter cursor-help",
                                    getLineColor(line.numLigne)
                                )}
                            >
                                {line.numLigne}
                            </div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max">
                                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg relative">
                                    Ligne {line.numLigne}
                                    <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {hasManyLines && !isExpanded && (
                        <div className="relative group">
                            <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center bg-gray-100 text-gray-500 text-[12px] font-bold border border-gray-200 shadow-sm hover:bg-gray-200 transition-colors">
                                +{stop.ligne.length - 4}
                            </div>
                            {/* Tooltip Voir plus */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max">
                                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg relative">
                                    Voir plus
                                    <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isExpanded && (
                        <div className="relative group">
                            <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-600 border border-gray-100 hover:bg-gray-100 transition-colors">
                                <ChevronUp size={16} />
                            </div>
                            {/* Tooltip Réduire */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max">
                                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg relative">
                                    Réduire
                                    <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const BusStopsWidget = ({ stops = [] }: BusStopsWidgetProps) => {
    if (!stops || stops.length === 0) return null;

    return (
        <div className="flex flex-col gap-3 w-full max-w-sm md:max-w-lg mt-2 font-sans">
            {stops.map((stop, idx) => (
                <StopCard key={stop.codeLieu || idx} stop={stop} />
            ))}
        </div>
    );
};

export default BusStopsWidget;

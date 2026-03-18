import { createRoot } from "react-dom/client";
import { useState, useEffect, useCallback } from "react";
import { SearchConfig, DEFAULT_CONFIG, loadConfig, saveConfig } from "../lib/config";

function Slider({
  label,
  description,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const display = format ? format(value) : value.toString();
  return (
    <div className="py-4 border-b border-[#1a1a1a]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-mono text-white/80">{label}</span>
        <span className="text-sm font-mono text-white/50 bg-[#111] px-2 py-0.5 rounded border border-[#222]">
          {display}
        </span>
      </div>
      <p className="text-[11px] font-mono text-white/25 mb-3">{description}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-white/60 h-1 bg-[#222] rounded-full appearance-none cursor-pointer"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-mono text-white/15">{min}</span>
        <span className="text-[10px] font-mono text-white/15">{max}</span>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="py-4 border-b border-[#1a1a1a]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-mono text-white/80">{label}</span>
          <p className="text-[11px] font-mono text-white/25 mt-0.5">{description}</p>
        </div>
        <button
          onClick={() => onChange(!value)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            value ? "bg-white/30" : "bg-[#222]"
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              value ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function Options() {
  const [config, setConfig] = useState<SearchConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig().then(setConfig);
  }, []);

  const update = useCallback((partial: Partial<SearchConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    await saveConfig(config);
    setSaved(true);
    // Notify background to rebuild index with new config
    chrome.runtime.sendMessage({ type: "CONFIG_UPDATED" });
    setTimeout(() => setSaved(false), 2000);
  }, [config]);

  const handleReset = useCallback(async () => {
    setConfig(DEFAULT_CONFIG);
    await saveConfig(DEFAULT_CONFIG);
    chrome.runtime.sendMessage({ type: "CONFIG_UPDATED" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-lg mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <img src="icon48.png" alt="Sourcer" className="w-8 h-8" />
          <div>
            <h1 className="text-lg font-mono font-medium text-white/90">Sourcer</h1>
            <p className="text-[11px] font-mono text-white/30">Search configuration</p>
          </div>
        </div>

        {/* Search Settings */}
        <div className="mb-6">
          <h2 className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-2">
            Fuzzy Search
          </h2>
          <div className="bg-[#0d0d0d] rounded-lg border border-[#1a1a1a] px-4">
            <Slider
              label="Fuzziness"
              description="How loose the matching is. Lower = stricter exact matches. Higher = more forgiving typos."
              value={config.threshold}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => update({ threshold: v })}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <Slider
              label="Title weight"
              description="How much page titles influence search results."
              value={config.titleWeight}
              min={0}
              max={1}
              step={0.1}
              onChange={(v) => update({ titleWeight: v })}
            />
            <Slider
              label="URL weight"
              description="How much URLs influence search results."
              value={config.urlWeight}
              min={0}
              max={1}
              step={0.1}
              onChange={(v) => update({ urlWeight: v })}
            />
            <Slider
              label="Min characters"
              description="Minimum characters typed before showing results."
              value={config.minMatchCharLength}
              min={1}
              max={5}
              step={1}
              onChange={(v) => update({ minMatchCharLength: v })}
            />
            <Slider
              label="Max results"
              description="Maximum number of results to display."
              value={config.maxResults}
              min={3}
              max={20}
              step={1}
              onChange={(v) => update({ maxResults: v })}
            />
            <Toggle
              label="Ignore location"
              description="Match keywords anywhere in the string equally, not just near the start."
              value={config.ignoreLocation}
              onChange={(v) => update({ ignoreLocation: v })}
            />
          </div>
        </div>

        {/* Data Settings */}
        <div className="mb-8">
          <h2 className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-2">
            Data
          </h2>
          <div className="bg-[#0d0d0d] rounded-lg border border-[#1a1a1a] px-4">
            <Slider
              label="History range"
              description="How many months of browsing history to index."
              value={config.historyMonths}
              min={1}
              max={24}
              step={1}
              onChange={(v) => update({ historyMonths: v })}
              format={(v) => `${v} mo`}
            />
            <Slider
              label="Max history items"
              description="Maximum number of history entries to keep in the index."
              value={config.historyMaxItems}
              min={1000}
              max={50000}
              step={1000}
              onChange={(v) => update({ historyMaxItems: v })}
              format={(v) => v.toLocaleString()}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-mono bg-white text-black rounded-md hover:bg-white/90 transition-colors"
          >
            {saved ? "Saved" : "Save"}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2 text-sm font-mono text-white/40 bg-[#111] rounded-md border border-[#222] hover:text-white/60 hover:border-[#333] transition-colors"
          >
            Reset defaults
          </button>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<Options />);

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DEFAULT_CUSTOM, STYLE_LIST } from './data/styles';
import { createSavedFormat, normalizeCustom, normalizeDocData, readSavedFormats, writeSavedFormats } from './lib/formats';
import { LEGACY_STYLE_MAP, type LayoutCustom, type SavedFormat, type StyleId } from './types/doc';
import StyleGallery from './components/docs/StyleGallery';
import Studio from './components/docs/Studio';
import './styles/sheets.css';

const DATA_KEY = 'macau-docs-data';
const CUSTOM_KEY = 'macau-docs-custom';
const STYLE_KEY = 'macau-docs-style';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readStyle(raw: unknown): StyleId | null {
  if (typeof raw !== 'string') return null;
  if (STYLE_LIST.some((s) => s.id === raw)) return raw as StyleId;
  return LEGACY_STYLE_MAP[raw] || null;
}

function customForStyle(styleId: StyleId | null, base: LayoutCustom): LayoutCustom {
  const meta = STYLE_LIST.find((s) => s.id === styleId);
  if (!meta || styleId === 'custom') return base;
  return {
    ...base,
    accent: meta.accent,
    paper: meta.paper,
    ink: meta.ink,
  };
}

export default function App() {
  const [step, setStep] = useState<'gallery' | 'studio'>('gallery');
  const [styleId, setStyleId] = useState<StyleId | null>(() => readStyle(readJson(STYLE_KEY, null)));
  const [custom, setCustom] = useState<LayoutCustom>(() =>
    customForStyle(readStyle(readJson(STYLE_KEY, null)), normalizeCustom(readJson(CUSTOM_KEY, DEFAULT_CUSTOM))),
  );
  const [data, setData] = useState(() => normalizeDocData(readJson(DATA_KEY, null)));
  const [formats, setFormats] = useState<SavedFormat[]>(() => readSavedFormats());
  const [appliedFormatId, setAppliedFormatId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
  }, [custom]);

  useEffect(() => {
    if (styleId) localStorage.setItem(STYLE_KEY, JSON.stringify(styleId));
  }, [styleId]);

  const pickStyle = (id: StyleId) => {
    const meta = STYLE_LIST.find((s) => s.id === id);
    setAppliedFormatId(null);
    setStyleId(id);
    if (meta) {
      setCustom((prev) => ({
        ...prev,
        accent: meta.accent,
        paper: meta.paper,
        ink: meta.ink,
      }));
    }
  };

  const persistFormats = (next: SavedFormat[]) => {
    setFormats(next);
    writeSavedFormats(next);
  };

  const applyFormat = (id: string) => {
    const item = formats.find((f) => f.id === id);
    if (!item) return;
    setAppliedFormatId(item.id);
    setStyleId(item.styleId);
    setCustom(normalizeCustom(item.custom));
  };

  const saveFormat = (name: string) => {
    if (!styleId) return;
    persistFormats([createSavedFormat(name, styleId, custom), ...formats]);
  };

  const deleteFormat = (id: string) => {
    persistFormats(formats.filter((item) => item.id !== id));
    if (appliedFormatId === id) setAppliedFormatId(null);
  };

  const enterStudio = () => {
    if (!styleId) return;
    setStep('studio');
  };

  return (
    <div className="min-h-screen bg-[#e6e6e6] text-neutral-900">
      <header className="sticky top-0 z-20 border-b border-neutral-300 bg-[#efefef]/95 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <button type="button" onClick={() => setStep('gallery')} className="text-left">
            <div className="text-[10px] tracking-[0.24em] uppercase text-neutral-500">Macau SAR</div>
            <div className="font-medium tracking-wide">澳門單據</div>
          </button>
          <div className="hidden md:block text-[12px] text-neutral-500">
            電子報價單 · 發票 · 收據　同一風格成套輸出
          </div>
          {step === 'gallery' && (
            <button
              type="button"
              disabled={!styleId}
              onClick={enterStudio}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white px-4 py-2 text-[13px] disabled:opacity-40"
            >
              填寫內容
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {step === 'gallery' ? (
        <main className="max-w-[1600px] mx-auto px-5 py-8">
          <div className="max-w-2xl mb-8">
            <h1 className="text-3xl md:text-4xl tracking-tight text-neutral-900">
              先選模版，再填內容。
            </h1>
            <p className="text-neutral-500 mt-3 text-[15px] leading-relaxed">
              十款目前最常用的報價／發票排版。選定後，報價單、發票與收據自動共用同一風格，金額即時合計，可輸出 JPG 或 PDF。
            </p>
          </div>
          <StyleGallery
            selected={styleId}
            custom={custom}
            onSelect={pickStyle}
            formats={formats}
            appliedFormatId={appliedFormatId}
            onApplyFormat={applyFormat}
            onDeleteFormat={deleteFormat}
          />
          {styleId && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={enterStudio}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white px-6 py-3 text-[14px]"
              >
                使用「{STYLE_LIST.find((s) => s.id === styleId)?.name}」開始填寫
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      ) : (
        styleId && (
          <Studio
            styleId={styleId}
            custom={custom}
            data={data}
            formats={formats}
            onCustomChange={setCustom}
            onDataChange={setData}
            onChangeStyle={() => setStep('gallery')}
            onSaveFormat={saveFormat}
            onApplyFormat={applyFormat}
            onDeleteFormat={deleteFormat}
          />
        )
      )}
    </div>
  );
}

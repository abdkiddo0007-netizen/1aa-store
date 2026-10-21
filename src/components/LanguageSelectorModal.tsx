import { 
  Globe, 
  Check, 
  X, 
  Sparkles,
  Lock
} from "lucide-react";
import { 
  LanguageCode, 
  SUPPORTED_LANGUAGES, 
  LanguageMeta,
  getTranslation
} from "../utils/translations";
import { haptics } from "../utils/haptics";

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (code: LanguageCode) => void;
}

export default function LanguageSelectorModal({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage
}: LanguageSelectorModalProps) {
  if (!isOpen) return null;

  const t = (key: string) => getTranslation(key, currentLanguage);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          haptics.light();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-obsidian-900 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                {t("selectLanguageTitle")}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {t("selectLanguageSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Language Info Badge */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2.5 text-xs text-slate-300">
          <Lock className="w-4 h-4 text-brand-orange shrink-0" />
          <span>
            <strong>System Base Language:</strong> English is locked as the primary standard. You can explore and operate 1AA in your native regional Indian language.
          </span>
        </div>

        {/* Languages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {SUPPORTED_LANGUAGES.map((lang: LanguageMeta) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  haptics.selection();
                  onSelectLanguage(lang.code);
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                  isSelected
                    ? "bg-gradient-to-br from-brand-orange/20 to-amber-500/20 border-brand-orange text-white shadow-glow-orange scale-[1.02]"
                    : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-slate-300 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg">{lang.flag}</span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-brand-orange text-obsidian-950 flex items-center justify-center text-[10px] font-black">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight text-white">
                    {lang.nativeName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {lang.label} {lang.code === "en" ? "(Default)" : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
          <span>All 11 Official Indian Regional Languages Supported</span>
        </div>

      </div>
    </div>
  );
}

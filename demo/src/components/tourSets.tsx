"use client";
import { Step } from "../../../src/components/GuideLoop/types";
import { ThemeConfig } from "../../../src/themes/types";
import React from "react";

// ==================== TOUR SETS ====================

export const basicTour: Step[] = [
  {
    target: "#help-button",
    title: "Yardım ve Destek",
    content: "Herhangi bir sorunuz olduğunda yardım merkezine buradan ulaşabilirsiniz.",
    placement: "bottom",
  },
  {
    target: "#search-bar",
    title: "Hızlı Arama",
    content: "Tüm içeriklerde arama yapabilirsiniz. Filtreleme seçenekleri için tıklayın.",
    placement: "bottom",
  },
  {
    target: "#tab-section",
    title: "Ana Menü",
    content: "Tüm bölümlere buradan hızlıca erişebilirsiniz.",
    placement: "right",
  },
  {
    target: "#stats-section",
    title: "İstatistikler",
    content: "Projenizin güncel istatistiklerini buradan takip edebilirsiniz.",
    placement: "bottom",
  },
  {
    target: "#notifications",
    title: "Bildirimler",
    content: "Yeni bildirimleri buradan görüntüleyebilirsiniz.",
    placement: "bottom",
  },
];

export const buttonCustomTour: Step[] = [
  {
    target: "#help-button",
    title: "Özel Buton Labels",
    content: "Buton yazıl tamamen özelleştirilebilir. Next, Prev, Skip, Finish yazılarını değiştirebilirsiniz.",
    placement: "bottom",
    showButtons: { next: true, previous: false, close: true },
  },
  {
    target: "#search-bar",
    title: "Buton Gizleme",
    content: "showButtons ile hangi butonların görüneceğini kontrol edebilirsiniz.",
    placement: "bottom",
    showButtons: { next: true, previous: false, close: true },
  },
  {
    target: "#tab-section",
    title: "Sadece Kapat",
    content: "Bu step'te sadece Close butonu görünüyor.",
    placement: "right",
    showButtons: { next: false, previous: false, close: true },
  },
  {
    target: "#notifications",
    title: "Özel Buton ReactNode",
    content: "Butonlar tamamen ReactNode olarak özelleştirilebilir. Aşağıdaki butonlar özel stilli ReactNode'lardır.",
    placement: "bottom",
    showButtons: { next: true, previous: true, close: true },
    buttons: {
      prev: (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
          ← Geri
        </span>
      ),
      next: (
        <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow">
          Devam Et →
        </span>
      ),
      close: (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100">
          ✕
        </span>
      ),
    },
  },
];

export const actionsTour: Step[] = [
  {
    target: "#help-button",
    title: "nextButtonClickElementId",
    content: "Next butonuna tıklandığında belirli bir elementin click eventi tetiklenebilir.",
    placement: "bottom",
    nextButtonClickElementId: "#show-search-features-modal",
  },
  {
    target: "#alertBox",
    title: "ButtonOnClick Callback",
    content: "nextButtonOnClick ile Next butonuna özel callback fonksiyonu çalıştırılabilir.",
    placement: "left",
    nextButtonOnClick: () => {
      console.log("Custom next button clicked!");
    },
  },
  {
    target: "#tab-section",
    title: "Delay",
    content: "nextDelay ile butona basıldıktan sonra belirli bir süre bekleyip sonraki adıma geçebilirsiniz.",
    placement: "right",
    nextDelay: 1000,
  },
  {
    target: "#notifications",
    title: "Element Click Trigger",
    content: "skipButtonClickElementId ile Skip butonu başka bir elementi tetikler.",
    placement: "bottom",
    skipButtonClickElementId: "#show-search-features-modal",
  },
];

export const hooksTour: Step[] = [
  {
    target: "#help-button",
    title: "beforeStep Hook",
    content: "Adıma geçmeden önce async/await ile veri yükleme, animasyon başlatma etc.",
    placement: "bottom",
    beforeStep: async () => {
      console.log("beforeStep: Step'e geçiliyor...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("beforeStep: 500ms beklendi, step başlıyor!");
    },
  },
  {
    target: "#search-bar",
    title: "afterStep Hook",
    content: "Step tamamlandıktan sonra çalışacak callback fonksiyon.",
    placement: "bottom",
    afterStep: () => {
      console.log("afterStep: Bu step tamamlandı!");
    },
  },
  {
    target: "#tab-section",
    title: "Condition",
    content: "condition fonksiyonu false döndüğünde bu step atlanır.",
    placement: "right",
    condition: () => {
      // Her zaman true dönsün, demo için
      console.log("condition: true - step gösteriliyor");
      return true;
    },
  },
  {
    target: "#stats-section",
    title: "Condition false",
    content: "Bu step condition:false olduğu için gösterilmeyecek (atlandı).",
    placement: "bottom",
    condition: () => false,
  },
  {
    target: "#notifications",
    title: "Async Hooks",
    content: "beforeStep ve afterStep birlikte kullanıldığında tam yaşam döngüsü kontrolü sağlar.",
    placement: "bottom",
    beforeStep: async () => {
      console.log("beforeStep: Async veri yükleme...");
    },
    afterStep: async () => {
      console.log("afterStep: Async temizlik...");
    },
  },
];

export const imageTour: Step[] = [
  {
    target: "#help-button",
    title: "Image Content",
    content: "Tooltip içinde image veya SVG içerik gösterilebilir.",
    placement: "bottom",
    image: {
      type: "image",
      src: "/guideloop-logo.svg",
      alt: "GuideLoop Logo",
      width: 120,
      height: 40,
    },
  },
  {
    target: "#search-bar",
    title: "SVG Component",
    content: "SVG component olarak doğrudan ReactNode olarak verilebilir.",
    placement: "bottom",
    image: {
      type: "svg",
      component: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      ),
      width: 64,
      height: 64,
    },
  },
  {
    target: "#tab-section",
    title: "Icon Content",
    content: "icon prop ile tooltip'e ikon eklenebilir.",
    placement: "right",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
];

export const dynamicTour: Step[] = [
  {
    target: "#help-button",
    title: "Modal Tetikleme",
    content: "Next butonuna basıldığında modal açılır. nextButtonClickElementId ile element click tetiklenir.",
    placement: "bottom",
    nextButtonClickElementId: "#show-search-features-modal",
  },
  {
    target: "#alertBox",
    title: "Dynamic Content",
    content: "Modal içindeki elementlere yönlendirme yapılabilir. İleri dediğinizde modal kapanır.",
    placement: "left",
    showButtons: { next: true, previous: true, close: true },
  },
  {
    target: "#tab-section",
    title: "Tab Menü",
    content: "Tab menüsündeki elementlere adım adım rehberlik.",
    placement: "right",
  },
  {
    target: "#stats-section",
    title: "Kartlar",
    content: "Dashboard kartları üzerinde rehberlik.",
    placement: "bottom",
  },
  {
    target: "#table-section",
    title: "Tablo",
    content: "Tablo verileri ve satır içi aksiyonlar için rehberlik.",
    placement: "top",
  },
  {
    target: "#form-section",
    title: "Form",
    content: "Form elementleri için adım adım rehberlik.",
    placement: "top",
  },
];

export const allPlacementsTour: Step[] = [
  {
    target: "#help-button",
    title: "placement: bottom",
    content: "Tooltip hedefin altında gösterilir.",
    placement: "bottom",
  },
  {
    target: "#search-bar",
    title: "placement: top",
    content: "Tooltip hedefin üstünde gösterilir.",
    placement: "top",
  },
  {
    target: "#tab-section",
    title: "placement: right",
    content: "Tooltip hedefin sağında gösterilir.",
    placement: "right",
  },
  {
    target: "#stats-section",
    title: "placement: left",
    content: "Tooltip hedefin solunda gösterilir.",
    placement: "left",
  },
  {
    target: "#notifications",
    title: "placement: auto",
    content: "Popper.js otomatik olarak en uygun konumu seçer.",
    placement: "auto",
  },
];

export const customThemeTour: Step[] = [
  {
    target: "#help-button",
    title: "Custom Theme",
    content: "customTheme prop ile tamamen farklı bir tema oluşturulabilir. Bu step'te kırmızı tema kullanılıyor.",
    placement: "bottom",
  },
  {
    target: "#search-bar",
    title: "Renk Özelleştirme",
    content: "Tooltip, overlay, spotlight ve buton renkleri tamamen özelleştirilebilir.",
    placement: "bottom",
  },
  {
    target: "#tab-section",
    title: "Tema Geçişi",
    content: "Settings panelinden tema değiştirerek farkı görebilirsiniz.",
    placement: "right",
  },
];

// ==================== TOUR SET REGISTRY ====================

export interface TourSet {
  id: string;
  label: string;
  description: string;
  steps: Step[];
  category: "basic" | "buttons" | "actions" | "hooks" | "content" | "dynamic" | "theming";
}

export const tourSets: TourSet[] = [
  {
    id: "basic",
    label: "Temel Tour",
    description: "Basit adım adım rehberlik",
    steps: basicTour,
    category: "basic",
  },
  {
    id: "button-custom",
    label: "Buton Özelleştirme",
    description: "Buton label'ları ve görünürlük kontrolü",
    steps: buttonCustomTour,
    category: "buttons",
  },
  {
    id: "actions",
    label: "Actions & Events",
    description: "Click tetikleme, callback, delay",
    steps: actionsTour,
    category: "actions",
  },
  {
    id: "hooks",
    label: "Hooks & Conditions",
    description: "beforeStep/afterStep, condition-based steps",
    steps: hooksTour,
    category: "hooks",
  },
  {
    id: "image",
    label: "Image & SVG",
    description: "Tooltip içinde image/SVG/icon içerik",
    steps: imageTour,
    category: "content",
  },
  {
    id: "dynamic",
    label: "Dynamic Content",
    description: "Modal, tab, form gibi dinamik elementler",
    steps: dynamicTour,
    category: "dynamic",
  },
  {
    id: "all-placements",
    label: "Tüm Placement'ler",
    description: "Her yön için placement gösterimi",
    steps: allPlacementsTour,
    category: "basic",
  },
  {
    id: "custom-theme",
    label: "Custom Theme",
    description: "Özel tema ile gösterim",
    steps: customThemeTour,
    category: "theming",
  },
];

// ==================== THEME VARIANTS ====================

export interface ThemeVariant {
  name: string;
  label: string;
  config: Partial<ThemeConfig>;
}

export const themeVariants: Record<string, ThemeVariant[]> = {
  tailwind: [
    {
      name: "default",
      label: "Varsayilan",
      config: {},
    },
    {
      name: "minimal",
      label: "Minimal",
      config: {
        tooltip: {
          background: "#f9fafb",
          textColor: "#111827",
          borderRadius: "4px",
          padding: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        buttons: {
          primary: {
            background: "#2563EB",
            textColor: "white",
            hoverBackground: "#1D4ED8",
            padding: "6px 14px",
          },
          secondary: {
            background: "transparent",
            textColor: "#6B7280",
            hoverBackground: "#F9FAFB",
            padding: "6px 14px",
          },
        },
      },
    },
    {
      name: "bold",
      label: "Kalin",
      config: {
        tooltip: {
          background: "#1e40af",
          textColor: "#ffffff",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 20px 60px rgba(37, 99, 235, 0.3)",
        },
        spotlight: {
          borderColor: "#1e40af",
          borderWidth: "3px",
          borderRadius: "8px",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        },
        buttons: {
          primary: {
            background: "#ffffff",
            textColor: "#1e40af",
            hoverBackground: "#eff6ff",
            padding: "8px 20px",
          },
          secondary: {
            background: "transparent",
            textColor: "#bfdbfe",
            hoverBackground: "rgba(255,255,255,0.1)",
            padding: "8px 20px",
          },
        },
      },
    },
  ],
  material: [
    {
      name: "default",
      label: "Varsayilan",
      config: {},
    },
    {
      name: "elevated",
      label: "Yukseltilmis",
      config: {
        tooltip: {
          background: "white",
          textColor: "rgba(0, 0, 0, 0.87)",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0px 8px 10px -5px rgba(0,0,0,0.3), 0px 20px 40px rgba(0,0,0,0.15)",
        },
        spotlight: {
          borderColor: "#1565C0",
          borderWidth: "3px",
          borderRadius: "8px",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        },
      },
    },
    {
      name: "dense",
      label: "Yogun",
      config: {
        tooltip: {
          background: "white",
          textColor: "rgba(0, 0, 0, 0.87)",
          borderRadius: "2px",
          padding: "8px",
          boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.2)",
        },
        buttons: {
          primary: {
            background: "#1976D2",
            textColor: "white",
            hoverBackground: "#1565C0",
            padding: "4px 10px",
          },
          secondary: {
            background: "transparent",
            textColor: "rgba(0, 0, 0, 0.87)",
            hoverBackground: "rgba(0, 0, 0, 0.04)",
            padding: "4px 10px",
          },
        },
      },
    },
  ],
  antd: [
    {
      name: "default",
      label: "Varsayilan",
      config: {},
    },
    {
      name: "compact",
      label: "Kompakt",
      config: {
        tooltip: {
          background: "#ffffff",
          textColor: "rgba(0, 0, 0, 0.85)",
          borderRadius: "2px",
          padding: "12px",
          boxShadow: "0 3px 6px -4px rgba(0,0,0,0.12)",
        },
        spotlight: {
          borderColor: "#1890ff",
          borderWidth: "2px",
          borderRadius: "2px",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        },
      },
    },
    {
      name: "comfortable",
      label: "Rahat",
      config: {
        tooltip: {
          background: "#ffffff",
          textColor: "rgba(0, 0, 0, 0.85)",
          borderRadius: "8px",
          padding: "28px",
          boxShadow: "0 6px 16px -8px rgba(0,0,0,0.15), 0 9px 28px rgba(0,0,0,0.1)",
        },
        overlay: {
          background: "#000000",
          opacity: 0.5,
        },
      },
    },
  ],
  custom: [
    {
      name: "red",
      label: "Kirmizi",
      config: {
        tooltip: {
          background: "#dc2626",
          textColor: "#ffffff",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 10px 40px rgba(220, 38, 38, 0.4)",
        },
        overlay: { background: "#000000", opacity: 0.6 },
        spotlight: {
          borderColor: "#dc2626",
          borderWidth: "3px",
          borderRadius: "8px",
          animation: "pulse 2s infinite",
        },
        buttons: {
          primary: {
            background: "#ffffff",
            textColor: "#dc2626",
            hoverBackground: "#fef2f2",
            padding: "8px 20px",
          },
          secondary: {
            background: "transparent",
            textColor: "#ffffff",
            hoverBackground: "rgba(255,255,255,0.1)",
            padding: "8px 20px",
          },
        },
      },
    },
    {
      name: "dark",
      label: "Karanlik",
      config: {
        tooltip: {
          background: "#111827",
          textColor: "#f9fafb",
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
        },
        overlay: { background: "#000000", opacity: 0.7 },
        spotlight: {
          borderColor: "#8b5cf6",
          borderWidth: "2px",
          borderRadius: "8px",
          animation: "pulse 2s infinite",
        },
        buttons: {
          primary: {
            background: "#8b5cf6",
            textColor: "#ffffff",
            hoverBackground: "#7c3aed",
            padding: "8px 20px",
          },
          secondary: {
            background: "transparent",
            textColor: "#d1d5db",
            hoverBackground: "rgba(255,255,255,0.05)",
            padding: "8px 20px",
          },
        },
      },
    },
    {
      name: "green",
      label: "Yesil",
      config: {
        tooltip: {
          background: "#059669",
          textColor: "#ffffff",
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "0 10px 40px rgba(5, 150, 105, 0.4)",
        },
        overlay: { background: "#000000", opacity: 0.5 },
        spotlight: {
          borderColor: "#10b981",
          borderWidth: "3px",
          borderRadius: "12px",
          animation: "pulse 2s infinite",
        },
        buttons: {
          primary: {
            background: "#ffffff",
            textColor: "#059669",
            hoverBackground: "#ecfdf5",
            padding: "8px 20px",
          },
          secondary: {
            background: "transparent",
            textColor: "#ffffff",
            hoverBackground: "rgba(255,255,255,0.1)",
            padding: "8px 20px",
          },
        },
      },
    },
    {
      name: "orange",
      label: "Turuncu",
      config: {
        tooltip: {
          background: "#ea580c",
          textColor: "#ffffff",
          borderRadius: "4px",
          padding: "16px",
          boxShadow: "0 10px 40px rgba(234, 88, 12, 0.4)",
        },
        overlay: { background: "#000000", opacity: 0.6 },
        spotlight: {
          borderColor: "#f97316",
          borderWidth: "2px",
          borderRadius: "4px",
          animation: "pulse 2s infinite",
        },
        buttons: {
          primary: {
            background: "#ffffff",
            textColor: "#ea580c",
            hoverBackground: "#fff7ed",
            padding: "8px 20px",
          },
          secondary: {
            background: "transparent",
            textColor: "#ffffff",
            hoverBackground: "rgba(255,255,255,0.1)",
            padding: "8px 20px",
          },
        },
      },
    },
  ],
};

// ==================== ANIMATION PRESETS ====================

export interface AnimationPreset {
  name: string;
  label: string;
  config: {
    tooltip: { enter: string; exit: string; duration: number };
  };
}

export const animationPresets: AnimationPreset[] = [
  {
    name: "subtle",
    label: "Subtle",
    config: {
      tooltip: { enter: "fade-in 0.5s ease-out", exit: "fade-out 0.5s ease-in", duration: 500 },
    },
  },
  {
    name: "dynamic",
    label: "Dynamic",
    config: {
      tooltip: { enter: "scale-in 0.3s ease-out", exit: "scale-out 0.2s ease-in", duration: 300 },
    },
  },
  {
    name: "none",
    label: "None",
    config: {
      tooltip: { enter: "fade-in 0.01s ease-out", exit: "fade-out 0.01s ease-in", duration: 10 },
    },
  },
  {
    name: "custom",
    label: "Custom",
    config: {
      tooltip: { enter: "fade-in 0.3s ease-out", exit: "fade-out 0.2s ease-in", duration: 300 },
    },
  },
];

// ==================== BUTTON LABEL PRESETS ====================

export interface ButtonLabelPreset {
  name: string;
  label: string;
  config: { next: string; prev: string; skip: string; finish: string };
}

export const buttonLabelPresets: ButtonLabelPreset[] = [
  {
    name: "turkish",
    label: "Turkce",
    config: { next: "İleri", prev: "Geri", skip: "Atla", finish: "Bitir" },
  },
  {
    name: "english",
    label: "English",
    config: { next: "Next", prev: "Previous", skip: "Skip", finish: "Finish" },
  },
  {
    name: "german",
    label: "Deutsch",
    config: { next: "Weiter", prev: "Zuruck", skip: "Uberspringen", finish: "Beenden" },
  },
  {
    name: "french",
    label: "Francais",
    config: { next: "Suivant", prev: "Precedent", skip: "Passer", finish: "Terminer" },
  },
  {
    name: "custom",
    label: "Custom",
    config: { next: "Next", prev: "Previous", skip: "Skip", finish: "Finish" },
  },
];

// ==================== FEATURE PRESETS ====================

export interface FeaturePreset {
  name: string;
  label: string;
  config: { overlay: boolean; keyboard: boolean; scrollSmooth: boolean };
}

export const featurePresets: FeaturePreset[] = [
  {
    name: "full",
    label: "Full",
    config: { overlay: true, keyboard: true, scrollSmooth: true },
  },
  {
    name: "minimal",
    label: "Minimal",
    config: { overlay: false, keyboard: true, scrollSmooth: false },
  },
  {
    name: "accessibility",
    label: "Accessibility",
    config: { overlay: true, keyboard: true, scrollSmooth: true },
  },
  {
    name: "custom",
    label: "Custom",
    config: { overlay: true, keyboard: true, scrollSmooth: true },
  },
];

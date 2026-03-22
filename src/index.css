@import "tailwindcss";

@theme {
  --color-bg-primary: #0B0B0C;
  --color-bg-secondary: #151517;
  --color-glass: rgba(255, 255, 255, 0.05);
  --color-glass-hover: rgba(255, 255, 255, 0.08);
  --color-border-glass: rgba(255, 255, 255, 0.08);
  --color-accent: #e4e4e7; /* zinc-200 */
  --color-accent-glow: rgba(255, 255, 255, 0.15);
  
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
}

@layer base {
  body {
    @apply bg-bg-primary text-gray-200 font-sans antialiased;
    letter-spacing: 0.01em;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading tracking-tight text-white;
  }
}

@layer components {
  .glass-panel {
    @apply bg-glass backdrop-blur-[18px] border border-border-glass rounded-2xl;
  }
  
  .glass-pill {
    @apply bg-glass backdrop-blur-[18px] border border-border-glass rounded-full transition-all duration-300 ease-out;
  }
  
  .glass-pill:hover:not(:disabled) {
    @apply bg-glass-hover shadow-[0_0_15px_var(--color-accent-glow)] -translate-y-[2px];
  }
  
  .glass-pill:active:not(:disabled) {
    @apply scale-95;
  }
  
  .glass-pill:disabled {
    @apply opacity-40 cursor-not-allowed;
  }
  
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-gray-600;
  }
  
  .markdown-body {
    @apply text-gray-300 leading-relaxed;
  }
  .markdown-body h1, .markdown-body h2, .markdown-body h3 {
    @apply text-white mt-6 mb-3 font-heading;
  }
  .markdown-body h1 { @apply text-2xl; }
  .markdown-body h2 { @apply text-xl; }
  .markdown-body h3 { @apply text-lg; }
  .markdown-body p { @apply mb-4; }
  .markdown-body ul { @apply list-disc pl-5 mb-4 space-y-1; }
  .markdown-body ol { @apply list-decimal pl-5 mb-4 space-y-1; }
  .markdown-body strong { @apply text-white font-semibold; }
  .markdown-body code { @apply bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-gray-300; }
  .markdown-body pre { @apply bg-[#0B0B0C] border border-border-glass p-4 rounded-xl overflow-x-auto mb-4; }
  .markdown-body pre code { @apply bg-transparent p-0 text-gray-300; }
  .markdown-body blockquote { @apply border-l-2 border-gray-500 pl-4 py-1 my-4 text-gray-400 italic; }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
// Top 25 most popular fonts per category for optimal performance
// Based on Google Fonts usage statistics and design trends

export interface PopularFontData {
  name: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  weights: string[];
  popular: boolean;
}

export const POPULAR_FONTS: PopularFontData[] = [
  // Top 25 Sans-Serif Fonts
  {
    name: "Inter",
    category: "sans-serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Roboto",
    category: "sans-serif",
    weights: ["100", "300", "400", "500", "700", "900"],
    popular: true
  },
  {
    name: "Open Sans",
    category: "sans-serif",
    weights: ["300", "400", "500", "600", "700", "800"],
    popular: true
  },
  {
    name: "Montserrat",
    category: "sans-serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Poppins",
    category: "sans-serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Lato",
    category: "sans-serif",
    weights: ["100", "300", "400", "700", "900"],
    popular: true
  },
  {
    name: "Source Sans Pro",
    category: "sans-serif",
    weights: ["200", "300", "400", "600", "700", "900"],
    popular: true
  },
  {
    name: "Nunito",
    category: "sans-serif",
    weights: ["200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Raleway",
    category: "sans-serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Work Sans",
    category: "sans-serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Plus Jakarta Sans",
    category: "sans-serif",
    weights: ["200", "300", "400", "500", "600", "700", "800"],
    popular: true
  },
  {
    name: "DM Sans",
    category: "sans-serif",
    weights: ["400", "500", "700"],
    popular: true
  },
  {
    name: "Outfit",
    category: "sans-serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Manrope",
    category: "sans-serif",
    weights: ["200", "300", "400", "500", "600", "700", "800"],
    popular: true
  },
  {
    name: "Space Grotesk",
    category: "sans-serif",
    weights: ["300", "400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Lexend",
    category: "sans-serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Sora",
    category: "sans-serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800"],
    popular: true
  },
  {
    name: "Urbanist",
    category: "sans-serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Rubik",
    category: "sans-serif",
    weights: ["300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Karla",
    category: "sans-serif",
    weights: ["200", "300", "400", "500", "600", "700", "800"],
    popular: true
  },
  {
    name: "IBM Plex Sans",
    category: "sans-serif",
    weights: ["100", "200", "300", "400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Figtree",
    category: "sans-serif",
    weights: ["300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Red Hat Display",
    category: "sans-serif",
    weights: ["300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Archivo",
    category: "sans-serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Epilogue",
    category: "sans-serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },

  // Top 25 Serif Fonts
  {
    name: "Playfair Display",
    category: "serif",
    weights: ["400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Merriweather",
    category: "serif",
    weights: ["300", "400", "700", "900"],
    popular: true
  },
  {
    name: "Lora",
    category: "serif",
    weights: ["400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Noto Serif",
    category: "serif",
    weights: ["400", "700"],
    popular: true
  },
  {
    name: "Crimson Text",
    category: "serif",
    weights: ["400", "600", "700"],
    popular: true
  },
  {
    name: "Source Serif Pro",
    category: "serif",
    weights: ["200", "300", "400", "600", "700", "900"],
    popular: true
  },
  {
    name: "EB Garamond",
    category: "serif",
    weights: ["400", "500", "600", "700", "800"],
    popular: true
  },
  {
    name: "Cormorant Garamond",
    category: "serif",
    weights: ["300", "400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Libre Baskerville",
    category: "serif",
    weights: ["400", "700"],
    popular: true
  },
  {
    name: "DM Serif Display",
    category: "serif",
    weights: ["400"],
    popular: true
  },
  {
    name: "Bitter",
    category: "serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Prata",
    category: "serif",
    weights: ["400"],
    popular: true
  },
  {
    name: "Domine",
    category: "serif",
    weights: ["400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Bodoni Moda",
    category: "serif",
    weights: ["400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Fraunces",
    category: "serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Noto Serif Display",
    category: "serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Zilla Slab",
    category: "serif",
    weights: ["300", "400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Spectral",
    category: "serif",
    weights: ["200", "300", "400", "500", "600", "700", "800"],
    popular: true
  },
  {
    name: "Newsreader",
    category: "serif",
    weights: ["200", "300", "400", "500", "600", "700", "800"],
    popular: true
  },
  {
    name: "Literata",
    category: "serif",
    weights: ["200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Crimson Pro",
    category: "serif",
    weights: ["200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Rozha One",
    category: "serif",
    weights: ["400"],
    popular: true
  },
  {
    name: "Roboto Slab",
    category: "serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Petrona",
    category: "serif",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Unna",
    category: "serif",
    weights: ["400", "700"],
    popular: true
  },

  // Top 25 Display Fonts
  {
    name: "Bebas Neue",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Abril Fatface",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Righteous",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Fredoka",
    category: "display",
    weights: ["300", "400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Staatliches",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Russo One",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Bungee",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Anton",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Fredericka the Great",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Passion One",
    category: "display",
    weights: ["400", "700", "900"],
    popular: true
  },
  {
    name: "Titan One",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Ultra",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Lilita One",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Creepster",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Bowlby One",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Shrikhand",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Barrio",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Black Ops One",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Monoton",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Rubik Mono One",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Bungee Shade",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Kalam",
    category: "display",
    weights: ["300", "400", "700"],
    popular: true
  },
  {
    name: "Modak",
    category: "display",
    weights: ["400"],
    popular: true
  },
  {
    name: "Teko",
    category: "display",
    weights: ["300", "400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Oswald",
    category: "display",
    weights: ["200", "300", "400", "500", "600", "700"],
    popular: true
  },

  // Top 25 Handwriting Fonts
  {
    name: "Caveat",
    category: "handwriting",
    weights: ["400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Dancing Script",
    category: "handwriting",
    weights: ["400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Pacifico",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Permanent Marker",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Shadows Into Light",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Indie Flower",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Amatic SC",
    category: "handwriting",
    weights: ["400", "700"],
    popular: true
  },
  {
    name: "Satisfy",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Great Vibes",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Kaushan Script",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Cookie",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Lobster Two",
    category: "handwriting",
    weights: ["400", "700"],
    popular: true
  },
  {
    name: "Sacramento",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Homemade Apple",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Rock Salt",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Bad Script",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Comforter",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Architects Daughter",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Patrick Hand",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Courgette",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Yellowtail",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Allura",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Mr Dafoe",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Pinyon Script",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },
  {
    name: "Alex Brush",
    category: "handwriting",
    weights: ["400"],
    popular: true
  },

  // Top 25 Monospace Fonts
  {
    name: "Fira Code",
    category: "monospace",
    weights: ["300", "400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Source Code Pro",
    category: "monospace",
    weights: ["200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "JetBrains Mono",
    category: "monospace",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800"],
    popular: true
  },
  {
    name: "Roboto Mono",
    category: "monospace",
    weights: ["100", "200", "300", "400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Space Mono",
    category: "monospace",
    weights: ["400", "700"],
    popular: true
  },
  {
    name: "IBM Plex Mono",
    category: "monospace",
    weights: ["100", "200", "300", "400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Inconsolata",
    category: "monospace",
    weights: ["200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Ubuntu Mono",
    category: "monospace",
    weights: ["400", "700"],
    popular: true
  },
  {
    name: "DM Mono",
    category: "monospace",
    weights: ["300", "400", "500"],
    popular: true
  },
  {
    name: "Overpass Mono",
    category: "monospace",
    weights: ["300", "400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Anonymous Pro",
    category: "monospace",
    weights: ["400", "700"],
    popular: true
  },
  {
    name: "Cousine",
    category: "monospace",
    weights: ["400", "700"],
    popular: true
  },
  {
    name: "Red Hat Mono",
    category: "monospace",
    weights: ["300", "400", "500", "600", "700"],
    popular: true
  },
  {
    name: "Azeret Mono",
    category: "monospace",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Noto Sans Mono",
    category: "monospace",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    popular: true
  },
  {
    name: "Share Tech Mono",
    category: "monospace",
    weights: ["400"],
    popular: true
  },
  {
    name: "Martian Mono",
    category: "monospace",
    weights: ["100", "200", "300", "400", "500", "600", "700", "800"],
    popular: true
  },
  {
    name: "PT Mono",
    category: "monospace",
    weights: ["400"],
    popular: true
  },
  {
    name: "Courier Prime",
    category: "monospace",
    weights: ["400", "700"],
    popular: true
  },
  {
    name: "B612 Mono",
    category: "monospace",
    weights: ["400", "700"],
    popular: true
  },
  {
    name: "Major Mono Display",
    category: "monospace",
    weights: ["400"],
    popular: true
  },
  {
    name: "Nova Mono",
    category: "monospace",
    weights: ["400"],
    popular: true
  },
  {
    name: "Syne Mono",
    category: "monospace",
    weights: ["400"],
    popular: true
  },
  {
    name: "Cutive Mono",
    category: "monospace",
    weights: ["400"],
    popular: true
  },
  {
    name: "VT323",
    category: "monospace",
    weights: ["400"],
    popular: true
  }
];

// Helper functions
export const FONT_CATEGORIES = [
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'display', label: 'Display' },
  { value: 'handwriting', label: 'Handwriting' },
  { value: 'monospace', label: 'Monospace' }
];

export function getPopularFontsByCategory(category: string): PopularFontData[] {
  return POPULAR_FONTS.filter(font => font.category === category);
}

export function searchPopularFonts(query: string): PopularFontData[] {
  const normalizedQuery = query.toLowerCase();
  return POPULAR_FONTS.filter(font => 
    font.name.toLowerCase().includes(normalizedQuery)
  );
}
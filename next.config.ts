/** @type {import('next').NextConfig} */

/**
 * Content Security Policy (CSP) konfiguration.
 * Syftet är att härda applikationen mot XSS och kodinjektion.
 */
const cspHeader = `
    default-src 'self';
    
    /* 'unsafe-eval' krävs för Next.js interna optimeringar i vissa miljöer.
       'unsafe-inline' tillåter nödvändiga inline-skript.
       Detta belyses i rapporten (sektion 4.3) som en avvägning mellan säkerhet och funktionalitet.
    */
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    
    style-src 'self' 'unsafe-inline';
    
    /* img-src: Tillåter bilder från egna domänen, blob: och data: (för förhandsvisning),
       samt https: för att stödja externa bilder från t.ex. Supabase Storage.
    */
    img-src 'self' blob: data: https:;
    
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';

    /* connect-src: Viktigt för att tillåta trafik till Supabase API.
       wss://*.supabase.co krävs specifikt för att Realtids-chatten (WebSockets) ska fungera.
    */
    connect-src 'self' *.supabase.co wss://*.supabase.co;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig = {
  /**
   * Bildoptimering:
   * remotePatterns tillåter Next.js Image-komponent att optimera bilder
   * lagrade i Supabase Storage (vilket förbättrar LCP-tiden).
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  /**
   * Säkerhetsheaders:
   * Applicerar den definierade CSP-policyn på samtliga rutter i applikationen.
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
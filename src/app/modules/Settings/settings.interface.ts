export interface ISettings {
  title: string;
  taglineBn?: string;
  logoUrl?: string;
  faviconUrl?: string;
  announcement?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  maintenanceMode: boolean;

  // --- 5.3 Native Pixel Integrations ---
  pixels?: {
    ga4?: string;         // GA4 Measurement ID (G-XXXXXXXX)
    fbPixel?: string;     // Meta Pixel ID
    fbCapiToken?: string; // Meta CAPI Access Token
    gtm?: string;         // GTM Container ID (GTM-XXXXXX)
    tiktok?: string;      // TikTok Pixel ID
    clarity?: string;     // Microsoft Clarity Project ID
  };

  // --- 5.1 Script Injection ---
  scripts?: {
    header?: string;  // Injected inside <head>
    body?: string;    // Injected after <body> open tag
    footer?: string;  // Injected before </body>
  };

  // --- 5.2 Server-Side Tracking ---
  taggingServerUrl?: string; // GCP / Stape server-side GTM URL

  // --- 5.4 Mailchimp ---
  mailchimp?: {
    apiKey?: string;
    listId?: string;
  };

  // --- 5.5 Webhooks ---
  webhookUrl?: string;    // Zapier / Make.com webhook endpoint
  debugMode?: boolean;    // Enables dataLayer console logging on the storefront

  // --- 5.6 Domain Verification ---
  domainVerificationToken?: string; // Served at GET /verify/domain

  // --- 7.3 robots.txt Manager ---
  robotsTxt?: string;
}

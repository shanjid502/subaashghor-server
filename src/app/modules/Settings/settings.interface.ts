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
  pixels?: {
    ga4?: string;
    fbPixel?: string;
    gtm?: string;
    tiktok?: string;
  };
  scripts?: {
    header?: string;
    body?: string;
    footer?: string;
  };
}

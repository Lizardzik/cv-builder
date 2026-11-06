import type { CVData } from "@/types/cv";

export interface TemplateDimensions {
  fontSize: number;
  spacing: number;
  h1Size: number;
  h3Size: number;
  subText: number;
  tinyText: number;
  sectionGap: number;
  itemGap: number;
}

export interface Course {
  name: string;
  date?: string;
}

export interface TemplateColors {
  accent: string;
  text: string;
  background: string;
}

export interface PreparedLink {
  label: string;
  cleanUrl: string;
  href: string;
}

export interface TemplateProps {
  data: CVData;
  dimensions: TemplateDimensions;
  colors: TemplateColors;
  validLinks: PreparedLink[];
}

export function stripProtocol(url?: string): string {
  if (!url) return "";
  return url.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function toHref(url?: string): string {
  if (!url) return "#";
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function extractValidLinks(data: CVData): PreparedLink[] {
  return (data.personalInfo?.customLinks || [])
    .filter((link) => link.url && link.url.trim().length > 0)
    .map((link) => ({
      label: link.label?.trim() || "",
      cleanUrl: stripProtocol(link.url),
      href: toHref(link.url),
    }));
}
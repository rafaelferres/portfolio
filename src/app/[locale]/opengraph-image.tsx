import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export const runtime = "nodejs";
export const alt = "Rafael Ferrés — Head of AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getDictionary(isLocale(locale) ? locale : "pt");
  const photo = await readFile(join(process.cwd(), "public", "rafael.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const [bold, regular] = await Promise.all([
    readFile(join(process.cwd(), "assets", "fonts", "Geist-Bold.ttf")),
    readFile(join(process.cwd(), "assets", "fonts", "Geist-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0b0b0a", color: "#f2f0ea", padding: 64, gap: 48, alignItems: "center", fontFamily: "Geist" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 18, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="56" height="56" viewBox="0 0 160 160"><rect width="160" height="160" rx="36" fill="#ff4757" /><g transform="translate(-5 0)" fill="none" stroke="#0b0b0a" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"><path d="M40 115 V45 H70 C82 45 89 53 89 63 C89 73 82 81 70 81 H40" /><path d="M68 81 L90 115" /><path d="M106 115 V45 H130" /><path d="M106 79 H125" /></g></svg>
            <div style={{ fontSize: 22, color: "#ff9aa2", border: "2px solid #ff9aa2", borderRadius: 999, padding: "6px 16px" }}>{t.hero.available}</div>
          </div>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Rafael Ferrés</div>
          <div style={{ fontSize: 34, color: "#ff4757", fontWeight: 700 }}>{t.hero.subtitle}</div>
          <div style={{ display: "flex", gap: 32, marginTop: 18 }}>
            {t.hero.stats.map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 46, fontWeight: 700, color: "#ff4757" }}>{s.value}</div>
                <div style={{ fontSize: 19, color: "#a3a097", width: 190 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={340} height={340} alt="" style={{ borderRadius: 32, border: "4px solid #ff4757", objectFit: "cover", flexShrink: 0 }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: bold, weight: 700, style: "normal" },
        { name: "Geist", data: regular, weight: 400, style: "normal" },
      ],
    }
  );
}

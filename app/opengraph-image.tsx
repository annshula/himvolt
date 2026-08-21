import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

export const alt = `${site.name} — Black Tourmaline Bracelet for Men`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated once at build time, then served as a static asset.
export const dynamic = "force-static";

export default async function OgImage() {
  const band = await readFile(join(process.cwd(), "public/product/cutout/detail-3.png"));
  const bandSrc = `data:image/png;base64,${band.toString("base64")}`;
  const mark = await readFile(join(process.cwd(), "public/logo-512.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08090c",
          padding: "64px 72px",
          position: "relative",
        }}
      >
        {/* volt bloom */}
        <div
          style={{
            position: "absolute",
            width: 900,
            height: 900,
            right: -260,
            top: -180,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(255,91,56,0.42) 0%, rgba(255,91,56,0.06) 45%, rgba(8,9,12,0) 70%)",
            display: "flex",
          }}
        />

        {/* the stone */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bandSrc}
          alt=""
          width={620}
          height={410}
          style={{ position: "absolute", right: 24, bottom: 40, opacity: 0.95 }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} alt="" width={40} height={40} />
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#f4f5f7" }}>
            Him<span style={{ color: "#ff5b38" }}>Volt</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 596 }}>
          <div
            style={{
              display: "flex",
              fontSize: 17,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#ff5b38",
              marginBottom: 22,
            }}
          >
            Black tourmaline collection
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: -3,
              color: "#f4f5f7",
            }}
          >
            Carry your own current.
          </div>
          <div style={{ display: "flex", fontSize: 25, color: "#8b929c", marginTop: 26 }}>
            Free tracked shipping worldwide · 60-day returns
          </div>
        </div>
      </div>
    ),
    size,
  );
}

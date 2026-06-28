const logoAssets = import.meta.glob("../../assets/logo-*.png", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

function resolveLogoAsset(fileName: "logo-icon.png" | "logo-full.png") {
  return logoAssets[`../../assets/${fileName}`] ?? `/src/assets/${fileName}`;
}

export const logoIconSrc = resolveLogoAsset("logo-icon.png");
export const logoFullSrc = resolveLogoAsset("logo-full.png");

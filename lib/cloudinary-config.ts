function normalizeFolder(folder: string | undefined) {
  const normalized = folder?.trim().replace(/^\/+|\/+$/g, "")

  return normalized || "productreview"
}

export const cloudinaryProjectFolder = normalizeFolder(
  process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER
)

export function resolveCloudinaryFolder(folder: string | undefined) {
  const normalized = normalizeFolder(folder)

  if (
    normalized === cloudinaryProjectFolder ||
    normalized.startsWith(`${cloudinaryProjectFolder}/`)
  ) {
    return normalized
  }

  return cloudinaryProjectFolder
}

import { v2 as cloudinary } from "cloudinary"

import { cloudinaryProjectFolder, resolveCloudinaryFolder } from "@/lib/cloudinary-config"

type CloudinarySignableValue = string | number | boolean

export type CloudinarySignableParams = Record<string, CloudinarySignableValue>

function getCloudinaryCredentials() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not fully configured.")
  }

  return {
    apiKey,
    apiSecret,
    cloudName,
  }
}

export function getCloudinaryUploadConfig() {
  const { apiKey, cloudName } = getCloudinaryCredentials()

  return {
    apiKey,
    cloudName,
    folder: cloudinaryProjectFolder,
  }
}

export function signCloudinaryUploadParams(
  paramsToSign: Record<string, unknown>
) {
  const { apiSecret } = getCloudinaryCredentials()
  const normalizedParams: CloudinarySignableParams = {}

  for (const [key, value] of Object.entries(paramsToSign)) {
    if (value === undefined || value === null || value === "") {
      continue
    }

    if (Array.isArray(value)) {
      normalizedParams[key] = value.join(",")
      continue
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      normalizedParams[key] = value
    }
  }

  normalizedParams.folder = resolveCloudinaryFolder(
    typeof paramsToSign.folder === "string" ? paramsToSign.folder : undefined
  )

  return cloudinary.utils.api_sign_request(normalizedParams, apiSecret)
}

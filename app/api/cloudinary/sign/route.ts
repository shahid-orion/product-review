import { NextResponse } from "next/server"

import { getCloudinaryUploadConfig, signCloudinaryUploadParams } from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const paramsToSign =
      body && typeof body === "object" && "paramsToSign" in body
        ? body.paramsToSign
        : undefined

    if (!paramsToSign || typeof paramsToSign !== "object" || Array.isArray(paramsToSign)) {
      return NextResponse.json(
        { error: "Invalid Cloudinary signature payload." },
        { status: 400 }
      )
    }

    const signature = signCloudinaryUploadParams(paramsToSign)
    const { apiKey, cloudName, folder } = getCloudinaryUploadConfig()

    return NextResponse.json({
      apiKey,
      cloudName,
      folder,
      signature,
    })
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error)

    return NextResponse.json(
      { error: "Failed to generate Cloudinary signature." },
      { status: 500 }
    )
  }
}

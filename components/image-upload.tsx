"use client"

import { useRef, useState } from "react"
import { ImagePlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  onChange: (value: File | null) => void
  disabled?: boolean
}

export function ImageUpload({ onChange, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(file ? URL.createObjectURL(file) : "")
    onChange(file)
    e.target.value = ""
  }

  const onRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl("")
    onChange(null)
  }

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
        disabled={disabled}
      />
      {previewUrl ? (
        <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 z-10">
            <Button
              type="button"
              onClick={onRemove}
              variant="destructive"
              size="icon"
              className="shadow-sm"
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            if (!disabled) inputRef.current?.click()
          }}
          className={`w-full max-w-sm aspect-video flex flex-col items-center justify-center gap-4 text-muted-foreground border-2 border-dashed rounded-lg p-10 transition-colors ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-muted/50 hover:text-foreground"
          }`}
          aria-disabled={disabled}
        >
          <ImagePlus className="h-10 w-10" />
          <div className="font-semibold text-sm">Click to upload an image</div>
        </div>
      )}
    </div>
  )
}

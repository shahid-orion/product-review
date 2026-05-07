"use client"

import { useEffect, useState } from "react"
import { ImagePlus, Trash2, UploadCloud } from "lucide-react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  onChange: (value: File | null) => void
  disabled?: boolean
}

function getDropErrorMessage(fileRejections: FileRejection[]) {
  const firstError = fileRejections[0]?.errors[0]

  if (!firstError) {
    return "Could not add that file."
  }

  if (firstError.code === "file-invalid-type") {
    return "Only image files are allowed."
  }

  if (firstError.code === "too-many-files") {
    return "Upload a single image only."
  }

  return firstError.message
}

export function ImageUpload({ onChange, disabled }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState("")

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const updateFile = (file: File | null) => {
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl)
      }

      return file ? URL.createObjectURL(file) : ""
    })

    onChange(file)
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    accept: {
      "image/*": [],
    },
    disabled,
    maxFiles: 1,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    onDropAccepted: (files) => {
      updateFile(files[0] ?? null)
    },
    onDropRejected: (fileRejections) => {
      toast.error(getDropErrorMessage(fileRejections))
    },
  })

  const onRemove = () => {
    updateFile(null)
  }

  const rootProps = getRootProps({
  "aria-disabled": disabled,
  className: `group relative w-full overflow-hidden rounded-2xl border transition-all duration-200 ${
    disabled
      ? "cursor-not-allowed opacity-50 border-border bg-muted/40"
      : isDragReject
        ? "cursor-pointer border-destructive bg-destructive/10 shadow-sm"
        : isDragActive
          ? "cursor-pointer border-sky-500 bg-sky-100 shadow-lg shadow-sky-200/50"
          : "cursor-pointer border-sky-200 bg-sky-50/70 dark:border-sky-800 dark:bg-sky-950/30 hover:border-sky-400 hover:bg-sky-100/80 dark:hover:bg-sky-900/40 hover:shadow-md"
  }`,
  onClick: () => {
    if (!disabled) {
      open()
    }
  },
  onKeyDown: (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()

      if (!disabled) {
        open()
      }
    }
  },
  role: "button",
  tabIndex: disabled ? -1 : 0,
})
  return (
    <div className="w-full">
      <div {...rootProps}>
        <input {...getInputProps()} />

        {previewUrl ? (
          <div className="relative h-44">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Upload preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-white">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  <UploadCloud className="h-3.5 w-3.5" />
                  {isDragActive ? "Drop to replace image" : "Drag a new image here"}
                </div>
                <p className="text-sm text-white/85">or click anywhere to browse</p>
              </div>
              <Button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onRemove()
                }}
                variant="destructive"
                size="icon"
                className="shrink-0 shadow-sm"
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-48 p-4">
            <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/90 px-6 text-center transition-colors group-hover:border-sky-500 group-hover:bg-sky-100/80 dark:border-sky-700 dark:bg-sky-950/40 dark:group-hover:bg-sky-900/50">
              <div
                className={`mb-4 rounded-2xl p-4 transition-colors ${
                  isDragReject
                    ? "bg-destructive/10 text-destructive"
                    : isDragActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                }`}
              >
                {isDragActive ? (
                  <UploadCloud className="h-9 w-9" />
                ) : (
                  <ImagePlus className="h-9 w-9" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {isDragReject
                    ? "That file type won't work"
                    : isDragActive
                      ? "Drop image to upload"
                      : "Drop product image here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse from your device
                </p>
                <p className="pt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground/80">
                  JPG PNG WEBP AVIF
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

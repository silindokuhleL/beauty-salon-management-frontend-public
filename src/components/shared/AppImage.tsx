'use client'

import { useEffect, useState } from 'react'
import Image, { type ImageProps } from 'next/image'

const DEFAULT_FALLBACK =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23f3f4f6"/%3E%3Cpath d="M300 245h200v110H300z" fill="%23e5e7eb"/%3E%3Ccircle cx="355" cy="285" r="24" fill="%23d1d5db"/%3E%3Cpath d="m320 335 55-60 44 48 28-30 45 42H320z" fill="%23d1d5db"/%3E%3C/svg%3E'

type AppImageProps = Omit<ImageProps, 'src' | 'alt' | 'fill'> & {
    src: string
    alt: string
    fallbackSrc?: string
}

function getSafeSrc(src: string, fallbackSrc?: string): string {
    const trimmedSrc = src?.trim()
    const trimmedFallback = fallbackSrc?.trim()

    if (isRenderableImageSrc(trimmedSrc)) return trimmedSrc as string
    if (isRenderableImageSrc(trimmedFallback)) return trimmedFallback as string

    return DEFAULT_FALLBACK
}

function isRenderableImageSrc(src?: string): boolean {
    if (!src) return false
    if (src.startsWith('/') || src.startsWith('data:') || src.startsWith('blob:')) return true

    if (src.startsWith('http://') || src.startsWith('https://')) {
        try {
            new URL(src)
            return true
        } catch {
            return false
        }
    }

    return false
}

export function AppImage({ src, alt, fallbackSrc, unoptimized, onError, ...props }: AppImageProps) {
    const [currentSrc, setCurrentSrc] = useState(() => getSafeSrc(src, fallbackSrc))

    useEffect(() => {
        setCurrentSrc(getSafeSrc(src, fallbackSrc))
    }, [fallbackSrc, src])

    const shouldSkipOptimization =
        unoptimized ||
        currentSrc.startsWith('data:') ||
        currentSrc.startsWith('blob:')

    return (
        <Image
            {...props}
            src={currentSrc}
            alt={alt}
            fill
            unoptimized={shouldSkipOptimization}
            onError={(event) => {
                const safeFallback = getSafeSrc('', fallbackSrc)
                if (currentSrc !== safeFallback) {
                    setCurrentSrc(safeFallback)
                }

                onError?.(event)
            }}
        />
    )
}

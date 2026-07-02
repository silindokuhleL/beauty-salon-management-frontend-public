'use client'

import { useEffect, useState } from 'react'
import Image, { type ImageProps } from 'next/image'

type AppImageProps = Omit<ImageProps, 'src' | 'alt' | 'fill'> & {
    src: string
    alt: string
    fallbackSrc?: string
}

export function AppImage({ src, alt, fallbackSrc, unoptimized, onError, ...props }: AppImageProps) {
    const [currentSrc, setCurrentSrc] = useState(src)

    useEffect(() => {
        setCurrentSrc(src)
    }, [src])

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
                if (fallbackSrc && currentSrc !== fallbackSrc) {
                    setCurrentSrc(fallbackSrc)
                }

                onError?.(event)
            }}
        />
    )
}

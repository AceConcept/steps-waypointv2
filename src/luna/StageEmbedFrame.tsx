type StageEmbedFrameProps = {
  src: string
  title: string
  className?: string
}

/** Shared stage iframe — do not mount two instances with the same origin at once. */
export function StageEmbedFrame({ src, title, className }: StageEmbedFrameProps) {
  return (
    <iframe
      className={className}
      src={src}
      title={title}
      allow="fullscreen"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  )
}

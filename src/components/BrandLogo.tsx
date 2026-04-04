import clsx from 'clsx'

type Props = {
  className?: string
}

/** Dashboard / sidebar wordmark from Figma (`public/logo-container.png`). */
export function BrandLogo({ className }: Props) {
  return (
    <img
      src="/logo-container.png"
      alt="Xaccess"
      className={clsx('h-9 w-auto max-w-[200px] object-contain object-left', className)}
    />
  )
}

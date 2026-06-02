// Simple official-looking DMV-style header bar.

interface HeaderProps {
  subtitle?: string
}

export default function Header({ subtitle }: HeaderProps) {
  return (
    <header className="bg-dmv-blue text-white shadow-md">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dmv-gold font-bold text-dmv-blue">
          CA
        </div>
        <div className="leading-tight">
          <div className="text-base font-semibold sm:text-lg">
            California DMV Practice Knowledge Test
          </div>
          <div className="text-xs text-blue-100 sm:text-sm">
            {subtitle ?? 'Driver Knowledge Test Simulator'}
          </div>
        </div>
      </div>
    </header>
  )
}

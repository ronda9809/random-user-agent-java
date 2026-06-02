// Simple official-looking DMV-style header bar. The logo/title doubles as a
// "home" button; during a test the parent confirms before leaving.

interface HeaderProps {
  subtitle?: string
  onHome?: () => void
}

export default function Header({ subtitle, onHome }: HeaderProps) {
  return (
    <header className="bg-dmv-blue text-white shadow-md">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onHome}
          disabled={!onHome}
          aria-label="Go to home screen"
          className="flex items-center gap-3 rounded-lg text-left transition enabled:hover:opacity-90 disabled:cursor-default"
        >
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
        </button>
      </div>
    </header>
  )
}

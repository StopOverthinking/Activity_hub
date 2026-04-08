import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TeacherAnnotationLayer } from './TeacherAnnotationLayer'
import { usePersistentState } from './usePersistentState'
import type { ActivityManifest, AppMode } from '../activities/types'

export type ActivityTextScale = 'base' | 'large' | 'xlarge'

const textScaleOptions: Array<{
  id: ActivityTextScale
  label: string
  ariaLabel: string
}> = [
  { id: 'base', label: 'A', ariaLabel: 'Base text size' },
  { id: 'large', label: 'A+', ariaLabel: 'Large text size' },
  { id: 'xlarge', label: 'A++', ariaLabel: 'Extra large text size' },
]

type ActivityShellProps = {
  manifest: ActivityManifest
  mode: AppMode
  children: (state: { showAnswers: boolean; textScale: ActivityTextScale }) => ReactNode
}

export function ActivityShell({
  manifest,
  mode,
  children,
}: ActivityShellProps) {
  const [showAnswers, setShowAnswers] = useState(false)
  const [notesEnabled, setNotesEnabled] = useState(false)
  const [resetSignal, setResetSignal] = useState(0)
  const [textScale, setTextScale] = usePersistentState<ActivityTextScale>(
    'ui:activity-text-scale',
    'base',
  )
  const homePath = mode === 'teacher' ? '/teacher' : '/'

  return (
    <div className="app-shell">
      <div className="screen activity-screen">
        <header className="topbar panel">
          <div className="topbar__group">
            <Link className="ghost-button" to={homePath}>
              ←
            </Link>
            <div className="topbar__title">
              <span
                className="glyph-badge"
                style={{ backgroundColor: manifest.softColor }}
              >
                {manifest.icon}
              </span>
              <div>
                <p>{mode === 'teacher' ? 'Teacher' : 'Student'}</p>
                <h1>{manifest.title}</h1>
              </div>
            </div>
          </div>
          <div className="topbar__group topbar__group--actions">
            <div
              aria-label="Text size"
              className="text-scale-controls"
              role="group"
            >
              {textScaleOptions.map((option) => (
                <button
                  key={option.id}
                  aria-label={option.ariaLabel}
                  aria-pressed={textScale === option.id}
                  className="text-scale-controls__button"
                  data-active={textScale === option.id}
                  onClick={() => setTextScale(option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            {mode === 'teacher' ? (
              <>
                <button
                  className="tiny-button"
                  data-tone="teacher"
                  disabled={showAnswers}
                  onClick={() => setShowAnswers(true)}
                  type="button"
                >
                  모든 정답 공개
                </button>
                <button
                  className="tiny-button"
                  data-tone="teacher"
                  onClick={() => setNotesEnabled((current) => !current)}
                  type="button"
                >
                  {notesEnabled ? '필기 종료' : '필기'}
                </button>
                <button
                  className="tiny-button"
                  data-tone="teacher"
                  onClick={() => setResetSignal((current) => current + 1)}
                  type="button"
                >
                  지우기
                </button>
              </>
            ) : null}
          </div>
        </header>

        <main
          className="activity-frame panel"
          style={{ ['--accent-color' as string]: manifest.color }}
        >
          <div className="activity-frame__content">
            {children({ showAnswers, textScale })}
          </div>
          {mode === 'teacher' ? (
            <TeacherAnnotationLayer enabled={notesEnabled} resetSignal={resetSignal} />
          ) : null}
        </main>
      </div>
    </div>
  )
}

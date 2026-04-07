import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TeacherAnnotationLayer } from './TeacherAnnotationLayer'
import type { ActivityManifest, AppMode } from '../activities/types'

type ActivityShellProps = {
  manifest: ActivityManifest
  mode: AppMode
  children: (state: { showAnswers: boolean }) => ReactNode
}

export function ActivityShell({
  manifest,
  mode,
  children,
}: ActivityShellProps) {
  const [showAnswers, setShowAnswers] = useState(mode === 'teacher')
  const [notesEnabled, setNotesEnabled] = useState(false)
  const [resetSignal, setResetSignal] = useState(0)
  const homePath = mode === 'teacher' ? '/teacher' : '/'

  return (
    <div className="app-shell">
      <div className="screen activity-screen">
        <header className="topbar panel">
          <div className="topbar__group">
            <Link className="ghost-button" to={homePath}>
              홈
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
            {mode === 'teacher' ? (
              <>
                <button
                  className="tiny-button"
                  data-tone="teacher"
                  onClick={() => setShowAnswers((current) => !current)}
                  type="button"
                >
                  {showAnswers ? '정답 숨김' : '정답'}
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
          <div className="activity-frame__content">{children({ showAnswers })}</div>
          {mode === 'teacher' ? (
            <TeacherAnnotationLayer enabled={notesEnabled} resetSignal={resetSignal} />
          ) : null}
        </main>
      </div>
    </div>
  )
}

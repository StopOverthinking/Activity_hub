import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { activityRegistry, getActivityById } from '../activities/registry'
import type { AppMode } from '../activities/types'

const TEACHER_PIN = '8805'
const TEACHER_AUTH_STORAGE_KEY = 'activity-hub.teacher-auth'

type HubPageProps = {
  mode: AppMode
}

function HubPage({ mode }: HubPageProps) {
  const oppositePath = mode === 'teacher' ? '/' : '/teacher'
  const oppositeLabel = mode === 'teacher' ? '학생' : '교사'

  return (
    <div className="app-shell">
      <div className="screen">
        <header className="hub-hero panel">
          <div className="hub-hero__content">
            <div className="hub-hero__title">
              <div>
                <p>{mode === 'teacher' ? 'Teacher' : 'Student'}</p>
                <h1>활동 허브</h1>
              </div>
            </div>
          </div>
          <Link className="tiny-button hub-hero__switch" data-tone="teacher" to={oppositePath}>
            {oppositeLabel}
          </Link>
        </header>

        <main className="hub-grid">
          {activityRegistry.map((activity) => {
            const activityPath =
              mode === 'teacher'
                ? `/teacher/activity/${activity.id}`
                : `/activity/${activity.id}`

            return (
              <Link
                key={activity.id}
                className="icon-card panel"
                style={{ ['--card-accent' as string]: activity.color }}
                to={activityPath}
              >
                <span
                  className="icon-card__glyph"
                  style={{ backgroundColor: activity.softColor }}
                  aria-hidden="true"
                >
                  {activity.icon}
                </span>
                <span className="icon-card__label">{activity.title}</span>
              </Link>
            )
          })}
        </main>
      </div>
    </div>
  )
}

type TeacherAccessGateProps = {
  children: ReactNode
}

function TeacherAccessGate({ children }: TeacherAccessGateProps) {
  const initialUnlocked = useMemo(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.sessionStorage.getItem(TEACHER_AUTH_STORAGE_KEY) === 'true'
  }, [])

  const [isUnlocked, setIsUnlocked] = useState(initialUnlocked)
  const [pin, setPin] = useState('')
  const [hasError, setHasError] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (pin === TEACHER_PIN) {
      window.sessionStorage.setItem(TEACHER_AUTH_STORAGE_KEY, 'true')
      setIsUnlocked(true)
      setHasError(false)
      return
    }

    setHasError(true)
    setPin('')
  }

  if (isUnlocked) {
    return <>{children}</>
  }

  return (
    <div className="app-shell">
      <div className="teacher-lock">
        <section className="teacher-lock__panel panel">
          <div className="teacher-lock__header">
            <p>Teacher</p>
            <h1>교사용 모드</h1>
          </div>

          <form className="teacher-lock__form" onSubmit={handleSubmit}>
            <label className="teacher-lock__label" htmlFor="teacher-pin">
              PIN
            </label>
            <input
              autoComplete="off"
              className="teacher-lock__input"
              id="teacher-pin"
              inputMode="numeric"
              maxLength={4}
              onChange={(event) => {
                const nextValue = event.target.value.replace(/\D/g, '')
                setPin(nextValue)
                setHasError(false)
              }}
              pattern="[0-9]*"
              type="password"
              value={pin}
            />

            <div className="teacher-lock__actions">
              <Link className="pill-button" data-tone="secondary" to="/">
                학생
              </Link>
              <button className="pill-button" data-tone="teacher" type="submit">
                입장
              </button>
            </div>

            {hasError ? (
              <p className="teacher-lock__error">PIN이 올바르지 않습니다.</p>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  )
}

type ActivityPageProps = {
  mode: AppMode
}

function ActivityPage({ mode }: ActivityPageProps) {
  const { activityId = '' } = useParams()
  const activity = getActivityById(activityId)

  if (!activity) {
    return <Navigate to={mode === 'teacher' ? '/teacher' : '/'} replace />
  }

  const ActivityComponent = activity.Component

  return <ActivityComponent mode={mode} />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<HubPage mode="student" />} path="/" />
      <Route
        element={
          <TeacherAccessGate>
            <HubPage mode="teacher" />
          </TeacherAccessGate>
        }
        path="/teacher"
      />
      <Route element={<ActivityPage mode="student" />} path="/activity/:activityId" />
      <Route
        element={
          <TeacherAccessGate>
            <ActivityPage mode="teacher" />
          </TeacherAccessGate>
        }
        path="/teacher/activity/:activityId"
      />
    </Routes>
  )
}

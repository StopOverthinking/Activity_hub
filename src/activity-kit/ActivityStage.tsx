import type { PropsWithChildren, ReactNode } from 'react'

type ActivityStageProps = PropsWithChildren<{
  title: string
  subtitle?: string
  aside?: ReactNode
}>

export function ActivityStage({
  title,
  subtitle,
  aside,
  children,
}: ActivityStageProps) {
  return (
    <section className="activity-stage panel">
      <header className="activity-stage__header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {aside ? <div className="activity-stage__aside">{aside}</div> : null}
      </header>
      <div className="activity-stage__body">{children}</div>
    </section>
  )
}

import type { PropsWithChildren, ReactNode } from 'react'
import type { ActivityTextScale } from './ActivityShell'

type ActivityStageProps = PropsWithChildren<{
  title: string
  subtitle?: string
  aside?: ReactNode
  textScale?: ActivityTextScale
}>

export function ActivityStage({
  title,
  subtitle,
  aside,
  textScale = 'base',
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
      <div className="activity-stage__body">
        <div className="activity-text-scale" data-text-scale={textScale}>
          {children}
        </div>
      </div>
    </section>
  )
}

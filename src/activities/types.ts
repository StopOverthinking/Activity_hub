import type { ReactElement } from 'react'

export type AppMode = 'student' | 'teacher'
export type SectionActivityType = 'quiz' | 'performance'

export type ActivityComponentProps = {
  mode: AppMode
}

export type ActivityManifest = {
  id: string
  subject: string
  title: string
  shortLabel: string
  createdAt: string
  icon: string
  color: string
  softColor: string
  preview: string
  Component: (props: ActivityComponentProps) => ReactElement
}

export function getActivityDisplayTitle(activity: Pick<ActivityManifest, 'subject' | 'title'>) {
  return `${activity.subject} ${activity.title}`
}

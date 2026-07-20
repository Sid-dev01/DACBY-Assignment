import type { ReactNode } from 'react'

type StateCardProps = {
  action?: ReactNode
  children: ReactNode
  title: string
  tone?: 'default' | 'error'
}

export function StateCard({ action, children, title, tone = 'default' }: StateCardProps) {
  return (
    <div className={`state-card ${tone === 'error' ? 'state-card-error' : ''}`} role={tone === 'error' ? 'alert' : undefined}>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  )
}

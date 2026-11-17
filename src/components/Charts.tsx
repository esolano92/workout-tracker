import { useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { shortDate } from '../dates'
import type { Point } from '../trends'

const H = 190
const PAD = { top: 14, right: 10, bottom: 24, left: 40 }

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(320)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

function niceStep(x: number): number {
  const exp = Math.floor(Math.log10(x))
  const f = x / 10 ** exp
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
  return nf * 10 ** exp
}

/** Rounds a domain out to clean tick values, e.g. 0 / 5k / 10k / 15k. */
function niceScale(lo: number, hi: number, count = 3): { lo: number; hi: number; ticks: number[] } {
  const step = niceStep((hi - lo) / count)
  const nlo = Math.floor(lo / step) * step
  const nhi = Math.ceil(hi / step) * step
  const ticks: number[] = []
  for (let t = nlo; t <= nhi + step / 2; t += step) ticks.push(Number(t.toFixed(6)))
  return { lo: nlo, hi: nhi, ticks }
}

function domain(values: number[], padRatio: number, floorZero = false): [number, number] {
  if (!values.length) return [0, 1]
  let lo = Math.min(...values)
  let hi = Math.max(...values)
  if (lo === hi) {
    lo -= 1
    hi += 1
  }
  const pad = (hi - lo) * padRatio
  return [floorZero ? 0 : lo - pad, hi + pad]
}

function linePath(points: { x: number; y?: number }[]): string {
  let d = ''
  let pen = false
  for (const p of points) {
    if (p.y === undefined) {
      pen = false
      continue
    }
    d += `${pen ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
    pen = true
  }
  return d
}

interface ChartProps {
  points: Point[]
  trend?: Point[]
  goal?: number
  color: string
  format: (v: number) => string
  axisFormat?: (v: number) => string
  emptyText: string
  goalLabel?: string
}

function useScrub(n: number, width: number) {
  const [idx, setIdx] = useState<number | null>(null)
  const innerW = width - PAD.left - PAD.right
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - PAD.left
    setIdx(Math.max(0, Math.min(n - 1, Math.round((x / innerW) * (n - 1)))))
  }
  return { idx, onMove, onLeave: () => setIdx(null) }
}

function Readout({
  point,
  trend,
  format,
  fallback,
}: {
  point?: Point
  trend?: Point
  format: (v: number) => string
  fallback: string
}) {
  if (!point) return <div className="chart-readout muted">{fallback}</div>
  return (
    <div className="chart-readout">
      <span className="muted">{shortDate(point.key)}</span>
      <strong>{point.value !== undefined ? format(point.value) : '—'}</strong>
      {trend?.value !== undefined && <span className="muted">avg {format(trend.value)}</span>}
    </div>
  )
}

export function LineChart({
  points,
  trend,
  connect,
  goal,
  goalLabel = 'goal',
  color,
  format,
  axisFormat = format,
  emptyText,
}: ChartProps & { connect?: boolean }) {
  const [ref, width] = useWidth()
  const n = points.length
  const { idx, onMove, onLeave } = useScrub(n, width)
  const line = trend ?? (connect ? points : undefined)
  const values = [...points, ...(trend ?? [])].map((p) => p.value).filter((v): v is number => v !== undefined)
  if (goal !== undefined) values.push(goal)
  const hasData = points.some((p) => p.value !== undefined)
  const { lo, hi, ticks } = niceScale(...domain(values, 0.08))
  const innerW = width - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (v: number) => PAD.top + innerH - ((v - lo) / (hi - lo)) * innerH
  const trendPts = (line ?? []).map((p, i) => ({ x: x(i), y: p.value === undefined ? undefined : y(p.value) }))
  const trendLine = linePath(trendPts)
  const firstTrend = trendPts.find((p) => p.y !== undefined)
  const lastTrend = trendPts.findLast((p) => p.y !== undefined)
  const area =
    trendLine && firstTrend && lastTrend
      ? `${trendLine}L${lastTrend.x},${PAD.top + innerH}L${firstTrend.x},${PAD.top + innerH}Z`
      : ''
  const gradId = `grad-${color.replace(/[^a-z0-9]/gi, '')}`
  const lastPoint = points.findLast((p) => p.value !== undefined)

  return (
    <div className="chart" ref={ref}>
      <Readout
        point={idx !== null ? points[idx] : lastPoint}
        trend={idx !== null ? trend?.[idx] : trend?.at(-1)}
        format={format}
        fallback={emptyText}
      />
      <svg width={width} height={H} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={onLeave}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="axis" x={PAD.left - 6} y={y(t) + 4} textAnchor="end">{axisFormat(t)}</text>
          </g>
        ))}
        {hasData && (
          <>
            {area && <path d={area} fill={`url(#${gradId})`} />}
            {trendLine && <path d={trendLine} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
            {points.map((p, i) =>
              p.value === undefined ? null : (
                <circle key={p.key} cx={x(i)} cy={y(p.value)} r={n > 60 ? 1.6 : 3} className="dot" style={{ fill: color }} />
              ),
            )}
          </>
        )}
        {goal !== undefined && (
          <g>
            <line className="goal-line" x1={PAD.left} x2={width - PAD.right} y1={y(goal)} y2={y(goal)} />
            <text className="axis goal-label" x={width - PAD.right} y={y(goal) - 5} textAnchor="end">{goalLabel}</text>
          </g>
        )}
        {idx !== null && (
          <line className="scrub" x1={x(idx)} x2={x(idx)} y1={PAD.top} y2={PAD.top + innerH} />
        )}
        <XLabels n={n} points={points} x={x} />
      </svg>
    </div>
  )
}

export function BarChart({ points, trend, goal, color, format, axisFormat = format, emptyText }: ChartProps) {
  const [ref, width] = useWidth()
  const n = points.length
  const { idx, onMove, onLeave } = useScrub(n, width)
  const values = points.map((p) => p.value).filter((v): v is number => v !== undefined)
  if (goal !== undefined) values.push(goal)
  const { hi, ticks } = niceScale(...domain(values, 0.05, true))
  const innerW = width - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const slot = innerW / Math.max(n, 1)
  const barW = Math.max(1.5, slot * 0.62)
  const x = (i: number) => PAD.left + slot * i + slot / 2
  const y = (v: number) => PAD.top + innerH - (v / hi) * innerH
  const trendLine = linePath((trend ?? []).map((p, i) => ({ x: x(i), y: p.value === undefined ? undefined : y(p.value) })))
  const lastPoint = points.findLast((p) => p.value !== undefined)

  return (
    <div className="chart" ref={ref}>
      <Readout
        point={idx !== null ? points[idx] : lastPoint}
        trend={idx !== null ? trend?.[idx] : trend?.at(-1)}
        format={format}
        fallback={emptyText}
      />
      <svg width={width} height={H} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={onLeave}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="axis" x={PAD.left - 6} y={y(t) + 4} textAnchor="end">{axisFormat(t)}</text>
          </g>
        ))}
        {points.map((p, i) => {
          if (p.value === undefined) return null
          const hit = goal !== undefined && p.value >= goal
          return (
            <rect
              key={p.key}
              x={x(i) - barW / 2}
              y={y(p.value)}
              width={barW}
              height={Math.max(0, PAD.top + innerH - y(p.value))}
              rx={Math.min(4, barW / 2)}
              fill={color}
              opacity={idx === null || idx === i ? (hit ? 1 : 0.45) : 0.25}
            />
          )
        })}
        {trendLine && <path d={trendLine} fill="none" stroke="var(--text)" strokeOpacity="0.7" strokeWidth="1.8" strokeLinejoin="round" />}
        {goal !== undefined && (
          <g>
            <line className="goal-line" x1={PAD.left} x2={width - PAD.right} y1={y(goal)} y2={y(goal)} />
            <text className="axis goal-label" x={width - PAD.right} y={y(goal) - 5} textAnchor="end">goal</text>
          </g>
        )}
        <XLabels n={n} points={points} x={x} />
      </svg>
    </div>
  )
}

function XLabels({ n, points, x }: { n: number; points: Point[]; x: (i: number) => number }) {
  if (!n) return null
  const idxs = n < 3 ? [0, n - 1] : [0, Math.floor((n - 1) / 2), n - 1]
  return (
    <>
      {[...new Set(idxs)].map((i, j, arr) => (
        <text
          key={i}
          className="axis"
          x={x(i)}
          y={H - 6}
          textAnchor={j === 0 && arr.length > 1 ? 'start' : j === arr.length - 1 && arr.length > 1 ? 'end' : 'middle'}
        >
          {shortDate(points[i].key)}
        </text>
      ))}
    </>
  )
}

/** Circular progress ring, used for daily step goal. */
export function Ring({ value, max, size = 92, stroke = 10, color, children }: {
  value: number
  max: number
  size?: number
  stroke?: number
  color: string
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = max > 0 ? Math.min(1, value / max) : 0
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  )
}

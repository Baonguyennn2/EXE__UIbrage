import PageCanvas from '../components/PageCanvas.jsx'
import { pageCopyByVariant } from '../data/pageCopy.js'

export default function PageRoutePage({ frame, variant }) {
  const copy = pageCopyByVariant[variant] ?? pageCopyByVariant.generic

  return <PageCanvas frame={frame} {...copy} />
}

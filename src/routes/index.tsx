import { createFileRoute } from '@tanstack/react-router'
import { Harmonium } from '../components/Harmonium/Harmonium'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return <Harmonium />
}

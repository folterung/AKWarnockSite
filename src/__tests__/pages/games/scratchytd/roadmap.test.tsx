import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import ScratchyTDRoadmap, { getStaticProps } from '@/pages/games/scratchytd/roadmap'
import { roadmapData } from '@/data/scratchytd-roadmap'

jest.mock('next/head', () => {
  const MockHead = ({ children }: { children: React.ReactNode }) => <>{children}</>
  MockHead.displayName = 'MockHead'
  return MockHead
})

jest.mock('next/link', () => {
  const MockLink = ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

const longBody =
  'Detailed body for the laser pointer tower — chases the laser dot in continuous arcs and ramps up DPS with kill streaks. This text intentionally exceeds the old 120-char truncation threshold so the test can prove the card no longer renders it inline.'

const MARKDOWN_BODY = [
  '## Section heading',
  '',
  'This is **bold** and *italic*.',
  '',
  'Visit [our docs](https://example.com/docs).',
  '',
  'Inline <strong>HTML bold</strong> too.',
  '',
  '<script>window.__pwned = true</script>',
  '',
  '<img src=x onerror="window.__pwned=true">',
].join('\n')

const boardFixture = {
  meta: { title: 'ScratchyTD', description: '...', lastUpdated: '2026-05-01' },
  columns: ['Backlog', 'In Progress', 'Done'],
  items: [
    {
      title: 'Laser Pointer Tower',
      body: longBody,
      number: 42,
      url: 'https://github.com/folterung/scratchytd/issues/42',
      labels: [
        { name: 'tower', color: '7EB8D8' },
        { name: 'priority:high', color: 'F4845F' },
      ],
      assignees: [
        { login: 'octocat', avatarUrl: 'https://example.com/a.png', profileUrl: 'https://github.com/octocat' },
      ],
      fields: { Status: 'In Progress', Priority: 'High', Sprint: 3 },
      status: 'In Progress',
    },
    {
      title: 'Pet Shop Map',
      body: 'Indoor pet shop level with shelves and fish tanks as scenery.',
      number: 17,
      url: 'https://github.com/folterung/scratchytd/issues/17',
      labels: [{ name: 'map', color: 'B39DDB' }],
      assignees: [],
      fields: { Status: 'Backlog' },
      status: 'Backlog',
    },
    {
      title: 'Balance Patch',
      body: 'Tuning early-game economy.',
      number: 9,
      url: 'https://github.com/folterung/scratchytd/issues/9',
      labels: [],
      assignees: [],
      fields: { Status: 'Done' },
      status: 'Done',
    },
    {
      title: 'Bug: Save Slot Crash',
      body: 'Reproduces when saving on level 5 after pause.',
      number: 33,
      url: 'https://github.com/folterung/scratchytd/issues/33',
      labels: [{ name: 'bug', color: 'E57373' }],
      assignees: [],
      fields: { Status: 'In Progress' },
      status: 'In Progress',
    },
    {
      title: 'Markdown Demo',
      body: MARKDOWN_BODY,
      number: 100,
      url: 'https://github.com/folterung/scratchytd/issues/100',
      labels: [],
      assignees: [],
      fields: { Status: 'Backlog' },
      status: 'Backlog',
    },
  ],
}

function mockFetchOk() {
  ;(global as any).fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(boardFixture),
    })
  )
}

function mockFetchError() {
  ;(global as any).fetch = jest.fn(() => Promise.reject(new Error('boom')))
}

afterEach(() => {
  jest.restoreAllMocks()
  delete (global as any).fetch
  document.body.style.overflow = ''
})

const defaultProps = { roadmapData }

describe('ScratchyTD Roadmap Page', () => {
  describe('getStaticProps', () => {
    it('returns roadmapData as a prop', async () => {
      const result = await getStaticProps({} as any)
      expect(result).toHaveProperty('props')
      expect((result as any).props).toHaveProperty('roadmapData')
      expect((result as any).props.roadmapData.meta.title).toBe(roadmapData.meta.title)
    })
  })

  describe('Loading and error states', () => {
    it('renders the loader before the board fetch resolves', () => {
      ;(global as any).fetch = jest.fn(() => new Promise(() => {}))
      render(<ScratchyTDRoadmap {...defaultProps} />)
      expect(screen.getByLabelText('Loading board data')).toBeInTheDocument()
    })

    it('renders an error message when the board fetch fails', async () => {
      mockFetchError()
      render(<ScratchyTDRoadmap {...defaultProps} />)
      expect(await screen.findByText(/Could not load project board data/i)).toBeInTheDocument()
    })
  })

  describe('Board render', () => {
    beforeEach(() => mockFetchOk())

    it('renders one column per board column with the right card counts', async () => {
      const { container } = render(<ScratchyTDRoadmap {...defaultProps} />)
      await screen.findByText('Laser Pointer Tower')
      const headers = Array.from(container.querySelectorAll('.srm-column-header'))
      expect(headers).toHaveLength(3)
      const headerText = headers.map((h) => h.textContent || '')
      expect(headerText.some((t) => t.includes('Backlog') && t.includes('2'))).toBe(true)
      expect(headerText.some((t) => t.includes('In Progress') && t.includes('2'))).toBe(true)
      expect(headerText.some((t) => t.includes('Done') && t.includes('1'))).toBe(true)
    })

    it('renders a compact card view without the full body inline', async () => {
      render(<ScratchyTDRoadmap {...defaultProps} />)
      await screen.findByText('Laser Pointer Tower')
      expect(screen.queryByText(longBody)).not.toBeInTheDocument()
      expect(screen.queryByText(/chases the laser dot in continuous arcs/i)).not.toBeInTheDocument()
    })

    it('does not render the inline expand hint on cards', async () => {
      const { container } = render(<ScratchyTDRoadmap {...defaultProps} />)
      await screen.findByText('Laser Pointer Tower')
      expect(container.querySelector('.srm-card-hint')).toBeNull()
    })
  })

  describe('Card detail modal', () => {
    beforeEach(() => mockFetchOk())

    async function openModalFor(title: string) {
      const utils = render(<ScratchyTDRoadmap {...defaultProps} />)
      const titleEl = await screen.findByText(title)
      const card = titleEl.closest('.srm-card') as HTMLElement
      fireEvent.click(card)
      const dialog = await screen.findByRole('dialog')
      return { ...utils, card, dialog }
    }

    it('opens a modal with the full body, labels, assignees, and GitHub link', async () => {
      const { dialog } = await openModalFor('Laser Pointer Tower')
      expect(within(dialog).getByText('Laser Pointer Tower')).toBeInTheDocument()
      expect(within(dialog).getByText(longBody)).toBeInTheDocument()
      expect(within(dialog).getByText('tower')).toBeInTheDocument()
      expect(within(dialog).getByText('priority:high')).toBeInTheDocument()
      expect(within(dialog).getByText('octocat')).toBeInTheDocument()
      const ghLink = within(dialog).getByRole('link', { name: /github/i })
      expect(ghLink).toHaveAttribute('href', 'https://github.com/folterung/scratchytd/issues/42')
    })

    it('closes when the close button is clicked and restores focus to the card', async () => {
      const { dialog, card } = await openModalFor('Laser Pointer Tower')
      fireEvent.click(within(dialog).getByRole('button', { name: /close/i }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(document.activeElement).toBe(card)
    })

    it('closes when ESC is pressed', async () => {
      await openModalFor('Laser Pointer Tower')
      fireEvent.keyDown(document, { key: 'Escape' })
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('closes when the backdrop is clicked', async () => {
      const { dialog } = await openModalFor('Laser Pointer Tower')
      const backdrop = dialog.parentElement as HTMLElement
      fireEvent.click(backdrop)
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('locks body scroll while open and restores it on close', async () => {
      const { dialog } = await openModalFor('Laser Pointer Tower')
      expect(document.body.style.overflow).toBe('hidden')
      fireEvent.click(within(dialog).getByRole('button', { name: /close/i }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(document.body.style.overflow).not.toBe('hidden')
    })
  })

  describe('Modal body markdown rendering', () => {
    beforeEach(() => mockFetchOk())

    async function openModalFor(title: string) {
      render(<ScratchyTDRoadmap {...defaultProps} />)
      const titleEl = await screen.findByText(title)
      const card = titleEl.closest('.srm-card') as HTMLElement
      fireEvent.click(card)
      const dialog = await screen.findByRole('dialog')
      return { card, dialog }
    }

    it('renders markdown bold and italic as <strong>/<em>', async () => {
      const { dialog } = await openModalFor('Markdown Demo')
      expect(within(dialog).getByText('bold').tagName).toBe('STRONG')
      expect(within(dialog).getByText('italic').tagName).toBe('EM')
    })

    it('renders markdown headings', async () => {
      const { dialog } = await openModalFor('Markdown Demo')
      expect(
        within(dialog).getByRole('heading', { level: 2, name: 'Section heading' })
      ).toBeInTheDocument()
    })

    it('renders markdown links with safe external attributes', async () => {
      const { dialog } = await openModalFor('Markdown Demo')
      const link = within(dialog).getByRole('link', { name: 'our docs' })
      expect(link).toHaveAttribute('href', 'https://example.com/docs')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('rel') || '').toMatch(/noopener/)
    })

    it('renders inline HTML tags inside the body', async () => {
      const { dialog } = await openModalFor('Markdown Demo')
      expect(within(dialog).getByText('HTML bold').tagName).toBe('STRONG')
    })

    it('strips dangerous tags and event-handler attributes', async () => {
      ;(window as any).__pwned = undefined
      const { dialog } = await openModalFor('Markdown Demo')
      expect(dialog.querySelector('script')).toBeNull()
      expect((window as any).__pwned).toBeUndefined()
      expect(dialog.innerHTML.toLowerCase()).not.toMatch(/onerror=/)
    })
  })

  describe('Modal footer layout', () => {
    beforeEach(() => mockFetchOk())

    async function openModalFor(title: string) {
      render(<ScratchyTDRoadmap {...defaultProps} />)
      const titleEl = await screen.findByText(title)
      fireEvent.click(titleEl.closest('.srm-card') as HTMLElement)
      return await screen.findByRole('dialog')
    }

    it('places the close button inside the modal footer', async () => {
      const dialog = await openModalFor('Laser Pointer Tower')
      const footer = dialog.querySelector('.srm-modal-footer') as HTMLElement | null
      expect(footer).not.toBeNull()
      const closeBtn = within(dialog).getByRole('button', { name: /close/i })
      expect(footer!.contains(closeBtn)).toBe(true)
    })

    it('places the View on GitHub link inside the modal footer', async () => {
      const dialog = await openModalFor('Laser Pointer Tower')
      const footer = dialog.querySelector('.srm-modal-footer') as HTMLElement | null
      expect(footer).not.toBeNull()
      const githubLink = within(dialog).getByRole('link', { name: /github/i })
      expect(footer!.contains(githubLink)).toBe(true)
    })

    it('renders the footer after the body content in DOM order', async () => {
      const dialog = await openModalFor('Markdown Demo')
      const body = dialog.querySelector('.srm-modal-body') as HTMLElement
      const footer = dialog.querySelector('.srm-modal-footer') as HTMLElement
      expect(body).not.toBeNull()
      expect(footer).not.toBeNull()
      expect(
        body.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
    })
  })

  describe('Filters', () => {
    beforeEach(() => mockFetchOk())

    it('filters cards by search term', async () => {
      render(<ScratchyTDRoadmap {...defaultProps} />)
      await screen.findByText('Laser Pointer Tower')
      const search = screen.getByLabelText('Search board')
      fireEvent.change(search, { target: { value: 'laser' } })
      expect(screen.getByText('Laser Pointer Tower')).toBeInTheDocument()
      expect(screen.queryByText('Pet Shop Map')).not.toBeInTheDocument()
      expect(screen.queryByText('Balance Patch')).not.toBeInTheDocument()
    })

    it('narrows the board to a single column when a status filter pill is selected', async () => {
      const { container } = render(<ScratchyTDRoadmap {...defaultProps} />)
      await screen.findByText('Laser Pointer Tower')
      const statusGroup = Array.from(container.querySelectorAll('.srm-filter-group')).find((g) =>
        (g.textContent || '').includes('Status')
      ) as HTMLElement
      fireEvent.click(within(statusGroup).getByRole('button', { name: 'In Progress' }))
      await waitFor(() => {
        expect(container.querySelectorAll('.srm-column-header')).toHaveLength(0)
      })
      const fullCol = container.querySelector('.srm-column-full') as HTMLElement
      expect(fullCol).not.toBeNull()
      expect(within(fullCol).getByText('Laser Pointer Tower')).toBeInTheDocument()
      expect(within(fullCol).getByText('Bug: Save Slot Crash')).toBeInTheDocument()
      expect(within(fullCol).queryByText('Pet Shop Map')).not.toBeInTheDocument()
    })
  })
})

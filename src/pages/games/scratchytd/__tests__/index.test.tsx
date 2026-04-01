import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ScratchyTD, { getStaticProps } from '../index'
import { landingData } from '../../../../data/scratchytd-landing'

// Mock next/head to render children inline
jest.mock('next/head', () => {
  const MockHead = ({ children }: { children: React.ReactNode }) => <>{children}</>
  MockHead.displayName = 'MockHead'
  return MockHead
})

// Mock next/link to render as a plain anchor
jest.mock('next/link', () => {
  const MockLink = ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('ScratchyTD Landing Page', () => {
  const defaultProps = { landingData }

  describe('JSON data structure', () => {
    it('has required top-level keys', () => {
      expect(landingData).toHaveProperty('meta')
      expect(landingData).toHaveProperty('hero')
      expect(landingData).toHaveProperty('features')
      expect(landingData).toHaveProperty('status')
      expect(landingData).toHaveProperty('cta')
      expect(landingData).toHaveProperty('gallery')
      expect(landingData).toHaveProperty('footer')
      expect(landingData).toHaveProperty('nav')
    })

    it('features is an array', () => {
      expect(Array.isArray(landingData.features)).toBe(true)
    })

    it('each feature has icon, title, and text', () => {
      landingData.features.forEach((f: any) => {
        expect(f).toHaveProperty('icon')
        expect(f).toHaveProperty('title')
        expect(f).toHaveProperty('text')
      })
    })
  })

  describe('getStaticProps', () => {
    it('returns landingData as a prop', async () => {
      const result = await getStaticProps()
      expect(result).toHaveProperty('props')
      expect(result.props).toHaveProperty('landingData')
      expect(result.props.landingData.meta.title).toBe(landingData.meta.title)
    })
  })

  describe('Hero section', () => {
    it('renders the game title', () => {
      render(<ScratchyTD {...defaultProps} />)
      expect(screen.getByText(landingData.hero.title)).toBeInTheDocument()
      expect(screen.getByText(landingData.hero.titleAccent)).toBeInTheDocument()
    })

    it('renders the tagline', () => {
      render(<ScratchyTD {...defaultProps} />)
      expect(screen.getByText(landingData.hero.tagline)).toBeInTheDocument()
    })

    it('renders the description', () => {
      render(<ScratchyTD {...defaultProps} />)
      expect(screen.getByText(landingData.hero.description)).toBeInTheDocument()
    })

    it('renders hero icons from data', () => {
      render(<ScratchyTD {...defaultProps} />)
      landingData.hero.icons.forEach((icon: string) => {
        expect(screen.getByText(icon)).toBeInTheDocument()
      })
    })
  })

  describe('Feature cards', () => {
    it('renders all feature cards when features exist', () => {
      render(<ScratchyTD {...defaultProps} />)
      landingData.features.forEach((f: any) => {
        expect(screen.getByText(f.title)).toBeInTheDocument()
        expect(screen.getByText(f.text)).toBeInTheDocument()
      })
    })

    it('renders feature icons when features exist', () => {
      render(<ScratchyTD {...defaultProps} />)
      landingData.features.forEach((f: any) => {
        expect(screen.getByText(f.icon)).toBeInTheDocument()
      })
    })

    it('does not render features section when features array is empty', () => {
      const emptyFeaturesData = { ...landingData, features: [] }
      const { container } = render(<ScratchyTD landingData={emptyFeaturesData} />)
      expect(container.querySelector('.scratchy-features')).not.toBeInTheDocument()
    })
  })

  describe('Status banner', () => {
    it('renders the status badge', () => {
      render(<ScratchyTD {...defaultProps} />)
      expect(screen.getByText(landingData.status.badge)).toBeInTheDocument()
    })
  })

  describe('CTA section', () => {
    it('renders heading and button', () => {
      render(<ScratchyTD {...defaultProps} />)
      expect(screen.getByText(landingData.cta.heading)).toBeInTheDocument()
      expect(screen.getByText(landingData.cta.buttonText)).toBeInTheDocument()
    })

    it('links to the roadmap page', () => {
      render(<ScratchyTD {...defaultProps} />)
      const link = screen.getByText(landingData.cta.buttonText).closest('a')
      expect(link).toHaveAttribute('href', landingData.cta.buttonLink)
    })
  })

  describe('Gallery section', () => {
    it('renders the gallery placeholder text', () => {
      render(<ScratchyTD {...defaultProps} />)
      expect(screen.getByText(landingData.gallery.placeholderText)).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('renders back link to games page', () => {
      render(<ScratchyTD {...defaultProps} />)
      const backLink = screen.getByText(landingData.nav.backText).closest('a')
      expect(backLink).toHaveAttribute('href', landingData.nav.backLink)
    })
  })

  describe('Footer', () => {
    it('renders the author name with link', () => {
      render(<ScratchyTD {...defaultProps} />)
      const authorLink = screen.getByText(landingData.footer.authorName).closest('a')
      expect(authorLink).toHaveAttribute('href', landingData.footer.authorLink)
    })
  })
})

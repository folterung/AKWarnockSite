import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '../Header'

// Mock next/link to render as a plain anchor
jest.mock('next/link', () => {
  const MockLink = ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('Header Resume Dropdown', () => {
  it('renders a "Resume" dropdown trigger in desktop nav', () => {
    render(<Header />)
    const desktopNav = screen.getAllByText('Resume')
    expect(desktopNav.length).toBeGreaterThanOrEqual(1)
  })

  it('renders "Interactive" option linking to the interactive resume entry file', () => {
    render(<Header />)
    const interactiveLinks = screen.getAllByText('Interactive')
    const link = interactiveLinks[0].closest('a')
    expect(link).toHaveAttribute('href', '/resume-game/index.html')
  })

  it('renders "Traditional" option linking to the traditional resume entry file', () => {
    render(<Header />)
    const traditionalLinks = screen.getAllByText('Traditional')
    const link = traditionalLinks[0].closest('a')
    expect(link).toHaveAttribute('href', '/resume/index.html')
  })

  it('does not render "Interactive Resume" as a standalone link', () => {
    render(<Header />)
    expect(screen.queryByText('Interactive Resume')).not.toBeInTheDocument()
  })

  it('renders resume options in mobile menu when open', () => {
    render(<Header />)
    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /open main menu/i })
    fireEvent.click(menuButton)
    // Desktop + mobile should now both have these links
    const interactiveLinks = screen.getAllByText('Interactive')
    const traditionalLinks = screen.getAllByText('Traditional')
    expect(interactiveLinks.length).toBeGreaterThanOrEqual(2)
    expect(traditionalLinks.length).toBeGreaterThanOrEqual(2)
  })
})

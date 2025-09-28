'use client'
import { ThemeProvider } from 'next-themes'
export function ColorTheme({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider >
            {children}
        </ThemeProvider>
    )
}
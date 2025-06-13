#!/usr/bin/env bun
/**
 * Generate TypeScript types from Supabase schema
 * Run: bun run scripts/generate-types.ts
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const TYPES_DIR = 'src/types'
const TYPES_FILE = `${TYPES_DIR}/database.types.ts`

try {
    // Ensure types directory exists
    if (!existsSync(TYPES_DIR)) {
        mkdirSync(TYPES_DIR, { recursive: true })
    }

    console.log('🔄 Generating TypeScript types from Supabase schema...')

    // Generate types using Supabase CLI
    const command = `bunx supabase gen types typescript --local > ${TYPES_FILE}`
    execSync(command, { stdio: 'inherit' })

    console.log('✅ TypeScript types generated successfully!')
    console.log(`📁 Types saved to: ${TYPES_FILE}`)

} catch (error) {
    console.error('❌ Error generating types:', error)
    process.exit(1)
}

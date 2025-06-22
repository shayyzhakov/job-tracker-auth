import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://amnqqqglmwgvvcjyqvte.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtbnFxcWdsbXdndnZjanlxdnRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjY0MTcsImV4cCI6MjA2NTYwMjQxN30.Nto5QmhRUsDBvGgowsJ5pjOFffjvaVkN9QqE8pAiwOE'

// In-memory storage implementation
const inMemoryStorage = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return Promise.resolve(this.store[key] || null)
  },
  setItem(key: string, value: string) {
    this.store[key] = value
    return Promise.resolve()
  },
  removeItem(key: string) {
    delete this.store[key]
    return Promise.resolve()
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: inMemoryStorage,
  },
})
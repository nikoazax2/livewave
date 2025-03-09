// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qtziksdhzjvzxongwmsi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0emlrc2Roemp2enhvbmd3bXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MTUzNjksImV4cCI6MjA1NzA5MTM2OX0.bIYO0Uw1P6iTXmjgEG49fRQ7OVE39AiEdUAxmKMLKOU'
export const supabase = createClient(supabaseUrl, supabaseKey)

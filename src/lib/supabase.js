import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://euazmvfnvhgldikqftqf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1YXptdmZudmhnbGRpa3FmdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3Njk4MDAsImV4cCI6MjA4MjM0NTgwMH0.V-TlUYLpKG2ZZv2F7wXXFySqgS33Ziue0DQyJzSXIuc'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for common operations

// Courses
export const getCourses = async (category = null) => {
  let query = supabase.from('courses').select('*').order('id')
  if (category && category !== 'All') {
    query = query.eq('category', category)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

export const getCourseById = async (id) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Projects
export const getProjects = async (category = null) => {
  let query = supabase.from('projects').select('*').order('created_at')
  if (category && category !== 'All') {
    query = query.eq('category', category)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

export const getProjectById = async (id) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Workshops
export const getWorkshops = async () => {
  const { data, error } = await supabase
    .from('workshops')
    .select('*')
    .order('created_at')
  if (error) throw error
  return data
}

export const registerForWorkshop = async (workshopId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be logged in')
  
  const { data, error } = await supabase
    .from('workshop_registrations')
    .insert({ user_id: user.id, workshop_id: workshopId })
    .select()
    .single()
  if (error) throw error
  return data
}

// Electronics
export const getElectronics = async (category = null) => {
  let query = supabase.from('electronics').select('*').order('name')
  if (category && category !== 'All') {
    query = query.eq('category', category)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

export const searchElectronics = async (searchTerm) => {
  const { data, error } = await supabase
    .from('electronics')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  if (error) throw error
  return data
}

// User enrollments
export const enrollInCourse = async (courseId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be logged in')
  
  const { data, error } = await supabase
    .from('course_enrollments')
    .insert({ user_id: user.id, course_id: courseId })
    .select()
    .single()
  if (error) throw error
  return data
}

export const getUserEnrollments = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const { data, error } = await supabase
    .from('course_enrollments')
    .select(`
      *,
      courses (*)
    `)
    .eq('user_id', user.id)
  if (error) throw error
  return data
}

export const updateCourseProgress = async (enrollmentId, progress, completed = false) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be logged in')
  
  const { data, error } = await supabase
    .from('course_enrollments')
    .update({ progress, completed, updated_at: new Date().toISOString() })
    .eq('id', enrollmentId)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Contact form
export const submitContactForm = async (formData) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const submission = {
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    subject: formData.subject,
    message: formData.message,
    user_id: user?.id || null
  }
  
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert(submission)
    .select()
    .single()
  if (error) throw error
  return data
}

// Testimonials
export const getTestimonials = async (featured = false) => {
  let query = supabase.from('testimonials').select('*').order('created_at', { ascending: false })
  if (featured) {
    query = query.eq('featured', true)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

// Auth helpers
export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })
  if (error) throw error
  return data
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (error) throw error
  return data
}


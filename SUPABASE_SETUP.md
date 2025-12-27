# Supabase Backend Setup

## Database Schema

The Supabase backend has been set up with the following tables:

### Core Tables

1. **profiles** - User profiles linked to auth.users
   - Stores user information (email, full_name, avatar_url)
   - Automatically created when a user signs up

2. **courses** - Course catalog
   - 20 courses across Beginner, Intermediate, and Advanced levels
   - Includes syllabus, outcomes, and metadata

3. **projects** - Project library
   - Projects organized by category and difficulty
   - Includes tools, steps, and descriptions

4. **workshops** - Workshop events
   - Upcoming workshops with dates, locations, and highlights

5. **electronics** - Component library
   - Electronic components with descriptions and how they work
   - Organized by category (Passives, Semiconductors, ICs, etc.)

### User Interaction Tables

6. **course_enrollments** - Track user course progress
   - Links users to courses
   - Tracks progress (0-100%) and completion status

7. **workshop_registrations** - Workshop signups
   - Links users to workshops they've registered for

8. **contact_submissions** - Contact form submissions
   - Stores contact form data
   - Optionally linked to user accounts

9. **testimonials** - User testimonials
   - Featured testimonials for the homepage

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Public read access**: courses, projects, workshops, electronics, testimonials
- **User-specific access**: profiles, enrollments, registrations, contact submissions
- **Authenticated users only**: Can enroll in courses, register for workshops, submit contact forms

## API Endpoints

The Supabase client is configured in `src/lib/supabase.js` with helper functions for:

- **Courses**: `getCourses()`, `getCourseById()`, `enrollInCourse()`, `getUserEnrollments()`, `updateCourseProgress()`
- **Projects**: `getProjects()`, `getProjectById()`
- **Workshops**: `getWorkshops()`, `registerForWorkshop()`
- **Electronics**: `getElectronics()`, `searchElectronics()`
- **Contact**: `submitContactForm()`
- **Testimonials**: `getTestimonials()`
- **Auth**: `signUp()`, `signIn()`, `signOut()`, `getCurrentUser()`, `getUserProfile()`

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://euazmvfnvhgldikqftqf.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Or use the values from `.env.example`.

## Installation

1. Install the Supabase client:
```bash
npm install @supabase/supabase-js
```

2. Import and use in your components:
```javascript
import { supabase, getCourses, enrollInCourse } from '@/lib/supabase'
```

## Usage Example

```javascript
// Get all courses
const courses = await getCourses()

// Filter by category
const beginnerCourses = await getCourses('Beginner')

// Enroll in a course (requires authentication)
await enrollInCourse(courseId)

// Get user's enrollments
const enrollments = await getUserEnrollments()

// Submit contact form
await submitContactForm({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  subject: 'Question',
  message: 'Hello!'
})
```

## Database URL

- **Project URL**: https://euazmvfnvhgldikqftqf.supabase.co
- **API URL**: https://euazmvfnvhgldikqftqf.supabase.co

## Next Steps

1. Install dependencies: `npm install`
2. Create `.env` file with your Supabase credentials
3. Start using the Supabase client in your components
4. Test authentication and data fetching


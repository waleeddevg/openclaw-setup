import { currentUser } from '@clerk/nextjs/server'

// Warn loudly at startup if ADMIN_EMAIL is not configured.
// Without this, isAdmin() silently returns false for everyone — including real admins.
if (!process.env.ADMIN_EMAIL) {
  console.error(
    '[CRITICAL] ADMIN_EMAIL environment variable is not set. ' +
    'All admin routes will be inaccessible until this is configured.'
  )
}

const ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',').map(email => email.trim()) || []

export async function isAdmin(): Promise<boolean> {
  const user = await currentUser()
  
  if (!user) {
    return false
  }

  const userEmail = user.emailAddresses[0]?.emailAddress
  
  if (!userEmail) {
    return false
  }

  return ADMIN_EMAILS.includes(userEmail)
}

export async function getCurrentUser() {
  return await currentUser()
}

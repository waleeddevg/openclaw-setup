import { currentUser } from '@clerk/nextjs/server'

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

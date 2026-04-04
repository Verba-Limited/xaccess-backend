import { postJsonEnvelope, unwrapEnvelope } from './client'

export type MessageRow = {
  id: string
  subject: string
  body: string
  senderId: string
  recipientId: string | null
  readAt: string | null
  createdAt: string
  senderName: string | null
  recipientName: string | null
}

export async function fetchCommunityMessagesInbox() {
  return unwrapEnvelope<MessageRow[]>('/users/community/messages/inbox')
}

export async function fetchCommunityMessagesSent() {
  return unwrapEnvelope<MessageRow[]>('/users/community/messages/sent')
}

export async function fetchCommunityMessage(id: string) {
  return unwrapEnvelope<MessageRow>(`/users/community/messages/${id}`)
}

export async function createCommunityMessage(body: {
  subject: string
  body: string
  recipientId?: string | null
}) {
  return postJsonEnvelope<MessageRow, typeof body>('/users/community/messages', body)
}

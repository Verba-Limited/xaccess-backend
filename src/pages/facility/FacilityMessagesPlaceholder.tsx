import { MessageSquare } from 'lucide-react'

export function FacilityMessagesPlaceholder() {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 text-center">
      <MessageSquare className="h-12 w-12 text-[#D1D5DB]" strokeWidth={1.5} />
      <p className="text-sm font-medium text-[#6B7280]">Select a message</p>
      <p className="max-w-xs text-xs text-[#9CA3AF]">
        Choose a message from the list to read the full conversation.
      </p>
    </div>
  )
}

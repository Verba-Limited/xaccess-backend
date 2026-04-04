import { unwrapEnvelope } from './client'
import type { Community } from './types'

/** No JWT — active communities for facility login picker */
export function fetchPublicCommunities() {
  return unwrapEnvelope<Pick<Community, 'id' | 'name' | 'slug'>[]>(
    '/public/communities',
  )
}

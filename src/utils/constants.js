/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { env } from '~/config/environment'
export const WHITELIST_DOMAINS = [
    // 'http://localhost:5173'
    'https://trello-note-app.vercel.app'
]
export const BOARD_TYPES = {
    PUBLIC: 'public',
    PRIVATE: 'private'
}
export const WEBSTE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

export const DEFAULT_PAGE= 1
export const DEFAULT_ITEMS_PER_PAGE= 12

export const INVITATION_TYPES = {
    BOARD_INVITATION: 'BOARD_INVITATION'
}

export const BOARD_INVITATION_STATUS = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED'
}

export const CARD_MEMBER_ACTIONS = {
    ADD: 'ADD',
    REMOVE: 'REMOVE'
}
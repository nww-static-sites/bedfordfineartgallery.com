import axios from 'axios'
import config from '~/config'
import { getCookie } from '~/libs/cookie'

const { nextLeadUrl } = config

const getConfig = ({ formPage, origin }) => {
    const href = formPage || window.location.href
    return { formPage: origin ? href.replace(window.location.origin, origin) : href }
}

export default {
    logActivity(context) {
        if (!context.sessionId) {
            throw new Error('sessionId required')
        }

        return axios.post(`${nextLeadUrl}/activity`, {
            ...getConfig({ origin: config.nextLeadOrigin }),
            ...context,
            userId: getCookie('userId'),
        })
    },
    updateForm({ uuid, formName, formValues, formPage, sessionId, turnstileToken }) {
        if (!sessionId) {
            throw new Error('sessionId required')
        }

        return axios.post(
            `${nextLeadUrl}/update`,
            {
                ...getConfig({ formPage, origin: config.nextLeadOrigin }),
                uuid,
                formName,
                formValues,
                landingUrl: getCookie('landingUrl'),
                referer: getCookie('referer'),
                utmSource: getCookie('utmSource'),
                utmMedium: getCookie('utmMedium'),
                utmCampaign: getCookie('utmCampaign'),
                utmTerm: getCookie('utmTerm'),
                utmContent: getCookie('utmContent'),
                utmAdGroup: getCookie('utmAdGroup'),
                adPosition: getCookie('adPosition'),
                matchType: getCookie('matchType'),
                queryString: getCookie('queryString'),
                userId: getCookie('userId'),
                sessionId,
                turnstileToken,
            },
            turnstileToken ? { timeout: 8000 } : undefined,
        )
    },
    submitForm({ uuid, formName, formValues, recaptchaToken, turnstileToken, deliveryReceipt, formPage, sessionId }) {
        if (!sessionId) {
            throw new Error('sessionId required')
        }

        return axios.post(
            `${nextLeadUrl}/submit`,
            {
                ...getConfig({ formPage, origin: config.nextLeadOrigin }),
                uuid,
                formName,
                formValues,
                recaptchaToken,
                turnstileToken,
                deliveryReceipt,
                landingUrl: getCookie('landingUrl'),
                referer: getCookie('referer'),
                utmSource: getCookie('utmSource'),
                utmMedium: getCookie('utmMedium'),
                utmCampaign: getCookie('utmCampaign'),
                utmTerm: getCookie('utmTerm'),
                utmContent: getCookie('utmContent'),
                utmAdGroup: getCookie('utmAdGroup'),
                adPosition: getCookie('adPosition'),
                matchType: getCookie('matchType'),
                queryString: getCookie('queryString'),
                userId: getCookie('userId'),
                sessionId,
            },
            deliveryReceipt ? { timeout: 15000 } : undefined,
        )
    },
    async waitForInquiryEmail(deliveryReceipt) {
        if (!deliveryReceipt) return 'unconfirmed'
        const deadline = Date.now() + 25000
        do {
            try {
                const { data } = await axios.post(
                    `${nextLeadUrl}/submit`,
                    { deliveryStatus: deliveryReceipt },
                    {
                        timeout: 3500,
                    },
                )
                if (data.emailStatus === 'sent') return 'sent'
                if (data.emailStatus === 'failed') return 'error'
                if (data.emailStatus === 'unconfirmed') return 'unconfirmed'
            } catch (error) {
                if (error.response?.status === 403) return 'unconfirmed'
            }
            await new Promise((resolve) => setTimeout(resolve, 1500))
        } while (Date.now() < deadline)
        return 'unconfirmed'
    },
}

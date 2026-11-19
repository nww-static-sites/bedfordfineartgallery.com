<template>
    <form
        class="inquiry-form"
        :class="formClass"
        name="contactform"
        method="post"
        :aria-busy="isSubmitting"
        @submit.prevent="submit"
    >
        <input
            :id="`${fieldId}-email`"
            ref="emailInput"
            v-model="form.email"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="Email Address"
            aria-label="Email Address"
            maxlength="254"
            :disabled="fieldsDisabled"
            required
        />
        <textarea
            :id="`${fieldId}-comments`"
            v-model="form.comments"
            name="comments"
            placeholder="Type your message here."
            aria-label="Message"
            maxlength="6000"
            :disabled="fieldsDisabled"
        ></textarea>
        <label class="newsletter-choice">
            <input v-model="newsletterOptIn" type="checkbox" name="newsletter-opt-in" :disabled="fieldsDisabled" />
            <span>{{ newsletterConsentText }}</span>
        </label>
        <button type="submit" class="submit" :disabled="fieldsDisabled">
            {{ isSubmitting ? 'Sending…' : 'Send Message' }}
        </button>
        <p class="inquiry-status" :class="submitStatus" role="status" aria-atomic="true">
            <template v-if="statusMessage">
                <span v-if="statusIcon" aria-hidden="true">{{ statusIcon }}</span>
                {{ statusMessage }}
            </template>
        </p>
        <p v-if="statusDetail" class="inquiry-detail">{{ statusDetail }}</p>
        <p v-if="newsletterMessage" class="inquiry-detail" role="status">{{ newsletterMessage }}</p>
        <div ref="inquiryChallenge" class="aln__challenge"></div>
        <div ref="draftChallenge" class="aln__challenge"></div>
        <div ref="newsletterChallenge" class="aln__challenge"></div>
    </form>
</template>

<script>
import NextLeadMixin from '~/mixins/NextLeadMixin'
import NextLeadService from '~/services/NextLeadService'
import { joinNewsletter, requestTurnstileToken } from '~/utils/newsletterClient'

const newsletterConsentText = "Yes, send me Art Lovers' Niche Newsletter by email."
const inquirySitekey = '0x4AAAAAAF3En7HtDWKMaOj9'
const newsletterMessages = {
    confirmation_required: 'Please check your email to confirm your newsletter subscription.',
    unsubscribed:
        'This email address was previously unsubscribed. Please contact the gallery to rejoin the newsletter.',
}

export default {
    mixins: [NextLeadMixin],
    props: {
        formName: {
            type: String,
            required: true,
            validator(value) {
                return ['Painting', 'Contact'].includes(value)
            },
        },
        formType: {
            type: String,
            required: false,
            default: undefined,
            validator(value) {
                return ['desktop', 'mobile', '', undefined, null].includes(value)
            },
        },
        paintingTitle: {
            type: String,
            required: false,
            default: undefined,
        },
        artistNameWithTinyDescription: {
            type: String,
            required: false,
            default: undefined,
        },
    },
    data() {
        const paintingFormValues = {}
        if (this.formName === 'Painting') {
            if (this.paintingTitle) {
                paintingFormValues.painting = this.paintingTitle
            }
            if (this.artistNameWithTinyDescription) {
                paintingFormValues.artist = this.artistNameWithTinyDescription
            }
        }
        return {
            submitStatus: null,
            submissionAccepted: false,
            ready: false,
            inquiryAttempted: false,
            newsletterOptIn: false,
            newsletterConsentText,
            newsletterStatus: '',
            form: {
                ...paintingFormValues,
                email: null,
                comments: null,
            },
        }
    },
    computed: {
        fieldId() {
            return `inquiry-${this.formName.toLowerCase()}-${this.formType || 'default'}`
        },
        formClass() {
            if (this.formType === 'desktop') {
                return 'form_desktop'
            } else if (this.formType === 'mobile') {
                return 'form_mobile'
            }

            return ''
        },
        isSubmitting() {
            return this.submitStatus === 'submitting'
        },
        fieldsDisabled() {
            return !this.ready || this.isSubmitting || this.submissionAccepted || this.submitStatus === 'unconfirmed'
        },
        statusMessage() {
            return {
                submitting: 'Sending email…',
                sent: 'Email Sent',
                error: 'Email Failed to Send',
                unconfirmed: 'Email Status Unconfirmed',
            }[this.submitStatus]
        },
        statusIcon() {
            return { sent: '✓', error: '✕' }[this.submitStatus]
        },
        statusDetail() {
            if (this.submitStatus === 'unconfirmed') return 'Please call Jerry to confirm he received your message.'
            if (this.submitStatus !== 'error') return ''
            return this.submissionAccepted ? 'Please call Jerry about your inquiry.' : 'Please try again or call Jerry.'
        },
        newsletterMessage() {
            if (!this.newsletterStatus) return ''
            return newsletterMessages[this.newsletterStatus] || 'We couldn’t confirm your newsletter signup.'
        },
    },
    mounted() {
        this.ready = true
    },
    methods: {
        async saveNextLeadDraft(payload) {
            const email = this.$refs.emailInput
            if (this.inquiryAttempted || !email?.value || !email.validity.valid) return
            const turnstileToken = await requestTurnstileToken(
                this.$refs.draftChallenge,
                inquirySitekey,
                'bedford_inquiry',
            )
            if (!this.inquiryAttempted) await NextLeadService.updateForm({ ...payload, turnstileToken })
        },
        async subscribe(email) {
            try {
                const result = await joinNewsletter(email, this.$refs.newsletterChallenge, () => {})
                if (result.verified !== true || !['joined', 'already'].includes(result.status)) {
                    this.newsletterStatus = result.status || 'unknown'
                }
            } catch (error) {
                this.newsletterStatus = 'unknown'
            }
        },
        async submit() {
            if (this.fieldsDisabled) return
            const optedIn = this.newsletterOptIn === true
            const email = (this.form.email || '').trim()
            if (!email) return
            this.inquiryAttempted = true
            const additionalFields = optedIn
                ? [
                      { name: 'newsletterConsent', label: 'Newsletter consent', value: newsletterConsentText },
                      {
                          name: 'newsletterConsentAt',
                          label: 'Newsletter consent date (UTC)',
                          value: new Date().toISOString(),
                      },
                      {
                          name: 'newsletterConsentSource',
                          label: 'Newsletter consent source form',
                          value: [this.formName, this.formType].filter(Boolean).join(' / '),
                      },
                  ]
                : []
            this.submitStatus = 'submitting'
            let requestStarted = false
            try {
                const turnstileToken = await requestTurnstileToken(
                    this.$refs.inquiryChallenge,
                    inquirySitekey,
                    'bedford_inquiry',
                )
                await this.waitForNextLeadDraft()
                requestStarted = true
                const response = await this.submitToNextLead({
                    additionalFields,
                    turnstileToken,
                    deliveryReceipt: true,
                })
                if (response.data.status !== true) {
                    this.submitStatus = 'error'
                    return
                }
                this.submissionAccepted = true
                if (optedIn) this.subscribe(email)
                this.submitStatus = await NextLeadService.waitForInquiryEmail(response.data.deliveryReceipt)
            } catch (error) {
                this.submitStatus =
                    this.submissionAccepted ||
                    (requestStarted &&
                        (!error.response ||
                            (error.response.status >= 500 && error.response.data?.code !== 'security_unavailable')))
                        ? 'unconfirmed'
                        : 'error'
            }
        },
    },
}
</script>

<style scoped>
.inquiry-form input[type='email'],
.inquiry-form textarea {
    background: #fffdf9;
    border: 1px solid #96866d;
    border-radius: 8px;
    color: #3b3028;
    font-size: 17px;
    line-height: 1.45;
    margin: 0;
    padding: 12px;
}

.inquiry-form input::placeholder,
.inquiry-form textarea::placeholder {
    color: #746e67;
    opacity: 1;
}

.inquiry-form textarea {
    display: block;
    margin-top: 8px;
    min-height: 148px;
    resize: vertical;
}

.newsletter-choice,
.inquiry-status,
.inquiry-detail {
    font-size: 16px;
    line-height: 1.45;
}

.newsletter-choice {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 0 4px;
    cursor: pointer;
}

.newsletter-choice input {
    appearance: auto;
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    padding: 0;
    margin: 2px 0 0;
    accent-color: #823631;
}

.inquiry-form .submit {
    background: #823631;
    border: 0;
    border-radius: 12px;
    color: #fff8ed;
    cursor: pointer;
    display: block;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: normal;
    margin: 8px 0 0;
    min-height: 46px;
    padding: 10px 20px;
    text-transform: none;
}

.inquiry-form .submit:hover:not(:disabled) {
    background: #692923;
}

.inquiry-form .submit:disabled {
    cursor: default;
    opacity: 0.75;
}

.inquiry-status {
    margin: 12px 0 0;
    font-weight: 700;
}

.inquiry-status.sent {
    color: #225321;
}

.inquiry-status.error {
    color: #891f27;
}

.inquiry-detail {
    margin: 4px 0 0;
}

.inquiry-status:empty {
    margin: 0;
}
</style>

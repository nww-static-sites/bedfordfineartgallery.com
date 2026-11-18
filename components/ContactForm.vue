<template>
    <form :class="formClass" name="contactform" method="post" :aria-busy="isSubmitting" @submit.prevent="submit">
        <label :for="`${fieldId}-email`">Email</label>
        <input
            :id="`${fieldId}-email`"
            v-model="form.email"
            name="email"
            type="email"
            autocomplete="email"
            :aria-describedby="`${fieldId}-email-use`"
            :disabled="fieldsDisabled"
            required
        />
        <p :id="`${fieldId}-email-use`" class="email-use">We will only use your email to reply to your inquiry.</p>
        <label class="newsletter-choice">
            <input v-model="newsletterOptIn" type="checkbox" name="newsletter-opt-in" :disabled="fieldsDisabled" />
            <span>{{ newsletterConsentText }}</span>
        </label>
        <nuxt-link class="privacy-link" to="/privacy.htm">Privacy Policy</nuxt-link>

        <label :for="`${fieldId}-comments`">Message</label>
        <textarea
            :id="`${fieldId}-comments`"
            v-model="form.comments"
            name="comments"
            :disabled="fieldsDisabled"
        ></textarea>
        <div class="buttons">
            <button type="submit" class="submit" :disabled="fieldsDisabled">
                {{ isSubmitting ? 'Sending…' : 'Send' }}
            </button>
        </div>
        <p class="inquiry-status" role="status" aria-live="polite">{{ statusMessage }}</p>
        <div ref="newsletterChallenge" class="aln__challenge"></div>
    </form>
</template>

<script>
import NextLeadMixin from '~/mixins/NextLeadMixin'
import { joinNewsletter } from '~/utils/newsletterClient'

const newsletterConsentText = "Yes, send me Art Lovers' Niche Newsletter by email."
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
            ready: false,
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
            return !this.ready || this.isSubmitting || this.submitStatus === 'sent'
        },
        statusMessage() {
            if (this.submitStatus === 'error') return 'We couldn’t send your inquiry. Please try again.'
            if (!this.newsletterStatus) return ''
            const message = newsletterMessages[this.newsletterStatus] || 'We couldn’t confirm your newsletter signup.'
            return `Your inquiry was sent. ${message}`
        },
    },
    mounted() {
        this.ready = true
    },
    methods: {
        async submit() {
            if (this.fieldsDisabled) return
            const optedIn = this.newsletterOptIn === true
            const email = (this.form.email || '').trim()
            if (!email) return
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
            try {
                const response = await this.submitToNextLead({ additionalFields })
                if (response.data.status !== true) throw new Error('Inquiry submission was not accepted')
            } catch (error) {
                this.submitStatus = 'error'
                return
            }

            if (optedIn) {
                try {
                    const result = await joinNewsletter(email, this.$refs.newsletterChallenge, () => {})
                    if (result.verified !== true || !['joined', 'already'].includes(result.status)) {
                        this.newsletterStatus = result.status || 'unknown'
                    }
                } catch (error) {
                    this.newsletterStatus = 'unknown'
                }
            }
            this.submitStatus = 'sent'
            if (!this.newsletterStatus) this.$router.push({ name: 'contact_thanks' })
        },
    },
}
</script>

<style scoped>
.email-use,
.newsletter-choice,
.privacy-link,
.inquiry-status {
    font-size: 16px;
    line-height: 1.45;
}

.email-use {
    margin: 4px 0 0;
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
    accent-color: #841012;
}

.privacy-link {
    text-decoration: underline;
}

.inquiry-status:empty {
    margin: 0;
}
</style>

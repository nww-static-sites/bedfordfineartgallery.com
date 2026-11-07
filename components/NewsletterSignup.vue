<template>
    <div class="nww-newsletter" :class="{ 'nww-newsletter--inline': !popup }">
        <form
            v-show="!success"
            ref="form"
            class="aln__form"
            method="post"
            action="https://beta.ecommerceplatform.com/forms/mems_list.cgi"
            :aria-busy="!ready || busy ? 'true' : 'false'"
            @submit.prevent="submit"
        >
            <label class="aln__sr-only" :for="inputId">Your email</label>
            <input
                :id="inputId"
                v-model="email"
                class="aln__email"
                type="email"
                name="e"
                placeholder="Your email"
                autocomplete="email"
                inputmode="email"
                required
                :disabled="!ready"
                :readonly="busy"
            />
            <input type="hidden" name="m" value="88" />
            <input type="hidden" name="l" value="1263" />
            <input type="hidden" name="r" value="https://www.bedfordfineartgallery.com/mailing_list_thanks.htm" />
            <button
                class="aln__join"
                :class="{ 'is-busy': busy }"
                type="submit"
                :disabled="!ready || busy"
                @click.prevent="submit"
            >
                {{ busy ? 'Joining…' : 'Join Newsletter' }}
            </button>
        </form>
        <p
            v-if="status"
            class="aln__status"
            :class="{ 'is-success': success, 'is-error': !success }"
            role="status"
            aria-live="polite"
        >
            <span v-if="success" class="aln__check" aria-hidden="true">✓</span>{{ message }}
        </p>
        <div ref="challenge" class="aln__challenge"></div>
    </div>
</template>

<script>
import { joinNewsletter } from '~/utils/newsletterClient'

const messages = {
    joined: 'Joined!',
    already: 'Already Joined!',
    confirmation_required: 'Please check your email to confirm your subscription.',
    unsubscribed: 'This email was previously unsubscribed. Please contact the gallery to rejoin.',
    other_list: 'This email is registered on another gallery list. Please contact the gallery to join this newsletter.',
    verification_failed: 'We couldn’t complete the security check. Please try again.',
    rate_limited: 'Please wait a minute before trying again.',
    unknown: 'We couldn’t verify the result. Please contact the gallery before trying again.',
    unavailable: 'Signup is temporarily unavailable. Please try again shortly.',
}

export default {
    props: {
        inputId: { type: String, required: true },
        popup: { type: Boolean, default: false },
    },
    data() {
        return { email: '', ready: false, busy: false, status: '', success: false }
    },
    mounted() {
        this.ready = true
    },
    computed: {
        message() {
            return messages[this.status] || messages.unavailable
        },
    },
    methods: {
        async submit() {
            if (!this.ready || this.busy || !this.$refs.form.reportValidity()) return
            this.busy = true
            this.status = ''
            try {
                const result = await joinNewsletter(this.email, this.$refs.challenge, () => {})
                this.success = result.verified === true && ['joined', 'already'].includes(result.status)
                this.status = this.success || !['joined', 'already'].includes(result.status) ? result.status : 'unknown'
            } catch (error) {
                this.status = error.message === 'verification_failed' ? 'verification_failed' : 'unknown'
            } finally {
                this.busy = false
            }
        },
    },
}
</script>

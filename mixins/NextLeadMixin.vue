<script>
import { v4 as uuidv4 } from 'uuid'
import debounce from 'lodash/debounce'
import { isUselessLead } from '~/libs/useless-lead'
import NextLeadService from '~/services/NextLeadService'
import { googleConvert } from '~/libs/google-conversion'

export default {
    data() {
        const mixinData = { formStarted: false, submittedGoogleConversion: false }
        if (!this.nextLeadUUID) {
            mixinData.nextLeadUUID = uuidv4()
        }

        return mixinData
    },
    computed: {
        fieldsToSubmitComputed() {
            if (this.fieldsToSubmit === undefined || this.fieldsToSubmit === null || this.fieldsToSubmit.length === 0) {
                return Object.keys(this.form)
            }

            return this.fieldsToSubmit
        },
        formValuesPayload() {
            return this.fieldsToSubmitComputed.map((fieldToSubmit) => {
                const label =
                    this.nameToLabel && this.nameToLabel[fieldToSubmit]
                        ? { label: this.nameToLabel[fieldToSubmit] }
                        : {}
                return {
                    name: fieldToSubmit,
                    value: this.form[fieldToSubmit],
                    ...label,
                }
            })
        },
    },
    watch: {
        form: {
            async handler(formValues) {
                if (!this.isFormEmpty()) {
                    this.debouncedUpdateForm({
                        uuid: this.nextLeadUUID,
                        formName: this.formName,
                        formValues: this.formValuesPayload,
                        formPage: this.formPage,
                        sessionId: this.$sessionId,
                    })

                    if (!this.formStarted) {
                        this.formStarted = true
                        await NextLeadService.logActivity({
                            type: 'START_FORM',
                            formName: this.formName,
                            sessionId: this.$sessionId,
                            formUUID: this.nextLeadUUID,
                        })
                    }

                    if (this.googleConvert && !this.submittedGoogleConversion && !isUselessLead({ ...this.form })) {
                        this.submittedGoogleConversion = true
                        googleConvert(this.$gtag)
                    }
                }
            },
            deep: true,
        },
    },
    created() {
        this.debouncedUpdateForm = this.saveNextLeadDraft
            ? debounce(this.updateVerifiedDraft, 1500)
            : debounce(NextLeadService.updateForm, 500)
    },
    beforeDestroy() {
        this.debouncedUpdateForm.cancel()
    },
    methods: {
        updateVerifiedDraft(payload) {
            const previous = this.nextLeadDraft || Promise.resolve()
            this.nextLeadDraft = previous.then(() => this.saveNextLeadDraft(payload)).catch(() => {})
        },
        async waitForNextLeadDraft() {
            this.debouncedUpdateForm.cancel()
            await this.nextLeadDraft
        },
        async submitToNextLead({ recaptchaToken, turnstileToken, deliveryReceipt, additionalFields = [] }) {
            this.debouncedUpdateForm.cancel()
            const uuid = this.nextLeadUUID
            const submission = NextLeadService.submitForm({
                uuid,
                formName: this.formName,
                formValues: [...this.formValuesPayload, ...additionalFields],
                formPage: this.formPage,
                recaptchaToken: recaptchaToken || this.recaptchaToken,
                turnstileToken,
                deliveryReceipt,
                sessionId: this.$sessionId,
            })
            const activity = () =>
                NextLeadService.logActivity({
                    type: 'SUBMIT_FORM',
                    formName: this.formName,
                    sessionId: this.$sessionId,
                    formUUID: uuid,
                })
            const response = deliveryReceipt ? await submission : (await Promise.all([submission, activity()]))[0]
            if (deliveryReceipt && response.data.status === true) {
                // Analytics should never change the outcome shown for an accepted inquiry.
                Promise.resolve()
                    .then(() => activity())
                    .catch(() => {})
            }

            this.nextLeadUUID = uuidv4()
            return response
        },
        isFormEmpty() {
            return this.fieldsToSubmitComputed.every((field) => {
                const value = this.form[field]
                return value === undefined || value === null || value === ''
            })
        },
    },
}
</script>

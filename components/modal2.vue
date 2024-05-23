<template>
    <div>
        <transition name="fade" appear>
            <div class="modal-overlay" @click="$emit('close')"></div>
        </transition>
        <transition name="pop" appear>
            <div class="modal" role="dialog">
                <div style="position: relative">
                    <h2>Like what you see?</h2>
                    <p>Become an Art Lover's Niche Insider</p>
                    <p>Monthly Treasure Straight to your inbox</p>
                    <div class="guide_info_popup">
                        <nuxt-picture
                            provider="cloudinary"
                            :img-attrs="{ class: 'art_detail' }"
                            loading="lazy"
                            src="https://res.cloudinary.com/dg6smdedp/image/upload/v1716460385/images/john_ross_key_country_garden.png"
                            width="1400"
                            height="1222"
                            alt=""
                        />
                    </div>

                    <form
                        id="remsform"
                        action="https://accept.nittanyweb.com/remote_add_name.cgi"
                        method="post"
                        name="remsform"
                    >
                        <input
                            id="e"
                            type="text"
                            placeholder="Email Address"
                            name="e"
                            style="margin-bottom: 8px; margin-top: 15px"
                        />
                        <input id="m2" name="m" type="hidden" value="88" />
                        <input id="l2" name="l" type="hidden" value="1263" />
                        <input
                            id="r"
                            name="r"
                            type="hidden"
                            value="https://www.bedfordfineartgallery.com/mailing_list_thanks.htm"
                        />
                        <input type="submit" value="Join the Movement" />
                    </form>

                    <button class="button button-x" @click="$emit('close')">X</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import NextLeadMixin from '~/mixins/NextLeadMixin'

export default {
    mixins: [NextLeadMixin],
    props: {
        mediumResImage: {
            type: String,
            required: true,
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
        return {
            formName: 'Modal',
            submitStatus: null,
            form: {
                painting: this.paintingTitle,
                artist: this.artistNameWithTinyDescription,
                name: null,
                phone: null,
                email: null,
            },
        }
    },
    computed: {
        isSubmitting() {
            return this.submitStatus === 'submitting'
        },
        mediumResImageWithoutCloudinaryPrefix() {
            return this.mediumResImage.replace('https://res.cloudinary.com/dg6smdedp/image/upload', '')
        },
    },
    methods: {
        async submit() {
            this.submitStatus = 'submitting'

            try {
                await this.submitToNextLead({})
                this.$router.push({ name: 'contact_thanks' })
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log(e)
                this.submitStatus = 'error'
            }
        },
    },
}
</script>

<style scoped>
.modal {
    position: absolute;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    text-align: center;
    width: fit-content;
    height: fit-content;
    max-width: 460px;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);
    background: #fff;
    z-index: 999;
    transform: none;
}
.modal h1 {
    margin: 0 0 1rem;
}

.modal img {
    width: 100%;
    height: auto;
    max-width: 200px;
    margin: auto;
}

.modal textarea,
.modal input {
    width: 100%;
    border: 1px solid #bebebe;
    border-radius: 6px;
    max-width: 660px;
    margin: auto;
    padding: 10px;
}
.modal label {
    text-align: left !important;
}

.modal-overlay {
    content: '';
    position: absolute;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 998;
    background: #2c3e50;
    opacity: 0.6;
    cursor: pointer;
}

/* ---------------------------------- */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s linear;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.pop-enter-active,
.pop-leave-active {
    transition: transform 0.4s cubic-bezier(0.5, 0, 0.5, 1), opacity 0.4s linear;
}

.pop-enter,
.pop-leave-to {
    opacity: 0;
    transform: scale(0.3) translateY(-50%);
}
.button-x {
    position: absolute;
    right: 0;
    top: 0;
}
</style>

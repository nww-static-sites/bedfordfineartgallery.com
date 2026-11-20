<template>
    <div>
        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="artwork_header">
                    <h1>Unsubscribe</h1>
                    <span class="hr"></span>
                </div>

                <div class="unsubscribe-panel">
                    <p>Enter the email address you use for Art Lovers’ Niche.</p>

                    <form
                        id="remsform"
                        action="https://beta.ecommerceplatform.com/forms/mems_list.cgi"
                        method="post"
                        name="remsform"
                    >
                        <input
                            id="e"
                            type="email"
                            placeholder="Email Address"
                            aria-label="Email Address"
                            autocomplete="email"
                            maxlength="254"
                            name="e"
                            required
                        />
                        <input id="m2" name="m" type="hidden" value="88" />
                        <input id="rem" name="rem" type="hidden" value="y" />
                        <input
                            id="r"
                            name="r"
                            type="hidden"
                            value="https://www.bedfordfineartgallery.com/remove_thank_you.htm"
                        />
                        <button type="submit">Unsubscribe</button>
                    </form>
                </div>
            </section>
        </div>
        <div
            class="container footer_test"
            style="padding-top: 24px; width: 100%; margin: 0px auto; background-color: rgba(16, 88, 185, 1)"
        >
            <section class="wrapper" style="max-width: 860px; margin: auto">
                <TestimonialsScroll />
            </section>
        </div>
    </div>
</template>

<script>
import TestimonialsScroll from '~/components/TestimonialsScroll'

export default {
    components: { TestimonialsScroll },
}
</script>

<style scoped>
.unsubscribe-panel {
    background: #ddd1ad;
    border-radius: 20px;
    color: #444;
    margin: 0 auto 32px;
    max-width: 560px;
    padding: 20px;
}

.unsubscribe-panel p {
    font-size: 18px;
    line-height: 1.45;
    margin: 0 0 12px;
}

.unsubscribe-panel form {
    display: grid;
    gap: 8px;
    grid-template-columns: minmax(0, 1fr) auto;
}

.unsubscribe-panel input[type='email'],
.unsubscribe-panel button {
    border-radius: 8px;
    font: 17px/1.4 'Open Sans', sans-serif;
    margin: 0;
    min-height: 46px;
    padding: 10px 12px;
}

.unsubscribe-panel input[type='email'] {
    background: #fffdf9;
    border: 1px solid #96866d;
    color: #3b3028;
    min-width: 0;
}

.unsubscribe-panel button {
    background: #823631;
    border: 0;
    color: #fff8ed;
    cursor: pointer;
    font-weight: 700;
}

.unsubscribe-panel button:hover {
    background: #692923;
}

.unsubscribe-panel :focus-visible {
    outline: 2px solid #642620;
    outline-offset: 2px;
}

@media (max-width: 480px) {
    .unsubscribe-panel {
        border-radius: 16px;
        padding: 16px;
    }
    .unsubscribe-panel form {
        grid-template-columns: 1fr;
    }
    .unsubscribe-panel button {
        justify-self: start;
    }
}
</style>

<router>
  {
    path: '/remove.htm',
    caseSensitive: true,
  }
</router>

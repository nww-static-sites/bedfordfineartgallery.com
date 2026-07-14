<template>
    <footer class="cx_site-footer">
        <div class="cx_site-footer__frame">
            <nav class="cx_site-footer__nav" aria-label="Footer navigation">
                <ul>
                    <li><nuxt-link to="/">home</nuxt-link></li>
                    <li><nuxt-link :to="{ name: 'artists-bios' }">gallery</nuxt-link></li>
                    <li><nuxt-link :to="{ name: 'artists' }">artists</nuxt-link></li>
                    <li><nuxt-link :to="{ name: 'gallery-value' }">about</nuxt-link></li>
                    <li><nuxt-link :to="{ name: 'highlights' }">art blog</nuxt-link></li>
                    <li><nuxt-link :to="{ name: 'faq' }">faqs</nuxt-link></li>
                    <li><nuxt-link :to="{ name: 'directions' }">visit</nuxt-link></li>
                </ul>
            </nav>

            <div class="cx_site-footer__content">
                <address class="cx_site-footer__address">
                    230 South Juliana St.<br />
                    Bedford PA 15522<br />
                    Phone:
                    <a class="cx_site-footer__phone" href="tel:+17244590612">724-459-0612</a>
                </address>

                <div class="cx_site-footer__legal">
                    <p class="cx_site-footer__disclaimer">
                        All content and photos are copyrighted property of Bedford Fine Art Gallery, 19th century art
                        dealer, Bedford PA and can not be reproduced or copied without consent.
                    </p>
                    <p class="cx_site-footer__legal-links">
                        <nuxt-link :to="{ name: 'remove' }">Unsubscribe from our mailing list</nuxt-link>
                        <nuxt-link :to="{ name: 'privacy' }">Privacy</nuxt-link>
                    </p>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.cx_site-footer {
    background: #61211d;
    color: #ccb38d;
    padding: 20px 0 28px;
    width: 100%;
}

.cx_site-footer__frame {
    margin: 0 auto;
    max-width: 1200px;
    width: 90%;
}

.cx_site-footer__nav {
    border: 0;
    margin: 0 auto 26px;
    padding: 0;
    text-align: center;
}

.cx_site-footer__nav ul {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0 18px;
    justify-content: center;
    list-style: none;
    margin: 0;
    padding: 0;
}

.cx_site-footer__nav li {
    display: inline-flex;
    margin: 0;
    padding: 0;
    width: auto;
}

.cx_site-footer__nav a {
    border: 0;
    color: #ccb38d;
    display: block;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1px;
    line-height: 1.2;
    padding: 10px;
    text-decoration: none;
    text-transform: uppercase;
}

.cx_site-footer__nav a:hover,
.cx_site-footer__nav a:focus-visible,
.cx_site-footer__nav a.nuxt-link-exact-active {
    background: rgba(255, 255, 255, 0.08);
}

.cx_site-footer__content {
    align-items: center;
    display: grid;
    gap: 36px 60px;
    grid-template-columns: 1fr 1fr;
}

.cx_site-footer__address {
    color: #ccb38d;
    font-size: 13px;
    font-style: normal;
    line-height: 1.5;
    margin: 0;
    text-align: left;
}

.cx_site-footer__phone {
    color: inherit;
    font: inherit;
    text-decoration: none;
}

.cx_site-footer__legal {
    justify-self: end;
    max-width: 520px;
    width: 100%;
}

.cx_site-footer__disclaimer {
    color: #ccb38d;
    font-size: 12px;
    line-height: 1.35;
    margin: 0 0 12px;
    padding: 0;
    text-align: left;
}

.cx_site-footer__legal-links {
    font-size: 13px;
    line-height: 1.4;
    margin: 0;
    padding: 0;
    text-align: right;
}

.cx_site-footer__legal-links a {
    color: #ccb38d;
}

.cx_site-footer__legal-links a + a {
    margin-left: 10px;
}

@media screen and (max-width: 720px) {
    .cx_site-footer {
        padding: 16px 0 78px;
    }

    .cx_site-footer__frame {
        width: calc(100% - 32px);
    }

    .cx_site-footer__nav {
        margin-bottom: 22px;
    }

    .cx_site-footer__nav ul {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .cx_site-footer__nav li {
        display: block;
        width: 100%;
    }

    .cx_site-footer__nav a {
        background: rgba(255, 255, 255, 0.045);
        border: 1px solid rgba(204, 179, 141, 0.2);
        padding: 11px 8px;
        width: 100%;
    }

    .cx_site-footer__content {
        gap: 22px;
        grid-template-columns: 1fr;
    }

    .cx_site-footer__address,
    .cx_site-footer__legal,
    .cx_site-footer__disclaimer,
    .cx_site-footer__legal-links {
        justify-self: start;
        max-width: none;
        text-align: left;
    }

    .cx_site-footer__legal-links a {
        display: inline-block;
        margin-bottom: 8px;
    }
}
</style>

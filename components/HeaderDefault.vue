<template>
    <div class="cx_site-header">
        <a
            class="cx_site-newsletter"
            href="https://www.bedfordfineartgallery.com/art_lovers_niche.htm"
            target="_blank"
            rel="noopener"
        >
            Read The Art Lovers' Niche, Our Newsletter
        </a>

        <div class="cx_site-header__frame">
            <header class="cx_site-header__masthead">
                <nuxt-link class="cx_site-header__logo-link" to="/" aria-label="Bedford Fine Art Gallery home">
                    <img
                        class="cx_site-header__logo"
                        src="/images/bedford-fine-art-gallery-logo.png"
                        width="123"
                        height="124"
                        alt="Bedford Fine Art Gallery"
                    />
                </nuxt-link>

                <p class="cx_site-header__tagline">The most honest art gallery in the world.</p>
            </header>

            <nav class="cx_site-header__nav" aria-label="Primary navigation">
                <button
                    class="cx_site-header__menu-button"
                    type="button"
                    :aria-expanded="mobileMenuOpen ? 'true' : 'false'"
                    aria-controls="cx-site-primary-links"
                    :aria-label="mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
                    :title="mobileMenuOpen ? 'Close menu' : 'Menu'"
                    @click="mobileMenuOpen = !mobileMenuOpen"
                >
                    <span class="cx_site-header__menu-icon" aria-hidden="true">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                    <span>{{ mobileMenuOpen ? 'Close' : 'Menu' }}</span>
                </button>

                <ul
                    id="cx-site-primary-links"
                    class="cx_site-header__links"
                    :class="{ 'is-open': mobileMenuOpen }"
                >
                    <li><nuxt-link to="/" @click.native="closeMobileMenu">home</nuxt-link></li>
                    <li>
                        <nuxt-link :to="{ name: 'artists-bios' }" @click.native="closeMobileMenu">gallery</nuxt-link>
                    </li>
                    <li><nuxt-link :to="{ name: 'artists' }" @click.native="closeMobileMenu">artists</nuxt-link></li>
                    <li>
                        <nuxt-link :to="{ name: 'gallery-value' }" @click.native="closeMobileMenu">about</nuxt-link>
                    </li>
                    <li>
                        <nuxt-link :to="{ name: 'highlights' }" @click.native="closeMobileMenu">art blog</nuxt-link>
                    </li>
                    <li><nuxt-link :to="{ name: 'faq' }" @click.native="closeMobileMenu">faqs</nuxt-link></li>
                    <li>
                        <nuxt-link :to="{ name: 'directions' }" @click.native="closeMobileMenu">visit</nuxt-link>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            mobileMenuOpen: false,
        }
    },
    watch: {
        $route() {
            this.closeMobileMenu()
        },
    },
    methods: {
        closeMobileMenu() {
            this.mobileMenuOpen = false
        },
    },
}
</script>

<style scoped>
.cx_site-header {
    background: #61211d;
    color: #ccb38d;
    padding: 12px 0 0;
    width: 100%;
}

.cx_site-header__frame {
    margin: 0 auto;
    max-width: 1200px;
    width: 90%;
}

.cx_site-header__masthead {
    align-items: center;
    display: flex;
    justify-content: center;
    min-height: 108px;
    text-align: center;
}

.cx_site-header__logo-link {
    display: block;
    flex: 0 0 auto;
    line-height: 0;
}

.cx_site-header__logo {
    display: block;
    height: auto;
    width: 100px;
}

.cx_site-header__tagline {
    color: #ccb38d;
    font-size: 19px;
    font-style: italic;
    line-height: 1.35;
    margin: 0 0 0 20px;
    padding: 0;
}

.cx_site-header__nav {
    border-top: 1px solid #ccb38d;
    margin: 5px auto 0;
    padding: 0;
    text-align: center;
}

.cx_site-header__links {
    align-items: center;
    display: flex;
    justify-content: center;
    list-style: none;
    margin: 0;
    padding: 0;
}

.cx_site-header__links li {
    display: block;
    margin: 0;
    padding: 0;
    width: auto;
}

.cx_site-header__links a {
    border: 0;
    color: #ccb38d;
    display: block;
    font-size: 14px;
    font-weight: 600;
    height: 44px;
    letter-spacing: 0.1em;
    line-height: 44px;
    padding: 0 1em;
    text-decoration: none;
    text-transform: uppercase;
    white-space: nowrap;
}

.cx_site-header__links a:hover,
.cx_site-header__links a:focus-visible,
.cx_site-header__links a.nuxt-link-exact-active {
    background: rgba(255, 255, 255, 0.08);
}

.cx_site-header__menu-button {
    display: none;
}

.cx_site-newsletter {
    background: #db2222;
    border-radius: 6px 6px 0 0;
    bottom: 1px;
    color: #fff;
    display: block;
    font-size: 12px;
    font-weight: 700;
    padding: 15px 10px;
    position: fixed;
    right: 10px;
    text-align: center;
    text-decoration: none;
    width: 300px;
    z-index: 9999;
}

@media screen and (max-width: 720px) {
    .cx_site-header {
        padding-top: 8px;
    }

    .cx_site-header__frame {
        width: calc(100% - 32px);
    }

    .cx_site-header__masthead {
        min-height: 90px;
    }

    .cx_site-header__logo {
        width: 76px;
    }

    .cx_site-header__tagline {
        font-size: 15px;
        margin-left: 14px;
        max-width: 230px;
        text-align: left;
    }

    .cx_site-header__nav {
        padding: 0;
    }

    .cx_site-header__menu-button {
        align-items: center;
        background: transparent;
        border: 0;
        color: #ccb38d;
        cursor: pointer;
        display: flex;
        font: inherit;
        font-size: 14px;
        font-weight: 700;
        gap: 9px;
        justify-content: center;
        letter-spacing: 0.08em;
        min-height: 44px;
        padding: 0 14px;
        text-transform: uppercase;
        width: 100%;
    }

    .cx_site-header__menu-icon {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 18px;
    }

    .cx_site-header__menu-icon span {
        background: currentColor;
        display: block;
        height: 2px;
        width: 18px;
    }

    .cx_site-header__links {
        display: none;
        padding-bottom: 8px;
    }

    .cx_site-header__links.is-open {
        display: block;
    }

    .cx_site-header__links li {
        width: 100%;
    }

    .cx_site-header__links a {
        background: rgba(255, 255, 255, 0.035);
        border-top: 1px solid rgba(204, 179, 141, 0.22);
        height: auto;
        line-height: 1.2;
        padding: 13px 16px;
        width: 100%;
    }

    .cx_site-newsletter {
        left: 12px;
        right: 12px;
        width: auto;
    }
}
</style>

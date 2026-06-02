// Reverse-proxies lehyani.com/dmv* to the ca-dmv-practice-test Cloudflare Pages
// project (which serves the app under /dmv/). Only the /dmv path is routed here;
// everything else on lehyani.com is left to the existing site.

const ORIGIN = 'https://ca-dmv-practice-test.pages.dev'

export default {
  async fetch(request) {
    const url = new URL(request.url)
    // Normalize the bare "/dmv" to "/dmv/" so the app's index loads.
    const path = url.pathname === '/dmv' ? '/dmv/' : url.pathname
    const target = ORIGIN + path + url.search
    // Preserve method/headers/body; static GETs are the common case.
    return fetch(new Request(target, request))
  },
}

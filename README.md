# AEM as a Cloud Service CDN error page on GitHub Pages

This is an example of a branded CDN error page for AEM as a Cloud Service, hosted on GitHub Pages instead of the Azure Blob Storage used in the [Adobe tutorial](https://experienceleague.adobe.com/en/docs/experience-manager-learn/cloud-service/content-delivery/custom-error-pages#cdn-error-pages). It uses a placeholder brand, "My Company", that you replace with your own.

The Adobe-managed CDN shows this page only when it cannot reach the AEM origin. The CDN builds a minimal HTML shell from `cdn.yaml` and loads three files that you host yourself:

```html
<title>{title}</title>
<link rel="icon" href="{icoUrl}">
<link rel="stylesheet" href="{cssUrl}">
...
<div id="root" status="503"></div>
<script src="{jsUrl}"></script>
```

`error.js` reads `status` from `#root` and renders the page.

## Layout

```
site/                    # published to GitHub Pages
  error.js               # jsUrl: renders the page (vanilla JS, no build step)
  error.css              # cssUrl
  favicon.ico            # icoUrl
  index.html             # preview: ?code=403|404|406|500|503&lang=en|de|es
  simulate-503.html      # exact copy of the CDN shell, with status="503"
config/cdn.yaml          # CDN rule to copy into the AEM project's config folder
scripts/validate.mjs     # Playwright checks at 3 viewports
.github/workflows/pages.yml
```

## Behavior

- It handles the codes the CDN supports: 403, 404, 406, 500 and 503. Any other 4xx falls back to 404 and any other 5xx to 503.
- On 5xx errors, "Try again" is the primary action. The page also retries by itself every 30 seconds, up to 5 times per path per browser session, and the user can cancel it. On 4xx errors, "Go to home page" is the primary action.
- The copy is in English, German and Spanish. The language comes from `?lang=` first, then the first path segment (`/de/...`), then the browser language. Have a native speaker review the German and Spanish text before production.
- A reference block shows the status, the UTC time and the URL, so users can quote them to support.
- The page loads nothing from the AEM origin, because that origin is down whenever this page appears. The logo is inline SVG and the font is the system sans serif, so the page needs only `error.js` and `error.css`.
- All dynamic text is inserted with `textContent`. The URL is the only user-controlled input and is never inserted as HTML.

## Rebrand

- **Name:** set `BRAND` at the top of `site/error.js`, and set `title` in `config/cdn.yaml`.
- **Logo:** replace the `LOGO` SVG string in `site/error.js`, and replace `site/favicon.ico`.
- **Colours and font:** edit the custom properties in `:root` at the top of `site/error.css`. To use a brand font, add `@font-face` rules that point to WOFF2 files under `site/`, and put the family first in `--mc-font`. Check that the font licence allows public hosting.
- **Copy:** edit `COPY` in `site/error.js`.

## Run locally

```bash
npm install
npx playwright install chromium
npm run serve          # http://localhost:8765/?code=503
npm run validate       # 3 viewports x 6 variants: console, network, overflow, alt text
```

## Publish to GitHub Pages

1. Push this repository to GitHub.
2. Under **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow publishes `site/` to `https://<github-user>.github.io/<repo>/`.
4. Open `https://<github-user>.github.io/<repo>/?code=503` to check the result.

You can also skip the workflow: rename `site/` to `docs/` and set Pages to **Deploy from a branch** with `main` and `/docs`.

## Configure AEM

1. Copy `config/cdn.yaml` into the `config/` folder of the AEM project, or merge the `errorPages` block into an existing `cdn.yaml`. Replace the placeholder URLs with your GitHub Pages URLs.
2. Deploy it with a Cloud Manager **config pipeline**.
3. Test it:

   ```bash
   curl -i "https://publish-pXXXXX-eXXXXXX.adobeaemcloud.com/cdnstatus?code=503"
   ```

   Open the same URL in a browser and confirm that `error.css`, `error.js` and `favicon.ico` load from `github.io`.

## Notes for a production setup

- The error page is useful only if its host stays up while the AEM origin is down. The [GitHub Online Services SLA](https://github.com/customer-terms/github-online-services-sla) covers Pages only as a feature of GitHub Enterprise Cloud: 99.9% uptime per quarter (about 2 hours of allowed downtime), with service credits as the only remedy. Pages on Free, Pro or Team plans has no SLA. For production, host the files in an Enterprise Cloud organization, or use storage you control, such as S3, Azure Blob Storage or another CDN.
- Any push to `main` changes what users see during an outage. Protect the branch and require reviews.
- The CDN must be able to fetch the files publicly, so do not put internal details in them.
- GitHub Pages serves files with `Cache-Control: max-age=600`. After a change, the update can take about 10 minutes to reach users.

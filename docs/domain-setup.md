# Connect tomasferrer.com to GitHub Pages

The domain is registered with Namecheap, but its nameservers currently point to WordPress.com. DNS records must therefore be edited at WordPress.com unless the nameservers are intentionally migrated. Keep existing mail and verification records.

First configure the repository under Settings → Pages with GitHub Actions and the custom domain `tomasferrer.com`.

Then configure these records with the active DNS provider:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | tferrerd.github.io |

Replace conflicting web-hosting records for these exact hostnames. Do not use wildcard records. A custom domain is configured in the Pages settings; the Actions publishing workflow does not require a CNAME file.

Enable Enforce HTTPS in GitHub Pages when the certificate becomes available. Domain verification through GitHub Settings → Pages is recommended; GitHub supplies the account-specific TXT value.

Official reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

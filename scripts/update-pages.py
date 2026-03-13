#!/usr/bin/env python3
"""
Update all generated HTML pages with new header, footer, AdSense meta tag and cookie banner.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NEW_HEADER = '''  <header>
    <div class="container nav">
      <a class="brand" href="/index.html">
        <span class="brand-icon">&#9889;</span>
        AI Tool Vault
      </a>
      <button class="menu-toggle" id="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">&#9776;</button>
      <nav class="menu" id="main-menu" aria-label="Main navigation">
        <a href="/index.html">Home</a>
        <a href="/categories/index.html">Categories</a>
        <a href="/about.html">About</a>
        <a href="/contact.html" class="btn-nav">Contact</a>
      </nav>
    </div>
  </header>'''

NEW_FOOTER = '''  <footer>
    <div class="container footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/index.html"><span class="brand-icon">&#9889;</span> AI Tool Vault</a>
          <p>Your ultimate directory for discovering the best AI tools. Curated, organized, and always up to date.</p>
        </div>
        <div>
          <h3 class="footer-title">Categories</h3>
          <div class="footer-links">
            <a href="/categories/ai-writing.html">Writing</a>
            <a href="/categories/image-generation.html">Image Generation</a>
            <a href="/categories/video-creation.html">Video</a>
            <a href="/categories/coding.html">Coding</a>
            <a href="/categories/index.html">All Categories</a>
          </div>
        </div>
        <div>
          <h3 class="footer-title">Top Tools</h3>
          <div class="footer-links">
            <a href="/tools/chatgpt.html">ChatGPT</a>
            <a href="/tools/claude.html">Claude</a>
            <a href="/tools/midjourney.html">Midjourney</a>
            <a href="/tools/github-copilot.html">GitHub Copilot</a>
            <a href="/best/best-ai-tools-for-productivity.html">Best Of</a>
          </div>
        </div>
        <div>
          <h3 class="footer-title">Company</h3>
          <div class="footer-links">
            <a href="/about.html">About Us</a>
            <a href="/contact.html">Contact</a>
            <a href="/privacy-policy.html">Privacy Policy</a>
            <a href="/terms-of-use.html">Terms of Use</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">&copy; 2026 AI Tool Vault. All rights reserved.</span>
        <div class="footer-legal">
          <a href="/privacy-policy.html">Privacy Policy</a>
          <a href="/terms-of-use.html">Terms of Use</a>
          <a href="/contact.html">Contact</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- Cookie Consent Banner -->
  <div id="cookie-banner" role="dialog" aria-label="Cookie consent">
    <p>We use cookies and similar technologies to improve your experience, analyze traffic, and serve personalized ads. By clicking "Accept", you consent to our use of cookies as described in our <a href="/privacy-policy.html">Privacy Policy</a>.</p>
    <div class="cookie-actions">
      <button id="cookie-decline" class="btn btn-secondary btn-sm">Decline</button>
      <button id="cookie-accept" class="btn btn-sm">Accept All</button>
    </div>
  </div>

  <script src="/public/js/main.js" defer></script>'''

ADSENSE_META = '  <meta name="google-adsense-account" content="ca-pub-4613426749830025">'

# Folders to update
FOLDERS = ['pages']

def update_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # 1. Add AdSense meta tag if not present
    if 'google-adsense-account' not in content:
        content = content.replace(
            '</head>',
            f'{ADSENSE_META}\n</head>',
            1
        )

    # 2. Remove Tailwind CDN
    content = re.sub(r'\s*<script src="https://cdn\.tailwindcss\.com"[^>]*></script>', '', content)

    # 3. Replace old header patterns
    # Pattern: <header>...(any content)...</header>
    header_pattern = re.compile(r'<header>.*?</header>', re.DOTALL)
    if header_pattern.search(content):
        content = header_pattern.sub(NEW_HEADER, content, count=1)

    # 4. Replace old footer patterns and add cookie banner + main.js
    footer_pattern = re.compile(r'<footer>.*?</footer>', re.DOTALL)
    
    # Check if cookie banner already exists
    has_cookie = 'cookie-banner' in content
    has_main_js = '/public/js/main.js' in content
    
    if footer_pattern.search(content):
        # Remove old footer
        content = footer_pattern.sub('', content, count=1)
        
        # Remove old cookie banner if exists
        if has_cookie:
            cookie_pattern = re.compile(r'<!-- Cookie.*?</script>', re.DOTALL)
            content = cookie_pattern.sub('', content)
            # Also remove standalone cookie div
            cookie_div = re.compile(r'<div id="cookie-banner".*?</div>\s*', re.DOTALL)
            content = cookie_div.sub('', content)
        
        # Remove old main.js script tag
        if has_main_js:
            content = re.sub(r'\s*<script src="/public/js/main\.js"[^>]*></script>', '', content)
        
        # Insert new footer before </body>
        content = content.replace('</body>', f'\n{NEW_FOOTER}\n</body>', 1)

    # 5. Fix canonical URL from example.com to netlify.app
    content = content.replace('aitoolvault.example.com', 'aitoolvault.netlify.app')

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

updated = 0
skipped = 0
errors = 0

for folder in FOLDERS:
    folder_path = os.path.join(ROOT, folder)
    for dirpath, dirnames, filenames in os.walk(folder_path):
        for filename in filenames:
            if filename.endswith('.html'):
                filepath = os.path.join(dirpath, filename)
                try:
                    if update_html_file(filepath):
                        updated += 1
                    else:
                        skipped += 1
                except Exception as e:
                    errors += 1
                    print(f'ERROR: {filepath}: {e}')

print(f'Done! Updated: {updated}, Skipped: {skipped}, Errors: {errors}')

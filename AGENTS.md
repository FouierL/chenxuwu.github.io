# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single **Jekyll static site** — an academic personal homepage (the AcadHomepage template). The site content/config lives in `_pages/`, `_data/`, `_config.yml`, `_layouts/`, `_includes/`, `_sass/`, and `assets/`. There is one optional auxiliary tool in `google_scholar_crawler/` (a Python citation crawler that normally only runs in GitHub Actions; it is not needed for local dev).

### Ruby version (critical, non-obvious)
- The site MUST run on **Ruby 2.7.x** (installed at `/usr/local/bin/ruby`, currently 2.7.8), NOT the system apt Ruby 3.2.
- Reason: `Gemfile.lock` pins `nokogiri 1.13.3` (requires Ruby `< 3.2`) and the toolchain predates Ruby 3.0. On Ruby 3.x, `jekyll serve` fails two ways: `webrick` was removed from Ruby's default gems (not in the lockfile), and `pathutil 0.16.2` crashes on the watcher (`no implicit conversion of Hash into Integer`). Ruby 2.7 bundles `webrick` and works.
- `/usr/local/bin` precedes `/usr/bin` in `PATH`, so `ruby`/`gem`/`bundle` already resolve to the 2.7.8 build with no version manager or shell-profile changes. If a shell seems to see the wrong Ruby, run `hash -r`.

### Install / dependencies
- Gems install into project-local `vendor/bundle` (configured via `.bundle/config`, `path = vendor/bundle`), so no `sudo` is needed for `bundle install`. `vendor/` and `.bundle/` are gitignored.
- The startup update script runs `bundle config set --local path vendor/bundle` then `bundle install`, so dependencies refresh automatically. You normally don't need to run these by hand.

### Run the dev server
- Documented flow: `bash run_server.sh` → `bundle exec jekyll liveserve` (serves at `http://127.0.0.1:4000`, LiveReload on port 35729, auto-regenerates on file edits).
- To bind for external access use `bundle exec jekyll liveserve --host 0.0.0.0 --port 4000`.
- `pathutil` prints a harmless `Using the last argument as keyword parameters is deprecated` warning on Ruby 2.7 — ignore it.

### Build
- `bundle exec jekyll build` outputs the static site to `_site/` (gitignored). The `GitHub Metadata: No GitHub API authentication` warning during build is expected locally and harmless.

### Lint / test
- There is **no** lint or test suite in this repo (no RuboCop/RSpec/ESLint, no CI test job). The only GitHub Action is the optional Scholar crawler. Building the site cleanly is the effective correctness check.

### Optional: Google Scholar crawler
- `cd google_scholar_crawler && pip3 install -r requirements.txt && GOOGLE_SCHOLAR_ID=<id> python3 main.py`. Not required for local site development.

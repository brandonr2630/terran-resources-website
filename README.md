# Terran Resources Website

Marketing website for the Terran Resources industrial group.

**Live:** https://www.terranresources.com (deploy not yet wired)

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Homepage scaffold |

## Deploy

No automated workflow yet. When ready, follow the same cPanel Fileman API pattern used by `q2m-website` and `q2-machines-job-cards`. Required GitHub Secrets: `CPANEL_API_TOKEN`, `CPANEL_HOST`, `CPANEL_USER`.

## AI Feature Ideas

Reference implementations from [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) that map to plausible next features once the site is built out:

| Idea | Reference example |
|------|--------------------|
| FAQ / contact chatbot for the group's companies and services | [`advanced_llm_apps/thinkpath_chatbot_app`](https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/advanced_llm_apps/thinkpath_chatbot_app) |
| Natural-language search across group company/service info | [`rag_tutorials/ai_blog_search`](https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/rag_tutorials/ai_blog_search) |

These are starting points, not dependencies — evaluate before wiring into the site.

## Repository

https://github.com/brandonr2630/terran-resources-website

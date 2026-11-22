# makefun-humans03

[![make.fun · bring-the-humans-03](https://make.fun/badge/bring-the-humans-03.svg)](https://make.fun/bounty/bring-the-humans-03?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03)
[![rank](https://make.fun/badge/bring-the-humans-03/witty-owl-29/makefun-humans03/rank.svg)](https://make.fun/bounty/bring-the-humans-03/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03)
[![reward](https://make.fun/badge/bring-the-humans-03/witty-owl-29/makefun-humans03/reward.svg)](https://make.fun/bounty/bring-the-humans-03?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03)

An original vertical TikTok ad for [make.fun](https://make.fun/bounty/bring-the-humans-03), made by my AI agent for the $500 "Bring the humans with a TikTok ad" bounty. The ad is posted publicly on TikTok from [@yughi.spr](https://www.tiktok.com/@yughi.spr); places go by the video's real views, and the top 20 share $500.

## The ad

A 25-second vertical video (1080x1920), made new in this session:

1. **Hook (0–5 s):** "AI AGENTS ARE WINNING REAL MONEY" over make.fun's ghost crew lifting a trophy.
2. **What make.fun is (5–11.5 s):** "make.fun is where AI AGENTS COMPETE for real money" — a site where AI agents compete in bounties for real money and people enter them with their agents.
3. **Call to action (11.5–17.5 s):** "ENTER YOUR AI AGENT in a $500 bounty on make.fun".
4. **End card (17.5–25 s):** make.fun's referral end card with our referral code `5kjt1fsb` typed into its field.

make.fun's brand badge (mascot mark + wordmark) from the press pack sits on screen from the very first frame until the end card, and every make.fun mark, wordmark and colour in the video comes from the press pack, used as it is. The video was rendered with ffmpeg in this session from stills laid out here (press-pack ghost illustrations on make.fun magenta, big on-screen text, a synthesized music bed); nothing in it is a copy or a re-upload of anyone else's video.

## The caption (what was posted with the video)

```
Made by my AI agent for a $500 bounty on make.fun, where AI agents compete for real money: make.fun/bounty/bring-the-humans-03
makefun-thicket-bronze-saffron
```

## Run it

`main.ts` (Node 22) copies `VIDEO.json` from this repository to `/output/VIDEO.json` — that is all it has to do. The video itself is the entry; the house reads its views from TikTok.

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

`VIDEO.json` holds the video's full TikTok address (`https://www.tiktok.com/@yughi.spr/video/<id>`). The placeholder video id `0` is replaced with the posted video's real id before submitting.

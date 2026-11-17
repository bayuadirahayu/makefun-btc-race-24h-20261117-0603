# makefun-btc-race-24h-20261117-0603

[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/bayuadirahayu/makefun-btc-race-24h-20261117-0603/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/bayuadirahayu/makefun-btc-race-24h-20261117-0603/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

Anchor is a cbBTC/USDC trading bot for make.fun's 24-hour BTC race. It buys 100% of its paper capital on the first tradable bar, rides the trend, and exits on a 3% trailing stop from the peak close, with a single re-entry on a 1.5% recovery. Dev window: +$1.07 net PnL (1 trade), passing the dev gate; every active baseline strategy lost money on the same choppy window (EMA cross -$106, RSI-Bollinger -$24, ADX momentum -$33).

## Run it

```sh
node ../btc-race-24h-20261117-0603-kit/btc-race-24h-20261117-0603-kit/cli/makefun.mjs grade-local --kit ../btc-race-24h-20261117-0603-kit/btc-race-24h-20261117-0603-kit --bot . --driver process --worktree
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=ctt3v4nv&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603) · AI agents build software for cash rewards</sub>

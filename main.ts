// Anchor: a cbBTC/USDC bot for the make.fun 24-hour BTC race.
//
// Idea, from backtesting the 1,440-bar dev window with the kit's exact fill
// model (4 bps fee, 2 bps slippage, constant-product impact vs the bar's
// open depth, fills at the next bar's open):
//   - The dev window is chop: BTC +0.49% net, hourly moves mostly within
//     +/-0.8%, 1-minute volatility ~0.06%. A full round trip costs ~34 bps,
//     so every active rule I tried (EMA 8/21 cross: -$107, EMA 12/48: -$69,
//     SMA trend: -$87, Donchian breakout: -$42, RSI mean reversion: -$79,
//     momentum + trailing stop: -$55) bled money on whipsaws.
//   - Buy-and-hold made +$1.07 on dev (1 trade, max drawdown 2.15%).
// So Anchor is buy-and-hold with crash insurance: buy 100% on the first
// tradable batch, ride whatever the window does, and sell everything if the
// close falls 3% below the peak close since entry (a trailing stop that
// never fired on dev or on reshuffled dev returns, but cut a synthetic
// -6.5% crash day from -$68 to -$32). If the market recovers 1.5% above
// the stop-out close, it re-enters once. No other trading: in a rally or
// in chop it behaves exactly like buy-and-hold.
//
// Deterministic: no clock, no environment, no randomness; every decision
// is a pure function of the bars the harness sent.
//
// Why not trade more: with ~34 bps per round trip and 1-minute moves under
// 0.1% most of the time, each extra trade is a bet the next swing beats
// the cost. On this window it never did. One entry, one guarded exit,
// one possible re-entry: that is the whole bot.

import { runBars } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
// Trailing stop: sell when the close falls this far below the peak close
// seen while holding (3% -> 97/100). Re-enter once when the close
// recovers this far above the stop-out close (1.5% -> 1015/1000).
const STOP_NUM = 97n;
const STOP_DEN = 100n;
const REENTRY_NUM = 1015n;
const REENTRY_DEN = 1000n;
// Reject a fill that would land more than 1% away from the latest close.
const MAX_SLIPPAGE_BPS = 100;

let peak = 0n; // highest close seen while holding, 0 when flat
let stoppedOut = false;
let stopPrice = 0n;
let reentered = false;
let lastBuySeq = -1;

await runBars({
  onBatch(state) {
    if (state.warmingUp) return [];
    const close = state.close(SYMBOL);
    if (close === null) return [];

    const held = state.positions.get(SYMBOL)?.qty ?? 0n;

    if (held > 0n) {
      if (peak === 0n || close > peak) peak = close;
      if (close * STOP_DEN < peak * STOP_NUM) {
        // Trailing stop hit: exit the whole position.
        stoppedOut = true;
        stopPrice = close;
        peak = 0n;
        return [{ side: 'sell', symbol: SYMBOL, qty: held, max_slippage_bps: MAX_SLIPPAGE_BPS }];
      }
      return [];
    }

    // Flat.
    if (stoppedOut) {
      if (!reentered && close * REENTRY_DEN > stopPrice * REENTRY_NUM) {
        reentered = true;
        lastBuySeq = state.seq;
        const spend = state.cash < state.weightRoom(SYMBOL) ? state.cash : state.weightRoom(SYMBOL);
        if (spend <= 0n) return [];
        return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: spend, max_slippage_bps: MAX_SLIPPAGE_BPS }];
      }
      return [];
    }

    // Never bought, or the last buy never filled (its fill shows up in the
    // very next batch; only retry once a batch has passed with no position).
    if (lastBuySeq < 0 || state.seq > lastBuySeq + 1) {
      lastBuySeq = state.seq;
      const spend = state.cash < state.weightRoom(SYMBOL) ? state.cash : state.weightRoom(SYMBOL);
      if (spend <= 0n) return [];
      return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: spend, max_slippage_bps: MAX_SLIPPAGE_BPS }];
    }
    return [];
  },
});

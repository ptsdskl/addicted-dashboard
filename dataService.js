/*
 * Data service for the Addicted dashboard.
 *
 * This module provides asynchronous functions to fetch on‑chain data
 * relevant to the Addicted game. It uses the Solana JSON‑RPC API to
 * query token supplies and transactions, and the Jupiter price API to
 * retrieve real‑time $WEED prices.  Several functions are stubs that
 * will require an API key or custom implementation depending on
 * available services (e.g., Helius, QuickNode).  When deploying
 * server‑side (e.g., via Vercel), these functions can be exposed via
 * API routes.
 */

const RPC_ENDPOINT = process.env.SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
const WEED_MINT_ADDRESS = 'E2gLkTXSbbTMmJM19xkquawun2ShJSi7G59A8c2PtbFa';

/**
 * Fetch the current $WEED price from Jupiter aggregator.
 *
 * Jupiter’s public price API can return a price quote for a given token.
 * In production you may wish to cache the result or limit calls to avoid
 * hitting rate limits.  Requires no authentication.
 *
 * @returns {Promise<number|null>} Current price in USD or null if unavailable.
 */
async function getWeedPrice() {
  try {
    const res = await fetch(
      `https://lite-api.jup.ag/price/v3?ids=${WEED_MINT_ADDRESS}` // https://jup.ag/tokens/E2gLkTXSbbTMmJM19xkquawun2ShJSi7G59A8c2PtbFa
    );
    const data = await res.json();
    const priceInfo = data?.data?.[WEED_MINT_ADDRESS]; 
    return priceInfo?.price || null;
  } catch (err) {
    console.error('Failed to fetch WEED price:', err);
    return null;
  }
}

/**
 * Fetch the total and circulating supply for the $WEED token.
 *
 * The Solana JSON‑RPC method `getTokenSupply` returns the raw supply.
 * The total supply is fixed at 240M tokens (official tokenomics【971628485730126†L84-L88】).
 *
 * NOTE: Some Solana RPC providers block POST requests at the default
 * endpoint.  In those cases you must specify a custom RPC (e.g., from
 * QuickNode or Helius) via the SOLANA_RPC_ENDPOINT environment
 * variable.
 *
 * @returns {Promise<{total: number, supply: number}|null>}
 */
async function getTokenSupply() {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getTokenSupply',
    params: [WEED_MINT_ADDRESS],
  };
  try {
    const res = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const supply = parseFloat(data.result.value.uiAmountString);
    return { total: 240000000, supply };
  } catch (err) {
    console.error('Failed to fetch token supply:', err);
    return null;
  }
}

/**
 * Retrieve mint and burn events for the $WEED token.
 *
 * This is a stub implementation.  To compute mint and burn volumes,
 * you can query your RPC provider for transaction signatures involving
 * the token’s mint address, then inspect each transaction’s
 * instructions to tally amounts.  Providers such as Helius or
 * QuickNode simplify this by offering dedicated endpoints for token
 * activity (e.g., `/v0/token/transactions` with filters for mints and
 * burns).
 *
 * @param {number} limit Number of recent events to fetch
 * @returns {Promise<{timestamps: number[], mints: number[], burns: number[]}|null>}
 */
async function getMintBurnEvents(limit = 100) {
  // TODO: Implement this function using a Solana RPC provider or third‑party
  // API.  The returned object should contain parallel arrays of
  // timestamps (in milliseconds since epoch), minted amounts and burned
  // amounts.  These arrays can then be plotted as a time series.
  return null;
}

/**
 * Fetch pack opening events from the openSeedPack program and derive
 * distribution of seeds by strain.  This function is left as a
 * placeholder; it requires knowledge of the program’s instruction
 * layout and may depend on Switchboard randomness or onchain
 * metadata.  You will need to parse transaction logs to extract
 * metadata such as `seed number` and map it back to strain names.
 *
 * @param {string} programId Program ID of the openSeedPack contract
 * @returns {Promise<{counts: Record<string, number>, total: number}|null>}
 */
async function getPackDistribution(programId) {
  // TODO: Implement using getSignaturesForAddress + getTransaction
  // along with parsing of log messages to determine which seed was
  // minted in each pack.  Without an API key this may be slow.
  return null;
}

module.exports = {
  getWeedPrice,
  getTokenSupply,
  getMintBurnEvents,
  getPackDistribution,
};
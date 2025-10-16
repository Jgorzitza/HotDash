/**
 * Redirect Checker
 * Detect redirect chains and loops
 * @module lib/seo/redirect-checker
 */

export interface RedirectChain {
  startUrl: string;
  chain: string[];
  statusCodes: number[];
  isLoop: boolean;
  chainLength: number;
}

export function analyzeRedirects(url: string, redirects: Array<{ from: string; to: string; status: number }>): RedirectChain {
  const chain: string[] = [url];
  const statusCodes: number[] = [];
  let current = url;

  while (true) {
    const redirect = redirects.find(r => r.from === current);
    if (!redirect) break;

    chain.push(redirect.to);
    statusCodes.push(redirect.status);

    if (chain.indexOf(redirect.to) < chain.length - 1) {
      return { startUrl: url, chain, statusCodes, isLoop: true, chainLength: chain.length };
    }

    current = redirect.to;
    if (chain.length > 10) break;
  }

  return { startUrl: url, chain, statusCodes, isLoop: false, chainLength: chain.length };
}

export function findRedirectChains(redirects: Array<{ from: string; to: string; status: number }>): RedirectChain[] {
  const chains: RedirectChain[] = [];
  const processed = new Set<string>();

  redirects.forEach(r => {
    if (!processed.has(r.from)) {
      const chain = analyzeRedirects(r.from, redirects);
      if (chain.chainLength > 2 || chain.isLoop) {
        chains.push(chain);
        chain.chain.forEach(url => processed.add(url));
      }
    }
  });

  return chains;
}

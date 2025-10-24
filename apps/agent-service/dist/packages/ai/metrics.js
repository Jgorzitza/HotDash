export function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);
}
export function bleu1(referenceTokens, candidateTokens) {
    if (!referenceTokens.length || !candidateTokens.length) {
        return 0;
    }
    const referenceCounts = new Map();
    for (const token of referenceTokens) {
        referenceCounts.set(token, (referenceCounts.get(token) ?? 0) + 1);
    }
    let matchCount = 0;
    const candidateCounts = new Map();
    for (const token of candidateTokens) {
        candidateCounts.set(token, (candidateCounts.get(token) ?? 0) + 1);
    }
    for (const [token, count] of candidateCounts.entries()) {
        const refCount = referenceCounts.get(token) ?? 0;
        matchCount += Math.min(count, refCount);
    }
    return matchCount / candidateTokens.length;
}
function longestCommonSubsequenceLength(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i += 1) {
        for (let j = 1; j <= b.length; j += 1) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            }
            else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[a.length][b.length];
}
export function rougeL(referenceTokens, candidateTokens) {
    if (!referenceTokens.length || !candidateTokens.length) {
        return 0;
    }
    const lcs = longestCommonSubsequenceLength(referenceTokens, candidateTokens);
    return lcs / referenceTokens.length;
}
export function evaluateText(reference, candidate) {
    const referenceTokens = tokenize(reference);
    const candidateTokens = tokenize(candidate);
    return {
        bleu1: bleu1(referenceTokens, candidateTokens),
        rougeL: rougeL(referenceTokens, candidateTokens),
        referenceTokens,
        candidateTokens,
    };
}
//# sourceMappingURL=metrics.js.map
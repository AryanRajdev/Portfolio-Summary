interface PortfolioItem {
    symbol: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
}

interface EnhancedPortfolioItem extends PortfolioItem {
    totalValue: number;
    plPercentage: number;
}

self.onmessage = (e: MessageEvent) => {
    const data: EnhancedPortfolioItem[] = e.data;

    const processed = data.slice(0, 1000); // limit to reduce main thread load
    self.postMessage(processed);
};

export {};
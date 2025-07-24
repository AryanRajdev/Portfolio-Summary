import { useState, useEffect, useMemo } from "react";
import { lazy, Suspense } from "react";
import "./PortfolioSummary.css";
import ChartWorker from "../workers/chartWorker?worker"; // Importing the worker

const PortfolioChart = lazy(() => import("./PortfolioChart"));
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

type SortField = keyof EnhancedPortfolioItem;
type SortDirection = "asc" | "desc";

const PortfolioSummary = () => {
    const [portfolioData, setPortfolioData] = useState<EnhancedPortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState(""); // For real-time typing
    const [searchTerm, setSearchTerm] = useState(""); // Debounce value
    const [sortField, setSortField] = useState<SortField>("symbol");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [chartData, setChartData] = useState<EnhancedPortfolioItem[]>([]);
    const [chartLoading, setChartLoading] = useState(false);


    // Pagination states
    const [page, setPage] = useState(1);
    const rowsPerPage = 50;


    // Debounce search input
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearchTerm(searchInput);
            setPage(1);
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchInput]);

    // Fetch and process data
    useEffect(() => {
        const fetchPortfolioData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    "https://raw.githubusercontent.com/aashishsingla567/gt-takehome/refs/heads/main/portfolios.json"
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch portfolio data");
                }

                const data: PortfolioItem[] = await response.json();

                const enhancedData: EnhancedPortfolioItem[] = data.map((item) => ({
                    ...item,
                    totalValue: item.quantity * item.currentPrice,
                    plPercentage: ((item.currentPrice - item.avgPrice) / item.avgPrice) * 100,
                }));

                setPortfolioData(enhancedData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolioData();
    }, []);

    // Filter and sort data

    const processData = useMemo(() => {
        const filtered = portfolioData.filter((item) =>
            item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });

        return filtered;
    }, [portfolioData, searchTerm, sortField, sortDirection]);

    // Using the worker to process chart data

    useEffect(() => {
        setChartLoading(true);
        const worker = new ChartWorker();

        worker.postMessage(processData);

        worker.onmessage = (event) => {
            setChartData(event.data);
            setChartLoading(false);
            worker.terminate(); // Clean up after done
        };

        return () => {
            worker.terminate(); // Clean up on unmount or rerun
        };
    }, [processData]);
    

    // Paginated data
    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return processData.slice(start, start + rowsPerPage);
    }, [processData, page]);

    const totalPages = Math.ceil(processData.length / rowsPerPage);

    // Handle sort
    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading portfolio...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error Loading Portfolio</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="portfolio-container">

            {/* Chart Section */}
            <div className='chart-section'>
                <h2>Portfolio Values</h2>
                {chartLoading ? (
                    <div className="chart-loader">Updating chart...</div>
                ) : (
                    <Suspense fallback={<div>Loading chart...</div>}>
                        <PortfolioChart data={chartData} />
                    </Suspense>
                )}
            </div>

            {/* Search Field */}
            <div className="search-section">
                <input
                    type="text"
                    placeholder="Search for Assets by Symbol"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="search-input"
                />

                <span className="result-count">
                    {processData.length} of {portfolioData.length}
                </span>
            </div>

            {/* Portfolio Table */}
            <div className="table-container">
                <table className="portfolio-table">
                    <thead>
                        <tr>
                            {[
                                { key: "symbol" as SortField, label: "Symbol" },
                                { key: "quantity" as SortField, label: "Quantity" },
                                { key: "avgPrice" as SortField, label: "Avg. price" },
                                { key: "currentPrice" as SortField, label: "CurrentPrice" },
                                { key: "totalValue" as SortField, label: "Total Value" },
                                { key: "plPercentage" as SortField, label: "(P/L)%" },
                            ].map(({ key, label }) => (
                                <th key={key}>
                                    <button
                                        onClick={() => handleSort(key)}
                                        className={`sort-button ${sortField === key ? "active" : ""} `}
                                    >
                                        {label}
                                        {sortField === key && (
                                            <span className="sort-indicator">
                                                {sortDirection === "asc" ? " ↑" : " ↓"}
                                            </span>
                                        )}
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item) => (
                            <tr key={item.symbol} className="table-row">
                                <td className="symbol-cell">{item.symbol}</td>
                                <td>{item.quantity.toLocaleString()}</td>
                                <td>{"$" + item.avgPrice.toFixed(2)}</td>
                                <td>{"$" + item.currentPrice.toFixed(2)}</td>
                                <td className="total-value">
                                    {"$" +
                                        item.totalValue.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                </td>
                                <td
                                    className={`pl-cell ${item.plPercentage >= 0 ? "positive" : "negative"
                                        }`}
                                >
                                    {item.plPercentage >= 0 ? "+" : ""}
                                    {item.plPercentage.toFixed(2)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination">
                <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                    Prev
                </button>
                <span>
                    Page {page} of {totalPages}
                </span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                    Next
                </button>
            </div>

            {processData.length === 0 && searchTerm && (
                <div className="no-results">
                    <p>No assets found matching "{searchTerm}"</p>
                    <button onClick={() => (
                        setSearchTerm(""),
                        setSearchInput("")
                    )}>Clear Search</button>
                </div>
            )}
        </div>
    );
};

export default PortfolioSummary;

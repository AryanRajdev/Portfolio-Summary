import React from 'react'
import { useState, useEffect, useMemo } from "react"
import "./PortfolioSummary.css";
import PortfolioChart from './PortfolioChart';


interface PortfolioItem {
    symbol: string
    quantity: number
    avgPrice: number
    currentPrice: number
}

interface EnhancedPortfolioItem extends PortfolioItem {
    totalValue: number
    plPercentage: number
}

type SortField = keyof EnhancedPortfolioItem
type SortDirection = "asc" | "desc"

const PortfolioSummary = () => {

    const [portfolioData, setPortfolioData] = useState<EnhancedPortfolioItem[]>([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("symbol")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    // Fetch and process data

    useEffect(() => {

        const fetchPortfolioData = async () => {
            try {
                setLoading(true);

                const response = await fetch("https://raw.githubusercontent.com/aashishsingla567/gt-takehome/refs/heads/main/portfolios.json")

                if (!response.ok) {
                    throw new Error("Failed to fetch portfolio data");
                }

                const data: PortfolioItem[] = await response.json();

                const enhancedData: EnhancedPortfolioItem[] = data.map((item) => (
                    {
                        ...item,
                        totalValue: (item.quantity * item.currentPrice),
                        plPercentage: ((item.currentPrice - item.avgPrice) / item.avgPrice) * 100
                    }

                ))

                setPortfolioData(enhancedData);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            }
            finally {
                setLoading(false);
            }
        }

        fetchPortfolioData();

    }, [])

    // Filter and sort data

    const processData = useMemo(() => {

        const filtered = portfolioData.filter((item) =>
        (item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        ))

        filtered.sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]

            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
            }

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortDirection === "asc" ? aValue - bValue : bValue - aValue
            }

            return 0;
        })

        return filtered

    }, [portfolioData, searchTerm, sortField, sortDirection])

    // Handle sort

    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    if (loading) {
        return (
            <div className='loading-container'>
                <div className='spinner'>
                    <p>Loading Portfolio...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error Loading Portfolio</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
        )
    }


    return (
        <div className='portfolio-container'>

            {/* Bar Chart */}

            <div className='chart-section'>
            <h2>Portfolio Values</h2>
            <PortfolioChart data={processData}/>
            </div>

            {/* Seach Field */}

            <div className='search-section'>
                <input
                    type="text"
                    placeholder='Search for Assets by Symbol'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='search-input'
                />

                <span className='result-count'>
                    {processData.length} of {portfolioData.length}
                </span>
            </div>

            {/* Portfolio Table */}

            <div className='table-container'>
                <table className='portfolio-table'>
                    <thead>
                        <tr>
                            {
                                [
                                    { key: "symbol" as SortField, label: "Symbol" },
                                    { key: "quantity" as SortField, label: "Quantity" },
                                    { key: "avgPrice" as SortField, label: "Avg. price" },
                                    { key: "currentPrice" as SortField, label: "CurrentPrice" },
                                    { key: "totalValue" as SortField, label: "Total Value" },
                                    { key: "plPercentage" as SortField, label: "(P/L)%" }
                                ].map(({ key, label }) => (
                                    <th key={key}>
                                        <button onClick={() => handleSort(key)} className={`sort-button ${sortField === key ? "active" : ""} `}>
                                            {label}
                                            {sortField === key && <span className='sort-indicator'>{sortDirection === "asc" ? " ↑" : " ↓"}</span>}
                                        </button>
                                    </th>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            processData.map((item) => (
                                <tr key={item.symbol} className='table-row'>
                                    <td className='symbol-cell'>{item.symbol}</td>
                                    <td>{item.quantity.toLocaleString()}</td>
                                    <td>{item.avgPrice.toFixed(2)}</td>
                                    <td>{item.currentPrice.toFixed(2)}</td>
                                    <td className='total-value'>
                                        {item.totalValue.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td className={`pl-cell ${item.plPercentage >= 0 ? "positive" : "negative"}`}>
                                        {item.plPercentage >= 0 ? "+" : ""}
                                        {item.plPercentage.toFixed(2)}%
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>

            {processData.length === 0 && searchTerm && (
                <div className="no-results">
                    <p>No assets found matching "{searchTerm}"</p>
                    <button onClick={() => setSearchTerm("")}>Clear Search</button>
                </div>
            )}


        </div>
    )

}

export default PortfolioSummary
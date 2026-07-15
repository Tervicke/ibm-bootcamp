/* FinSight AI Interactive Dashboard Controller */

// 1. Navigation Controller
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSimulatedTicker();
    initIndices();
    initStockComparison();
    initPortfolioRiskAnalyzer();
    initExamplePrompts();
});

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabViews = document.querySelectorAll('.tab-view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');
            
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            tabViews.forEach(view => {
                view.classList.remove('active');
                if (view.id === `${targetTab}-view`) {
                    view.classList.add('active');
                }
            });
        });
    });
}

// 2. Simulated Live Ticker & Market Telemetry
const TICKER_DATA = [
    { symbol: 'AAPL', price: 189.84, delta: 1.24, isUp: true },
    { symbol: 'MSFT', price: 421.90, delta: -3.12, isUp: false },
    { symbol: 'NVDA', price: 128.20, delta: 5.48, isUp: true },
    { symbol: 'TSLA', price: 187.35, delta: -4.10, isUp: false },
    { symbol: 'IBM', price: 174.12, delta: 0.85, isUp: true },
    { symbol: 'AMZN', price: 178.15, delta: 1.62, isUp: true },
    { symbol: 'GOOGL', price: 151.60, delta: -0.45, isUp: false },
    { symbol: 'META', price: 505.12, delta: 8.92, isUp: true },
    { symbol: 'SPY', price: 512.18, delta: 1.15, isUp: true },
    { symbol: 'QQQ', price: 438.60, delta: 2.45, isUp: true }
];

function initSimulatedTicker() {
    const tickerWrap = document.getElementById('ticker-wrap');
    if (!tickerWrap) return;

    // Create 2 duplicates to allow seamless loops
    const createItemList = () => {
        const list = document.createElement('div');
        list.className = 'ticker-item-list';
        
        TICKER_DATA.forEach(item => {
            const el = document.createElement('div');
            el.className = 'ticker-item';
            el.id = `ticker-${item.symbol}`;
            el.innerHTML = `
                <span class="ticker-symbol">${item.symbol}</span>
                <span class="ticker-price ${item.isUp ? 'price-up' : 'price-down'}">${item.price.toFixed(2)}</span>
                <span class="ticker-price ${item.isUp ? 'price-up' : 'price-down'}">${item.isUp ? '▲' : '▼'}${Math.abs(item.delta).toFixed(2)}%</span>
            `;
            list.appendChild(el);
        });
        return list;
    };

    tickerWrap.appendChild(createItemList());
    tickerWrap.appendChild(createItemList());

    // Update prices randomly to simulate live trade updates
    setInterval(() => {
        const randomIndex = Math.floor(Math.random() * TICKER_DATA.length);
        const item = TICKER_DATA[randomIndex];
        const percentChange = (Math.random() * 0.4 - 0.2); // -0.2% to +0.2%
        
        item.price += item.price * (percentChange / 100);
        item.delta += percentChange;
        item.isUp = percentChange >= 0;

        const domElements = document.querySelectorAll(`#ticker-${item.symbol}`);
        domElements.forEach(el => {
            const priceEl = el.querySelector('.ticker-price:nth-child(2)');
            const deltaEl = el.querySelector('.ticker-price:nth-child(3)');
            
            priceEl.className = `ticker-price ${item.isUp ? 'price-up' : 'price-down'}`;
            priceEl.textContent = item.price.toFixed(2);
            
            deltaEl.className = `ticker-price ${item.isUp ? 'price-up' : 'price-down'}`;
            deltaEl.textContent = `${item.isUp ? '▲' : '▼'}${Math.abs(item.delta).toFixed(2)}%`;
            
            // Pulse anim
            el.style.transform = 'scale(1.05)';
            el.style.transition = 'transform 0.1s';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 150);
        });
    }, 3000);
}

// 3. Market Indices Cards with Auto-Drawing Sparklines
const INDEX_METRICS = {
    SP500: { name: 'S&P 500', price: 5432.75, points: 34.20, pct: 0.63, isUp: true, history: [5390, 5405, 5402, 5418, 5410, 5422, 5432.75] },
    NASDAQ: { name: 'NASDAQ', price: 17855.90, points: 182.40, pct: 1.03, isUp: true, history: [17600, 17650, 17620, 17750, 17710, 17810, 17855.9] },
    DOWJONES: { name: 'Dow Jones', price: 39560.10, points: -112.30, pct: -0.28, isUp: false, history: [39750, 39700, 39680, 39710, 39600, 39620, 39560.1] },
    VIX: { name: 'VIX Volatility', price: 12.84, points: -0.42, pct: -3.17, isUp: false, history: [13.4, 13.2, 13.5, 13.1, 13.0, 12.9, 12.84] }
};

function generateSparklinePath(history, width, height) {
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min;
    
    return history.map((val, index) => {
        const x = (index / (history.length - 1)) * width;
        const y = height - ((val - min) / (range || 1)) * (height - 8) - 4; // leave margin padding
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
}

function initIndices() {
    Object.keys(INDEX_METRICS).forEach(key => {
        const idx = INDEX_METRICS[key];
        const card = document.getElementById(`idx-${key}`);
        if (!card) return;

        // Render card content
        card.innerHTML = `
            <div class="index-header">
                <span class="index-name">${idx.name}</span>
                <span class="index-badge ${idx.isUp ? 'badge-up' : 'badge-down'}">
                    ${idx.isUp ? '+' : ''}${idx.pct.toFixed(2)}%
                </span>
            </div>
            <div class="index-price-group">
                <span class="index-price">${idx.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                <span class="index-delta ${idx.isUp ? 'price-up' : 'price-down'}">
                    ${idx.isUp ? '▲' : '▼'}${Math.abs(idx.points).toFixed(2)}
                </span>
            </div>
            <svg class="index-sparkline ${idx.isUp ? 'up' : 'down'}" viewBox="0 0 200 45">
                <path d="${generateSparklinePath(idx.history, 200, 45)}"></path>
            </svg>
        `;

        // Simulate micro updates
        setInterval(() => {
            const step = (Math.random() - 0.49) * (idx.price * 0.0003); // slight noise
            idx.price += step;
            idx.points += step;
            idx.pct = (idx.points / (idx.price - idx.points)) * 100;
            idx.isUp = idx.points >= 0;
            
            // update history
            idx.history.shift();
            idx.history.push(idx.price);

            const badge = card.querySelector('.index-badge');
            const price = card.querySelector('.index-price');
            const delta = card.querySelector('.index-delta');
            const path = card.querySelector('.index-sparkline path');
            const svg = card.querySelector('.index-sparkline');

            badge.className = `index-badge ${idx.isUp ? 'badge-up' : 'badge-down'}`;
            badge.textContent = `${idx.isUp ? '+' : ''}${idx.pct.toFixed(2)}%`;
            
            price.textContent = idx.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            
            delta.className = `index-delta ${idx.isUp ? 'price-up' : 'price-down'}`;
            delta.textContent = `${idx.isUp ? '▲' : '▼'}${Math.abs(idx.points).toFixed(2)}`;

            svg.className = `index-sparkline ${idx.isUp ? 'up' : 'down'}`;
            path.setAttribute('d', generateSparklinePath(idx.history, 200, 45));
        }, 4000);
    });
}

// 4. Stock Comparison Engine
const STOCK_COMP_DATA = {
    AAPL: { name: 'Apple Inc.', sector: 'Technology', pe: 31.2, mcap: '3.38T', growth: '5.2%', profit: '26.3%', risk: 'Low', score: 85 },
    MSFT: { name: 'Microsoft Corp.', sector: 'Technology', pe: 34.5, mcap: '3.25T', growth: '12.4%', profit: '36.2%', risk: 'Low', score: 89 },
    NVDA: { name: 'NVIDIA Corp.', sector: 'Technology', pe: 68.2, mcap: '2.84T', growth: '115.6%', profit: '53.4%', risk: 'High', score: 78 },
    TSLA: { name: 'Tesla Inc.', sector: 'Automotive', pe: 55.4, mcap: '780.2B', growth: '-2.1%', profit: '14.2%', risk: 'High', score: 62 },
    IBM: { name: 'IBM Corp.', sector: 'Technology', pe: 21.8, mcap: '178.6B', growth: '3.5%', profit: '15.6%', risk: 'Low', score: 71 }
};

function initStockComparison() {
    const selectA = document.getElementById('compStockA');
    const selectB = document.getElementById('compStockB');
    if (!selectA || !selectB) return;

    const performComparison = () => {
        const stockA = STOCK_COMP_DATA[selectA.value];
        const stockB = STOCK_COMP_DATA[selectB.value];

        // Headers
        document.getElementById('compBadgeA').textContent = selectA.value;
        document.getElementById('compBadgeB').textContent = selectB.value;
        document.getElementById('compNameA').textContent = stockA.name;
        document.getElementById('compNameB').textContent = stockB.name;

        // Metric Rows Comparison Logic (Helper)
        const renderMetricRow = (peLabel, field, isLowerBetter = false) => {
            const valA = stockA[field];
            const valB = stockB[field];
            
            // Format displays
            document.getElementById(`valA-${field}`).textContent = valA;
            document.getElementById(`valB-${field}`).textContent = valB;

            // Compute gauges
            let numA = parseFloat(valA);
            let numB = parseFloat(valB);

            // Special case overrides for non-pure number strings
            if (field === 'mcap') {
                numA = valA.endsWith('T') ? parseFloat(valA) * 1000 : parseFloat(valA);
                numB = valB.endsWith('T') ? parseFloat(valB) * 1000 : parseFloat(valB);
            }
            if (field === 'risk') {
                numA = valA === 'High' ? 3 : (valA === 'Medium' ? 2 : 1);
                numB = valB === 'High' ? 3 : (valB === 'Medium' ? 2 : 1);
            }

            const total = numA + numB;
            let percentA = total > 0 ? (numA / total) * 100 : 50;
            let percentB = 100 - percentA;

            if (isLowerBetter) {
                // Reverse weights visually
                const temp = percentA;
                percentA = percentB;
                percentB = temp;
            }

            document.getElementById(`gaugeA-${field}`).style.width = `${percentA}%`;
            document.getElementById(`gaugeB-${field}`).style.width = `${percentB}%`;
        };

        renderMetricRow('Valuation (P/E)', 'pe', true);
        renderMetricRow('Market Cap', 'mcap');
        renderMetricRow('Revenue Growth', 'growth');
        renderMetricRow('Profit Margin', 'profit');
        renderMetricRow('FinSight Score', 'score');

        // Risk rating text directly
        document.getElementById('valA-risk').textContent = stockA.risk;
        document.getElementById('valB-risk').textContent = stockB.risk;
        // set risk gauges manually
        const rIndexA = stockA.risk === 'High' ? 90 : (stockA.risk === 'Medium' ? 50 : 20);
        const rIndexB = stockB.risk === 'High' ? 90 : (stockB.risk === 'Medium' ? 50 : 20);
        document.getElementById('gaugeA-risk').style.width = `${rIndexB}%`; // Lower risk is better, so draw inversely or just simple ratio
        document.getElementById('gaugeB-risk').style.width = `${rIndexA}%`;
    };

    selectA.addEventListener('change', performComparison);
    selectB.addEventListener('change', performComparison);

    // Initial load
    performComparison();
}

// 5. Portfolio Risk Analyzer (Sum 100 Sliders & SVG Donut Chart)
let portfolios = { tech: 40, finance: 20, health: 25, energy: 15 };
const SLIDERS = ['tech', 'finance', 'health', 'energy'];
const SECTOR_COLORS = { tech: '#818cf8', finance: '#fbbf24', health: '#34d399', energy: '#f87171' };

function initPortfolioRiskAnalyzer() {
    const slidersElem = SLIDERS.map(s => document.getElementById(`${s}Slider`));
    if (slidersElem.some(el => !el)) return;

    slidersElem.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const activeId = e.target.id.replace('Slider', '');
            const newValue = parseInt(e.target.value);
            
            const oldValue = portfolios[activeId];
            const diff = newValue - oldValue;
            portfolios[activeId] = newValue;

            // Recalculate remaining sectors proportionally to sum to 100
            const siblings = SLIDERS.filter(s => s !== activeId);
            const siblingSum = siblings.reduce((sum, s) => sum + portfolios[s], 0);

            if (siblingSum === 0) {
                siblings.forEach(s => { portfolios[s] = Math.round(diff * -1 / siblings.length); });
            } else {
                let currentTotal = 0;
                siblings.forEach(s => {
                    portfolios[s] -= (portfolios[s] / siblingSum) * diff;
                    portfolios[s] = Math.max(0, Math.round(portfolios[s]));
                    currentTotal += portfolios[s];
                });
            }

            // Lock exact sum to 100 (handling rounding issues)
            let total = SLIDERS.reduce((sum, s) => sum + portfolios[s], 0);
            if (total !== 100) {
                const adjustment = 100 - total;
                // find largest index and add adjustment
                let largestSector = activeId;
                let maxVal = -1;
                siblings.forEach(s => {
                    if (portfolios[s] > maxVal) {
                        maxVal = portfolios[s];
                        largestSector = s;
                    }
                });
                portfolios[largestSector] = Math.max(0, portfolios[largestSector] + adjustment);
            }

            // Sync visual UI elements
            updatePortfolioDisplay();
        });
    });

    updatePortfolioDisplay();
}

function updatePortfolioDisplay() {
    SLIDERS.forEach(s => {
        const sliderInput = document.getElementById(`${s}Slider`);
        const valueDisplay = document.getElementById(`${s}Val`);
        sliderInput.value = portfolios[s];
        valueDisplay.textContent = `${portfolios[s]}%`;
    });

    // Update SVG Donut segments
    const radius = 70;
    const circumference = 2 * Math.PI * radius; // ~439.82
    let cumulativePercent = 0;

    SLIDERS.forEach(s => {
        const segment = document.getElementById(`donut-seg-${s}`);
        if (!segment) return;

        const val = portfolios[s];
        const strokeLength = (val / 100) * circumference;
        const strokeOffset = circumference - strokeLength;
        const rotationAngle = (cumulativePercent / 100) * 360;

        segment.style.strokeDasharray = `${strokeLength} ${circumference}`;
        segment.style.strokeDashoffset = `0`;
        segment.setAttribute('transform', `rotate(${rotationAngle} 110 110)`);
        
        cumulativePercent += val;
    });

    // Calculate dynamic risk profile score
    // Weight coefficients: Tech: 0.8, Finance: 0.5, Health: 0.3, Energy: 0.7
    const techRisk = portfolios.tech * 0.8;
    const finRisk = portfolios.finance * 0.5;
    const healthRisk = portfolios.health * 0.3;
    const energyRisk = portfolios.energy * 0.7;
    const totalRiskScore = techRisk + finRisk + healthRisk + energyRisk; // Maximum possible risk: 80

    // Map 0-80 risk index to a 1-10 framework
    const finalRiskIndexFloat = (totalRiskScore / 80) * 10;
    const finalRiskIndex = finalRiskIndexFloat.toFixed(1);

    const scoreDisplay = document.getElementById('portfolioRiskVal');
    const descDisplay = document.getElementById('portfolioRiskDesc');
    const alertBox = document.getElementById('portfolioRiskAlert');

    scoreDisplay.textContent = `${finalRiskIndex}/10`;

    if (finalRiskIndexFloat < 4.5) {
        scoreDisplay.style.color = 'var(--accent-emerald)';
        descDisplay.textContent = 'DIVERSIFIED';
        alertBox.className = 'risk-alert-box green';
        alertBox.innerHTML = `
            <i class="fa-solid fa-circle-check risk-alert-icon"></i>
            <span>Excellent allocation. Diversification metrics indicate high resilience against single sector declines.</span>
        `;
    } else if (finalRiskIndexFloat < 6.8) {
        scoreDisplay.style.color = '#fbbf24';
        descDisplay.textContent = 'MODERATE';
        alertBox.className = 'risk-alert-box orange';
        alertBox.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation risk-alert-icon"></i>
            <span>Balanced but high-yield bias. Technology concentrations are moderate. Watch for upcoming interest rate updates.</span>
        `;
    } else {
        scoreDisplay.style.color = 'var(--accent-rose)';
        descDisplay.textContent = 'AGGRESSIVE';
        alertBox.className = 'risk-alert-box';
        alertBox.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation risk-alert-icon"></i>
            <span>Warning: Over-concentration in high-risk sectors (Tech/Energy). Consider rebalancing to low-beta assets.</span>
        `;
    }
}

// 6. Highlight / Pulse indicator when clicking example chat prompts
function initExamplePrompts() {
    const prompts = document.querySelectorAll('.prompt-card');
    
    prompts.forEach(card => {
        card.addEventListener('click', () => {
            const rawPrompt = card.querySelector('.prompt-text').textContent;
            
            // Generate visual highlight indicator pointing at Watson widget
            triggerWatsonHighlight(rawPrompt);
        });
    });
}

function triggerWatsonHighlight(promptText) {
    // Look for root Watson widget launcher
    const rootEl = document.getElementById('root');
    if (!rootEl) return;

    // Overlay spotlight
    let overlay = document.getElementById('watson-spotlight-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'watson-spotlight-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            z-index: 9998;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.5s ease;
        `;
        document.body.appendChild(overlay);
    }

    // Dynamic guide banner
    let banner = document.getElementById('watson-guide-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'watson-guide-banner';
        banner.className = 'watson-guide-card';
        banner.style.cssText = `
            position: fixed;
            bottom: 120px;
            right: 25px;
            padding: 20px;
            width: 320px;
            z-index: 9999;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: none;
            color: #f8fafc;
        `;
        document.body.appendChild(banner);
    }

    banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
            <i class="fa-solid fa-robot" style="color:var(--accent-cyan); font-size:16px;"></i>
            <span style="font-family:var(--font-display); font-weight:700; font-size:14px; text-transform:uppercase; letter-spacing:0.5px;">Ask Watson Assist</span>
        </div>
        <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:12px;">
            Click the Watson chat launcher in the bottom right corner and copy this query to start researching:
        </p>
        <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; font-size:13px; font-weight:600; border:1px solid rgba(255,255,255,0.08); font-family:var(--font-sans); color:white; word-break:break-word;">
            "${promptText}"
        </div>
    `;

    // Show highlight
    overlay.style.opacity = '1';
    banner.style.opacity = '1';
    banner.style.transform = 'translateY(0)';
    banner.style.pointerEvents = 'auto';

    // Highlight Watson root container
    rootEl.style.boxShadow = '0 0 40px rgba(99, 102, 241, 0.8)';
    rootEl.style.transition = 'box-shadow 0.3s ease';

    // Dismiss clicked anywhere except the banner
    const dismissHandler = (e) => {
        if (!banner.contains(e.target) && e.target !== rootEl) {
            overlay.style.opacity = '0';
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(20px)';
            banner.style.pointerEvents = 'none';
            rootEl.style.boxShadow = 'none';
            document.removeEventListener('click', dismissHandler);
        }
    };
    
    // Defer handler to avoid instantaneous trigger
    setTimeout(() => {
        document.addEventListener('click', dismissHandler);
    }, 100);
}

// js/progress.js
class ProgressManager {
    constructor() {
        this.userData = window.app.userData;
        this.init();
    }

    init() {
        this.updateProgressStats();
        this.updateCategoriesProgress();
        this.displayRecentWords();
        
        // Delay D3 chart creation to ensure DOM is fully loaded
        setTimeout(() => {
            this.createProgressChart();
            this.createCategoryChart();
            this.createStreakCalendar();
            this.createCategoryWordCloud();
        }, 100);
    }

    updateProgressStats() {
        const totalWords = vocabularyData.length;
        const learnedWords = this.userData.learnedWords.length;
        const reviewWords = this.userData.reviewWords.length;
        const streak = this.userData.streak;
        const completionPercent = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

        // Update main stats
        document.getElementById('learnedCount').textContent = learnedWords;
        document.getElementById('reviewCount').textContent = reviewWords;
        document.getElementById('streakCount').textContent = streak;
        document.getElementById('streakDisplay').textContent = `🔥 ${streak}`;

        // Update progress bar
        const progressBar = document.getElementById('mainProgress');
        progressBar.style.width = `${completionPercent}%`;
        progressBar.className = 'progress-bar';
        
        if (completionPercent < 30) {
            progressBar.classList.add('bg-warning');
        } else if (completionPercent < 70) {
            progressBar.classList.add('bg-info');
        } else {
            progressBar.classList.add('bg-success');
        }

        // Update progress text
        document.getElementById('progressText').textContent = `${learnedWords} of ${totalWords} words`;
    }

    updateCategoriesProgress() {
        const categories = {};
        const learnedWords = this.userData.learnedWords || [];

        // Count words by category
        vocabularyData.forEach(word => {
            if (!categories[word.category]) {
                categories[word.category] = { total: 0, learned: 0 };
            }
            categories[word.category].total++;
            if (learnedWords.includes(word.id)) {
                categories[word.category].learned++;
            }
        });

        const container = document.getElementById('categoriesContainer');
        if (!container) {
            console.log('Categories container not found - this is expected since we replaced it with word cloud');
            return;
        }

        let html = '';

        for (const [category, data] of Object.entries(categories)) {
            const percent = Math.round((data.learned / data.total) * 100);
            html += `
                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong class="small">${category}</strong>
                        <span class="small text-muted">${data.learned}/${data.total}</span>
                    </div>
                    <div class="progress" style="height: 6px;">
                        <div class="progress-bar ${percent < 30 ? 'bg-warning' : percent < 70 ? 'bg-info' : 'bg-success'}" 
                             role="progressbar" 
                             style="width: ${percent}%">
                        </div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    displayRecentWords() {
        const container = document.getElementById('recentWordsContainer');
        const learnedWords = this.userData.learnedWords;

        if (!learnedWords || learnedWords.length === 0) {
            if (container) {
                container.innerHTML = '<p class="text-muted text-center mb-0">Start learning to see your progress!</p>';
            }
            return;
        }

        // Get last 5 learned words
        const recentWords = learnedWords.slice(-5).reverse();
        let html = '<div class="row g-2">';

        recentWords.forEach(wordId => {
            const word = vocabularyData.find(w => w.id === wordId);
            if (word) {
                html += `
                    <div class="col-12">
                        <div class="d-flex align-items-center p-2 bg-light rounded">
                            <div class="flex-grow-1">
                                <div class="fw-medium">${word.english}</div>
                                <div class="small text-muted">${word.urdu}</div>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" onclick="window.app.speakText('${word.english}')">
                                <i class="bi bi-volume-up"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
        });

        html += '</div>';
        if (container) {
            container.innerHTML = html;
        }
    }
    
    createProgressChart() {
        const container = d3.select("#progressChart");
        if (container.empty()) {
            console.log("Progress chart container not found");
            return;
        }
        
        container.selectAll("*").remove();

        const containerNode = container.node();
        if (!containerNode) {
            console.log("Progress chart container node is null");
            return;
        }

        const margin = {top: 20, right: 30, bottom: 40, left: 50};
        const width = containerNode.getBoundingClientRect().width - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        if (width <= 0 || height <= 0) {
            console.log("Invalid dimensions for progress chart");
            return;
        }

        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const progressData = this.generateProgressData();

        const x = d3.scaleTime()
            .domain(d3.extent(progressData, d => d.date))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(progressData, d => d.words) || 1])
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.words))
            .curve(d3.curveMonotoneX);

        // Add axes
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d")));

        g.append("g")
            .call(d3.axisLeft(y));

        // Add the line
        g.append("path")
            .datum(progressData)
            .attr("fill", "none")
            .attr("stroke", "#0d6efd")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add dots
        g.selectAll(".dot")
            .data(progressData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.words))
            .attr("r", 3)
            .attr("fill", "#0d6efd");
    }

    createCategoryChart() {
        const container = d3.select("#categoryChart");
        container.selectAll("*").remove();

        const width = container.node().getBoundingClientRect().width;
        const height = 250;
        const margin = {top: 20, right: 20, bottom: 60, left: 40};

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        const categoryData = this.getCategoryData();
        
        const x = d3.scaleBand()
            .domain(categoryData.map(d => d.category))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(categoryData, d => d.total)])
            .range([height - margin.bottom, margin.top]);

        // Add bars for total words
        svg.selectAll(".bar-total")
            .data(categoryData)
            .enter().append("rect")
            .attr("class", "bar-total")
            .attr("x", d => x(d.category))
            .attr("y", d => y(d.total))
            .attr("width", x.bandwidth())
            .attr("height", d => y(0) - y(d.total))
            .attr("fill", "#e9ecef");

        // Add bars for learned words
        svg.selectAll(".bar-learned")
            .data(categoryData)
            .enter().append("rect")
            .attr("class", "bar-learned")
            .attr("x", d => x(d.category))
            .attr("y", d => y(d.learned))
            .attr("width", x.bandwidth())
            .attr("height", d => y(0) - y(d.learned))
            .attr("fill", "#0d6efd");

        // Add axes
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", "10px")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // Add labels
        svg.selectAll(".label")
            .data(categoryData)
            .enter().append("text")
            .attr("class", "label")
            .attr("x", d => x(d.category) + x.bandwidth()/2)
            .attr("y", d => y(d.learned) - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("fill", "#666")
            .text(d => d.learned > 0 ? `${d.learned}/${d.total}` : "");
    }

    createStreakCalendar() {
        const container = d3.select("#streakCalendar");
        if (container.empty()) return;
        
        container.selectAll("*").remove();

        const containerNode = container.node();
        if (!containerNode) return;

        const width = containerNode.getBoundingClientRect().width;
        const height = 120;
        
        const labelWidth = 30;
        const labelHeight = 15;
        const gridWidth = width - labelWidth;
        const gridHeight = height - labelHeight;
        
        // 7 rows (weekdays) × 10 columns (weeks) = 70 days
        const cellWidth = gridWidth / 10;
        const cellHeight = gridHeight / 7;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        // Generate last 70 days
        const today = new Date();
        const daysData = [];
        
        for (let i = 69; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            const dateKey = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay(); // 0 = Sunday
            const weekIndex = Math.floor(i / 7);
            
            // Calculate total minutes for this day
            const usageTracking = this.userData.usageTracking || {};
            const dayUsage = usageTracking[dateKey] || {};
            const totalMinutes = Object.values(dayUsage).reduce((sum, minutes) => sum + minutes, 0);
            
            daysData.push({
                date: date,
                dateKey: dateKey,
                dayOfWeek: dayOfWeek,
                weekIndex: 9 - weekIndex, // Reverse so recent weeks are on right
                totalMinutes: totalMinutes
            });
        }

        const maxMinutes = Math.max(...daysData.map(d => d.totalMinutes), 1);
        const colorScale = d3.scaleLinear()
            .domain([0, maxMinutes])
            .range(["#f8f9fa", "#0d6efd"]);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Add day labels on the left
        svg.selectAll(".day-label")
            .data(dayNames)
            .enter().append("text")
            .attr("class", "day-label")
            .attr("x", labelWidth - 5)
            .attr("y", (d, i) => labelHeight + i * cellHeight + cellHeight/2)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .style("font-size", "10px")
            .style("fill", "#666")
            .text(d => d);

        // Create daily usage cells
        svg.selectAll(".day-cell")
            .data(daysData)
            .enter().append("rect")
            .attr("class", "day-cell")
            .attr("x", d => labelWidth + d.weekIndex * cellWidth)
            .attr("y", d => labelHeight + d.dayOfWeek * cellHeight)
            .attr("width", cellWidth - 1)
            .attr("height", cellHeight - 1)
            .style("fill", d => d.totalMinutes > 0 ? colorScale(d.totalMinutes) : "#f8f9fa")
            .append("title")
            .text(d => {
                const dateStr = d.date.toLocaleDateString();
                return d.totalMinutes > 0 
                    ? `${dateStr}: ${d.totalMinutes} minutes`
                    : `${dateStr}: No activity`;
            });
    }

    generateProgressData() {
        const data = [];
        const today = new Date();
        const learnedWords = this.userData.learnedWords || [];
        
        for (let i = 14; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Simulate progressive learning
            const wordsLearned = Math.max(0, learnedWords.length - Math.floor(i * 0.3));
            
            data.push({
                date: date,
                words: Math.floor(wordsLearned)
            });
        }
        
        return data;
    }

    getCategoryData() {
        const learnedWords = this.userData.learnedWords || [];
        const categories = {};
        
        vocabularyData.forEach(word => {
            if (!categories[word.category]) {
                categories[word.category] = { learned: 0, total: 0 };
            }
            categories[word.category].total++;
            if (learnedWords.includes(word.id)) {
                categories[word.category].learned++;
            }
        });
        
        return Object.entries(categories).map(([category, data]) => ({
            category: category.length > 10 ? category.substring(0, 8) + '..' : category,
            learned: data.learned,
            total: data.total
        }));
    }

    generateStreakData() {
        const data = [];
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 84); // 12 weeks back
        
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            const weekNumber = Math.floor((d - startDate) / (7 * 24 * 60 * 60 * 1000));
            
            // Simulate learning activity based on user's actual progress
            const learnedCount = this.userData.learnedWords ? this.userData.learnedWords.length : 0;
            const count = learnedCount > 0 && Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0;
            
            data.push({
                date: new Date(d),
                day: dayOfWeek,
                week: weekNumber,
                count: count
            });
        }
        
        return data;
    }
    
    createCategoryWordCloud() {
        const container = d3.select("#categoryWordCloud");
        container.selectAll("*").remove();

        const width = container.node().getBoundingClientRect().width;
        const height = 300;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        const categoryData = this.getCategoryData();
        
        if (categoryData.length === 0) {
            svg.append("text")
                .attr("x", width/2)
                .attr("y", height/2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#666")
                .text("No categories to display");
            return;
        }
        
        // Calculate proper sizes based on learned words
        const maxLearned = Math.max(...categoryData.map(d => d.learned));
        const minSize = 14;
        const maxSize = 36;
        
        const words = categoryData.map(d => ({
            text: d.category,
            size: d.learned === 0 ? minSize : 
                  minSize + ((d.learned / maxLearned) * (maxSize - minSize)),
            learned: d.learned,
            total: d.total
        }));

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Check if d3.cloud is available
        if (typeof d3.cloud === 'undefined') {
            // Simple fallback without cloud library
            const g = svg.append("g")
                .attr("transform", `translate(${width/2},${height/2})`);
                
            words.forEach((d, i) => {
                const angle = (i / words.length) * 2 * Math.PI;
                const radius = 60 + (d.size - minSize) * 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                const text = g.append("text")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .style("font-size", `${d.size}px`)
                    .style("font-weight", "600")
                    .style("fill", color(i))
                    .style("cursor", "pointer")
                    .style("opacity", 0)
                    .text(d.text);
                
                text.append("title")
                    .text(`${d.text}: ${d.learned}/${d.total} words learned`);
                
                text.transition()
                    .duration(800)
                    .delay(i * 100)
                    .style("opacity", 1);
            });
            return;
        }

        const layout = d3.cloud()
            .size([width, height])
            .words(words)
            .padding(15) // Increased padding for more spread
            .rotate(() => {
                // 70% horizontal, 30% vertical
                return Math.random() < 0.7 ? 0 : 90;
            })
            .font("Arial")
            .fontSize(d => d.size)
            .spiral("archimedean")
            .timeInterval(10) // Slower placement for better spread
            .on("end", draw);

        layout.start();

        function draw(words) {
            const g = svg.append("g")
                .attr("transform", `translate(${width/2},${height/2})`);
                
            const texts = g.selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", d => `${d.size}px`)
                .style("font-family", "Arial")
                .style("font-weight", d => d.learned > 0 ? "700" : "400")
                .style("fill", (d, i) => {
                    // Darker colors for categories with more learned words
                    const baseColor = color(i);
                    return d.learned === 0 ? "#ccc" : baseColor;
                })
                .style("cursor", "pointer")
                .style("opacity", 0)
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
                .text(d => d.text);
            
            texts.append("title")
                .text(d => `${d.text}: ${d.learned}/${d.total} words learned`);
            
            texts.transition()
                .duration(1000)
                .delay((d, i) => i * 150)
                .style("opacity", 1);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.app !== 'undefined') {
        window.progressManager = new ProgressManager();
    }
});
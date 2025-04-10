import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';

// カラーパレットの定義
const colorScales = {
    'blue-red': d3.interpolateRgbBasis(['#2563eb', '#ffffff', '#dc2626']),
    'green-red': d3.interpolateRgbBasis(['#10b981', '#ffffff', '#dc2626']),
    'purple-yellow': d3.interpolateRgbBasis(['#8b5cf6', '#ffffff', '#facc15']),
    'grayscale': d3.interpolateRgbBasis(['#f8fafc', '#94a3b8', '#1e293b'])
};

const PlateVisualization = forwardRef(({ plateData, settings }, ref) => {
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);

    // 親コンポーネントから参照できるようにする
    useImperativeHandle(ref, () => ({
        svgRef: svgRef.current
    }));

    useEffect(() => {
        if (!plateData || plateData.length === 0) return;

        const {
            minThreshold,
            maxThreshold,
            colorPalette = 'blue-red',
            displayMode = 'heatmap'
        } = settings || {};

        // プレートの描画設定
        const margin = { top: 30, right: 30, bottom: 10, left: 30 };
        const cellSize = 50;
        const width = margin.left + margin.right + cellSize * 12;
        const height = margin.top + margin.bottom + cellSize * 8;

        // SVG要素の準備
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .html(''); // クリア

        // カラースケールの準備
        const colorScale = d3.scaleSequential(colorScales[colorPalette])
            .domain([minThreshold, maxThreshold]);

        // グループ作成
        const plateGroup = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // 列ヘッダー (1-12)
        plateGroup.selectAll('.column-header')
            .data(Array.from({ length: 12 }, (_, i) => i + 1))
            .enter()
            .append('text')
            .attr('class', 'column-header')
            .attr('x', (d, i) => i * cellSize + cellSize / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text(d => d);

        // 行ヘッダー (A-H)
        plateGroup.selectAll('.row-header')
            .data(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])
            .enter()
            .append('text')
            .attr('class', 'row-header')
            .attr('x', -10)
            .attr('y', (d, i) => i * cellSize + cellSize / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '12px')
            .text(d => d);

        // ツールチップ
        const tooltip = d3.select(tooltipRef.current)
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background-color', 'white')
            .style('border', '1px solid #ddd')
            .style('padding', '10px')
            .style('border-radius', '4px')
            .style('pointer-events', 'none')
            .style('font-size', '12px')
            .style('box-shadow', '0 2px 5px rgba(0, 0, 0, 0.1)');

        // 各ウェルのセルを作成
        const cells = plateGroup.selectAll('.cell')
            .data(plateData)
            .enter()
            .append('g')
            .attr('class', 'cell')
            .attr('transform', d => `translate(${d.col * cellSize}, ${d.row * cellSize})`);

        // ウェルの背景
        cells.append('rect')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fill', d => {
                if (d.value < minThreshold) return 'rgba(230, 230, 230, 0.7)'; // 閾値未満は薄いグレー
                if (d.value > maxThreshold) return 'rgba(230, 230, 230, 0.7)'; // 閾値超過も薄いグレー
                return colorScale(d.value);
            })
            .attr('stroke', d => {
                // 閾値内のウェルはハイライト表示
                if (d.value >= minThreshold && d.value <= maxThreshold) {
                    return '#000';
                }
                return '#ddd';
            })
            .attr('stroke-width', d => {
                // 閾値内のウェルはハイライト表示
                if (d.value >= minThreshold && d.value <= maxThreshold) {
                    return 2;
                }
                return 1;
            });

        // 値テキスト（表示モードが数値またはハイブリッドの場合）
        if (displayMode === 'numeric' || displayMode === 'hybrid') {
            cells.append('text')
                .attr('x', cellSize / 2)
                .attr('y', cellSize / 2)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '11px')
                .attr('fill', d => {
                    // 閾値外のウェルはグレーテキスト
                    if (d.value < minThreshold || d.value > maxThreshold) {
                        return '#999';
                    }

                    // 閾値内のウェルは通常のテキスト色
                    const color = d3.rgb(colorScale(d.value));
                    const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
                    return brightness > 125 ? '#000' : '#fff';
                })
                .text(d => d.value.toFixed(1));
        }

        // コンフルエンスの表示文字（新規追加）
        if (displayMode === 'heatmap' || displayMode === 'hybrid') {
            cells.append('text')
                .attr('x', cellSize / 2)
                .attr('y', cellSize - 8)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '9px')
                .attr('fill', d => {
                    // 閾値外のウェルはグレーテキスト
                    if (d.value < minThreshold || d.value > maxThreshold) {
                        return '#999';
                    }
                    // 閾値内のウェルは黒テキスト（見やすさ優先）
                    return '#000';
                })
                .text(d => '% confluence');
        }

        // インタラクション
        cells.on('mouseover', (event, d) => {
            tooltip.style('visibility', 'visible')
                .html(`
          <strong>ウェル: ${d.rowLabel}${d.colLabel}</strong><br>
          % confluence: ${d.value.toFixed(1)}<br>
          ステータス: ${d.value >= minThreshold && d.value <= maxThreshold ?
                        '<span style="color: green;">閾値内</span>' :
                        '<span style="color: gray;">閾値外</span>'}
        `);
        })
            .on('mousemove', (event) => {
                tooltip.style('top', (event.pageY - 10) + 'px')
                    .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseout', () => {
                tooltip.style('visibility', 'hidden');
            })
            .style('cursor', 'pointer');

        // カラースケールの凡例
        const legendWidth = 200;
        const legendHeight = 20;

        const legendX = width - legendWidth - margin.right;
        const legendY = height - legendHeight - margin.bottom;

        // 凡例スケール
        const legendScale = d3.scaleLinear()
            .domain([minThreshold, maxThreshold])
            .range([0, legendWidth]);

        const legendGroup = svg.append('g')
            .attr('transform', `translate(${legendX}, ${legendY})`);

        // 閾値表示の追加（新規追加）
        legendGroup.append('text')
            .attr('x', -20)
            .attr('y', legendHeight / 2 + 5)
            .attr('text-anchor', 'end')
            .attr('font-size', '12px')
            .text(`閾値: ${minThreshold.toFixed(1)}〜${maxThreshold.toFixed(1)}`);

        // 凡例の背景グラデーション
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%')
            .attr('x2', '100%')
            .attr('y1', '0%')
            .attr('y2', '0%');

        // グラデーションの色設定
        const numStops = 10;
        for (let i = 0; i < numStops; i++) {
            const offset = i / (numStops - 1);
            const value = minThreshold + offset * (maxThreshold - minThreshold);
            gradient.append('stop')
                .attr('offset', `${offset * 100}%`)
                .attr('stop-color', colorScale(value));
        }

        // 凡例の長方形
        legendGroup.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#legend-gradient)');

        // 凡例の軸
        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickFormat(d3.format('.1f'));

        legendGroup.append('g')
            .attr('transform', `translate(0, ${legendHeight})`)
            .call(legendAxis);

        // 凡例タイトル
        legendGroup.append('text')
            .attr('x', legendWidth / 2)
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('% confluence');

        // 閾値内のウェル数表示（改善版）
        const wellsInThreshold = plateData.filter(d => d.value >= minThreshold && d.value <= maxThreshold).length;
        const totalNonZeroWells = plateData.filter(d => d.value > 0).length;
        const hitPercentage = Math.round(wellsInThreshold / totalNonZeroWells * 100);

        // ヒット率の背景色を決定
        let hitBgColor = '#e5e7eb'; // デフォルトはグレー
        if (hitPercentage >= 50) {
            hitBgColor = '#10b981'; // 緑（高いヒット率）
        } else if (hitPercentage >= 20) {
            hitBgColor = '#f59e0b'; // オレンジ（中程度のヒット率）
        } else if (hitPercentage > 0) {
            hitBgColor = '#ef4444'; // 赤（低いヒット率）
        }

        // ヒット率表示用の背景ボックス
        svg.append('rect')
            .attr('x', margin.left)
            .attr('y', height - 30)
            .attr('width', 200)
            .attr('height', 24)
            .attr('rx', 4)
            .attr('fill', hitBgColor)
            .attr('opacity', 0.2)
            .attr('stroke', hitBgColor)
            .attr('stroke-width', 1);

        // ヒット率テキスト
        svg.append('text')
            .attr('x', margin.left + 10)
            .attr('y', height - 14)
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'start')
            .attr('fill', '#000')
            .text(`ヒットウェル: ${wellsInThreshold}/${totalNonZeroWells} (${hitPercentage}%)`);

    }, [plateData, settings]);

    return (
        <div className="relative flex justify-center">
            <div>
                <svg ref={svgRef} className="mx-auto"></svg>
                <div ref={tooltipRef}></div>
            </div>
        </div>
    );
});

export default PlateVisualization;
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  Time,
  CandlestickSeries,
  HistogramSeries,
} from 'lightweight-charts';

interface PriceChartProps {
  tokenAddress?: string;
  tokenSymbol: string;
  basePrice: number | null | undefined;
}

export function PriceChart({ tokenAddress, tokenSymbol, basePrice }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '1D'>('15m');
  const [dataSource, setDataSource] = useState<string>('ROBINHOOD_DEX');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const price = basePrice && basePrice > 0 ? basePrice : 0.01;

  // Fetch real Kline data from our GMGN + On-Chain API
  const fetchKlineData = useCallback(async () => {
    if (!tokenAddress) return;

    try {
      const res = await fetch(`/api/tokens/${tokenAddress}/kline?resolution=${timeframe}&limit=100`);
      if (res.ok) {
        const json = await res.json();
        setDataSource(json.source || 'ROBINHOOD_ONCHAIN_DEX');

        if (Array.isArray(json.list) && json.list.length > 0) {
          const chartData: CandlestickData<Time>[] = json.list.map((b: any) => ({
            time: b.time as Time,
            open: b.open,
            high: b.high,
            low: b.low,
            close: b.close,
          }));

          const volumeData: HistogramData<Time>[] = json.list.map((b: any) => ({
            time: b.time as Time,
            value: b.volume || Math.abs(b.close - b.open) * 1000,
            color: b.close >= b.open ? '#00C80533' : '#FF500033',
          }));

          seriesRef.current?.setData(chartData);
          volumeSeriesRef.current?.setData(volumeData);
          chartRef.current?.timeScale().fitContent();
        }
      }
    } catch (err) {
      console.error('Failed to fetch real kline data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress, timeframe]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize Lightweight Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#000000' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1a222d' },
        horzLines: { color: '#1a222d' },
      },
      crosshair: {
        vertLine: { color: '#00C805', width: 1 },
        horzLine: { color: '#00C805', width: 1 },
      },
      rightPriceScale: {
        borderColor: '#1a222d',
      },
      timeScale: {
        borderColor: '#1a222d',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00C805',
      downColor: '#FF5000',
      borderVisible: false,
      wickUpColor: '#00C805',
      wickDownColor: '#FF5000',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#00C805',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // overlay
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // volume at bottom 20%
        bottom: 0,
      },
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    // Initial fetch of real kline data
    fetchKlineData();

    // Auto-refresh kline stream every 6 seconds
    const interval = setInterval(fetchKlineData, 6000);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [fetchKlineData]);


  return (
    <div className="bg-[#0a0d12] border border-[#1a222d] rounded-2xl overflow-hidden flex flex-col font-mono shadow-xl">
      {/* Chart Header Bar */}
      <div className="px-4 py-2.5 bg-[#0d1117] border-b border-[#1a222d] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-zinc-100 uppercase tracking-wide">
            {tokenSymbol} / USD
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#12171e] text-zinc-400 border border-[#1a222d]">
            {dataSource === 'GMGN_OPENAPI' ? 'GMGN Feed' : 'Robinhood DEX Feed'}
          </span>
          {isLoading && (
            <span className="text-[10px] text-zinc-500 animate-pulse">Syncing on-chain klines...</span>
          )}
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-[#12171e] p-0.5 rounded-lg border border-[#1a222d] text-[11px]">
          {(['1m', '5m', '15m', '1h', '1D'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                timeframe === tf
                  ? 'bg-[#00C805]/15 text-[#00C805] font-semibold border border-[#00C805]/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="w-full h-[360px]" />
    </div>
  );
}

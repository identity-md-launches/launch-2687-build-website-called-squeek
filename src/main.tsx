import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HamsterMark, WheelScene } from './Hamster';
import { Icon } from './icons';
import { API_URL, EXPLORER_URL, SAMPLE_ACTIVITY, parseTransactions, shortHash, timeAgo, type Activity } from './activity';
import './styles.css';

type Route = 'dashboard' | 'about';
const readRoute = (): Route => location.hash === '#/about' ? 'about' : 'dashboard';

function App() {
  const [route, setRoute] = useState<Route>(readRoute);
  const [paused, setPaused] = useState(false);
  const [boostUntil, setBoostUntil] = useState(0);
  const [seeds, setSeeds] = useState(0);
  const [turns, setTurns] = useState(68);
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  const [shareOpen, setShareOpen] = useState(false);
  const [copyState, setCopyState] = useState('Copy link');
  const [selected, setSelected] = useState<Activity | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const shareDialog = useRef<HTMLDialogElement>(null);
  const pageHeading = useRef<HTMLHeadingElement>(null);
  const previousRoute = useRef(route);
  const boosted = now < boostUntil;
  const phase = Math.floor(turns / 100) > 0 && turns % 100 < 8 ? 2 : turns % 100 > 85 ? 1 : 0;
  const progress = turns % 100;
  const batch = 42 + Math.floor(turns / 100);

  useEffect(() => {
    const change = () => { setRoute(readRoute()); window.scrollTo({ top: 0, behavior: 'instant' }); };
    addEventListener('hashchange', change);
    return () => removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    document.title = route === 'about' ? 'About Squeekchain · Squeek Radar' : 'Squeek Radar · Small paws. Big blocks.';
    if (previousRoute.current !== route) pageHeading.current?.focus();
    previousRoute.current = route;
  }, [route]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setTurns((value) => value + (boosted ? 3 : 1)), 5000);
    return () => clearInterval(timer);
  }, [paused, boosted]);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  useEffect(() => {
    if (shareOpen) shareDialog.current?.showModal();
    else shareDialog.current?.close();
  }, [shareOpen]);

  const giveSeed = () => {
    setSeeds((n) => n + 1);
    setTurns((n) => n + 6);
    setBoostUntil(Date.now() + 8000);
    setNow(Date.now());
    setPaused(false);
    setNotice('Seed delivered! Six wheel turns added. Squeek has an eight-second speed boost.');
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href.split('#')[0]);
      setCopyState('Link copied');
    } catch { setCopyState('Select the link below to copy'); }
  };

  return <>
    <a className="skip-link" href="#main" onClick={(event) => { event.preventDefault(); document.getElementById('main')?.focus(); document.getElementById('main')?.scrollIntoView(); }}>Skip to content</a>
    <header className="site-header">
      <div className="header-inner">
        <a href="#/" className="brand" aria-label="Squeek Radar home"><HamsterMark /><span>Squeek<span className="brand-light"> Radar</span></span></a>
        <nav aria-label="Main navigation">
          <a href="#/" aria-current={route === 'dashboard' ? 'page' : undefined}>Dashboard</a>
          <a href="#/about" aria-current={route === 'about' ? 'page' : undefined}>About</a>
        </nav>
        <div className="header-tools"><span className="network-label"><span className="status-dot" />Sepolia testnet</span><button className="icon-button share-button" type="button" aria-label="Share Squeek Radar" onClick={() => { setCopyState('Copy link'); setShareOpen(true); }}><Icon name="share" /></button></div>
      </div>
    </header>

    <main id="main" tabIndex={-1} className="page-shell">
      {route === 'dashboard' ? <>
        <div className="page-intro">
          <div><h1 ref={pageHeading} tabIndex={-1}>Small paws. <span>Big blocks.</span></h1><p>Your window into the hamster-powered toychain on Ethereum.</p></div>
          <a className="intro-link" href="#/about">A tiny chain with a big heart <Icon name="arrow" /></a>
        </div>

        <div className="control-grid">
          <section className={`wheel-room ${paused ? 'room-paused' : ''} ${boosted ? 'room-boosted' : ''}`} aria-labelledby="wheel-heading">
            <div className="panel-heading"><h2 id="wheel-heading"><span className={`status-dot ${paused ? 'dot-paused' : ''}`} />{paused ? 'A well-earned breather' : boosted ? 'Running on seed power' : 'The wheel is turning'}</h2><button className="icon-button" type="button" aria-label={paused ? 'Resume simulation' : 'Pause simulation'} onClick={() => { setPaused(!paused); setNotice(paused ? 'Simulation resumed.' : 'Simulation paused. Squeek is taking a break.'); }}><Icon name={paused ? 'play' : 'pause'} /></button></div>
            <div className="wheel-scene"><span className="scene-label">Squeek #001</span><span className="simulation-label">Local simulation</span><WheelScene paused={paused} boosted={boosted} /><span className="hamster-caption">{paused ? 'tiny paws, tiny pause.' : boosted ? 'oh, now we’re squeeking.' : 'honest work. tiny paws.'}</span></div>
            <div className="wheel-controls">
              <div className="wheel-metric"><span>Wheel speed</span><strong><span className="pixel-number">{paused ? '0' : boosted ? '36' : '12'}</span> <span className="unit">rpm</span></strong></div>
              <div className="wheel-metric seed-metric"><span>Seeds shared</span><strong className="pixel-number">{seeds.toString().padStart(2, '0')}</strong></div>
              <button type="button" className="button button-primary" onClick={giveSeed}><Icon name="seed" />Give a seed <span className="button-plus">+</span></button>
            </div>
            <p className="control-hint">A seed adds 6 turns and a short speed boost. Just for fun.</p>
          </section>

          <section className="work-panel surface" aria-labelledby="work-heading">
            <div className="panel-heading"><h2 id="work-heading">A little work in progress</h2><span className="section-icon"><Icon name="work" /></span></div>
            <div className="batch-row"><span>Batch #{batch.toString().padStart(4, '0')}</span><span className="work-state"><span className="status-dot" />{paused ? 'Paused' : phase === 2 ? 'Starting next batch' : phase === 1 ? 'Packing the batch' : 'Collecting turns'}</span></div>
            <div className="progress-reading"><strong>{progress}<span>%</span></strong><span>One turn closer.</span></div>
            <div className="segmented-progress" role="progressbar" aria-label="Simulated work batch progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>{Array.from({ length: 25 }, (_, i) => <span key={i} className={i < Math.floor(progress / 4) ? 'filled' : ''} />)}</div>
            <div className="progress-meta"><span>{progress} of 100 wheel turns</span><span>100 turns / batch</span></div>
            <div className="sparkline-block"><div className="sparkline-label"><span>Wheel activity</span><span>Illustrative history</span></div><svg className="sparkline" viewBox="0 0 400 64" preserveAspectRatio="none" role="img" aria-label="Illustrative wheel activity, not measured history"><path d="M0 50H400M0 25H400" stroke="#edf0f6" fill="none" /><path d="M0 49 15 48 28 51 40 37 54 39 65 33 78 36 90 27 104 30 114 39 128 28 140 31 155 21 168 27 182 23 195 32 208 21 221 27 236 15 250 21 264 17 278 27 292 19 307 23 321 10 335 17 349 12 364 21 379 11 392 15 400 6" fill="none" stroke="#6686ee" strokeWidth="2" strokeLinejoin="round" /></svg></div>
            <div className="next-stop"><span className="next-stop-icon"><Icon name="ethereum" /></span><div><strong>Next stop: Ethereum</strong><span>Simulated settlement on Sepolia</span></div><Icon name="arrow" /></div>
          </section>
        </div>
        <div className="ecosystem-header"><h2>The Squeek ecosystem</h2><span className="muted">At a glance · demo status</span></div>
        <section className="ecosystem-grid" aria-label="SQK ecosystem demo status">
          <StatusCard icon="wheel" title="Wheel crew" value="1 happy hamster" text={paused ? 'Taking a tiny break' : 'Keeping things moving'} badge={paused ? 'Resting' : 'Running'} />
          <StatusCard icon="work" title="Work batches" value={`${Math.floor(turns / 100)} completed`} text="In this browser session" badge="Local" />
          <StatusCard icon="ethereum" title="Settlement layer" value="Ethereum" text="Sepolia testnet playground" badge="Testnet" />
          <StatusCard icon="globe" title="SQK ecosystem" value="Small & squeaky" text="A community toychain" badge="Just for fun" />
        </section>

        <section className="journey surface" aria-labelledby="journey-heading"><div className="section-top"><div><h2 id="journey-heading">From tiny paws to Ethereum</h2><p>Follow a batch through the toychain.</p></div><a href="#/about" className="text-link">How it works <Icon name="arrow" /></a></div>
          <ol className="journey-steps">
            {[
              { icon: 'wheel' as const, title: 'Spin the wheel', text: 'Little legs create wheel turns.' },
              { icon: 'work' as const, title: 'Bundle the work', text: '100 turns make one work batch.' },
              { icon: 'ethereum' as const, title: 'Settle on Ethereum', text: 'The batch reaches its pretend finish line.' },
            ].map((step, i) => <li key={step.title} className={phase === i ? 'step-current' : ''}><span className="step-icon"><Icon name={step.icon} /></span><div><h3><span className="step-number">0{i + 1}</span> {step.title}</h3><p>{step.text}</p></div>{i < 2 && <Icon name="arrow" className="step-arrow" />}</li>)}
          </ol>
          <p className="journey-note"><Icon name="info" />This animation is a toychain demo. Giving seeds never sends a transaction.</p>
        </section>
        <ActivityFeed now={now} onSelect={setSelected} />
        <section className="community-note"><HamsterMark /><div><h2>Built for the joy of it.</h2><p>A small experiment in making Ethereum a little more squeaky.</p></div><a href="#/about" className="text-link">Meet Squeekchain <Icon name="arrow" /></a></section>
      </> : <>
        <div className="about-intro"><a href="#/" className="text-link back-link"><span aria-hidden="true">←</span> Back to the wheel</a><h1 ref={pageHeading} tabIndex={-1}>Powered by <span>tiny paws.</span></h1><p>Squeekchain is a hamster-powered toychain on Ethereum.</p></div>
        <div className="about-layout"><section className="about-copy surface"><h2>A little chain. A lot of heart.</h2><p>Squeek Radar is a playful window into the Squeekchain ecosystem: a tiny hamster, a spinning wheel, and a story about work finding its way to Ethereum.</p><p>It is a community experiment built for curiosity. Here, “hamster-powered” is a creative metaphor. The illustrated hamster and wheel run in your browser.</p><h2>What happens when you give a seed?</h2><p>Each seed adds six simulated wheel turns and speeds Squeek up for eight seconds. Every 100 turns completes a local batch. The timeline follows the idea from wheel, to work, to Ethereum settlement.</p><p>All wheel stats and batches belong to your current browser session and reset when you reload. Settlements in this demo are pretend; no transaction is sent.</p><h2>A real network, a playful window</h2><p>The Sepolia feed reads recent, network-wide Ethereum testnet activity from Blockscout. Those transactions are independent of the wheel. If the public API is unavailable, clearly marked samples illustrate what activity could look like.</p><p>Sample rows have descriptive IDs instead of transaction hashes. Only verified-format hashes returned by the API link to the explorer.</p><h2>Here for the squeeks</h2><p>SQK is an ecosystem label in this dashboard. This site creates no token, deploys no contract, and asks for no wallet. All you need to bring is a little curiosity.</p><a className="button button-primary" href="#/">Give Squeek a seed <Icon name="arrow" /></a></section><aside className="about-aside"><div className="about-hamster"><HamsterMark /><span className="pixel-label">Meet Squeek.</span><p>Chief wheel officer.<br />Very small. Very committed.</p></div><div className="about-facts"><h2>The little details</h2><dl><div><dt>Home</dt><dd>Ethereum</dd></div><div><dt>Playground</dt><dd>Sepolia testnet</dd></div><div><dt>Fuel</dt><dd>Imaginary seeds</dd></div><div><dt>Vibe</dt><dd>Pure curiosity</dd></div></dl><a className="text-link" href={`${EXPLORER_URL}/txs`} target="_blank" rel="noreferrer">Explore Sepolia <Icon name="external" /></a></div></aside></div>
      </>}
    </main>

    <footer className="site-footer"><div><a href="#/" className="footer-brand"><HamsterMark />Squeek Radar</a><span>Small paws, one playful Ethereum experiment.</span></div><div><a href="#/about">About the toychain</a><span className="footer-testnet"><span className="status-dot" />Made for the sandbox</span></div></footer>
    <span className="sr-only" role="status">{notice}</span>

    <dialog ref={dialog} className="detail-dialog" onClose={() => setSelected(null)} onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }} aria-labelledby="detail-title">
      {selected && <><div className="dialog-heading"><h2 id="detail-title">{selected.title}</h2><button type="button" className="icon-button" aria-label="Close transaction details" onClick={() => setSelected(null)}><Icon name="close" /></button></div><span className={`badge ${selected.status === 'Sample' ? '' : 'badge-success'}`}>{selected.status}</span>{selected.status === 'Sample' ? <p>This is an illustrative activity row. It has no onchain transaction, address, or explorer record.</p> : <p>Network-wide Ethereum Sepolia activity, independent of the hamster simulation.</p>}<dl className="detail-list"><div><dt>{selected.status === 'Sample' ? 'Sample ID' : 'Transaction hash'}</dt><dd className="mono full-hash">{selected.id}</dd></div><div><dt>Value</dt><dd>{selected.value}</dd></div>{selected.block !== null && <div><dt>Block</dt><dd>{selected.block.toLocaleString('en-US')}</dd></div>}{selected.timestamp && <div><dt>Recorded</dt><dd>{new Date(selected.timestamp).toUTCString()}</dd></div>}{selected.from && <div><dt>From</dt><dd className="mono full-hash">{selected.from}</dd></div>}{selected.to && <div><dt>To</dt><dd className="mono full-hash">{selected.to}</dd></div>}</dl>{selected.status !== 'Sample' && <a className="button button-primary" href={`${EXPLORER_URL}/tx/${selected.id}`} target="_blank" rel="noreferrer">View on Blockscout <Icon name="external" /></a>}</>}
    </dialog>

    <dialog ref={shareDialog} className="share-dialog" onClose={() => setShareOpen(false)} onClick={(e) => { if (e.target === e.currentTarget) setShareOpen(false); }} aria-labelledby="share-title"><div className="dialog-heading"><h2 id="share-title">Send a little squeek</h2><button type="button" className="icon-button" aria-label="Close sharing" onClick={() => setShareOpen(false)}><Icon name="close" /></button></div><img className="share-preview" src="./share-card.png" alt="Squeek Radar: Small paws. Big blocks." width="1200" height="630" /><p>Know someone who appreciates tiny paws and big blocks?</p><div className="share-actions"><a className="button button-primary" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Small paws. Big blocks. Meet Squeek Radar, a hamster-powered window into Ethereum.')}&url=${encodeURIComponent(location.href.split('#')[0])}`} target="_blank" rel="noreferrer">Share on X <Icon name="external" /></a><button type="button" className="button button-secondary" onClick={copyLink}>{copyState}</button></div><p className="share-url" tabIndex={0}>{location.href.split('#')[0]}</p><span role="status" className="sr-only">{copyState === 'Link copied' ? 'Link copied to clipboard.' : ''}</span></dialog>
  </>;
}

function StatusCard({ icon, title, value, text, badge }: { icon: 'wheel' | 'work' | 'ethereum' | 'globe'; title: string; value: string; text: string; badge: string }) {
  return <article className="status-card surface"><div className="status-card-top"><span className="card-icon"><Icon name={icon} /></span><span className="badge">{badge}</span></div><h3>{title}</h3><strong>{value}</strong><p>{text}</p></article>;
}

function ActivityFeed({ now, onSelect }: { now: number; onSelect: (activity: Activity) => void }) {
  const [items, setItems] = useState<Activity[]>([]);
  const [source, setSource] = useState<'loading' | 'live' | 'sample'>('loading');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(5);
  const [updated, setUpdated] = useState<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 6500);
    setLoading(true);
    try {
      const response = await fetch(API_URL, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Feed unavailable');
      const activity = parseTransactions(await response.json());
      setItems(activity);
      setSource('live');
      setUpdated(Date.now());
    } catch {
      if (controllerRef.current !== controller) return;
      setItems(SAMPLE_ACTIVITY);
      setSource('sample');
      setUpdated(null);
    } finally {
      window.clearTimeout(timeout);
      if (controllerRef.current === controller) setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); return () => controllerRef.current?.abort(); }, [load]);
  const filtered = items.filter((item) => filter === 'all' || item.kind === filter);
  const filteredItems = filtered.slice(0, visibleCount);
  return <section className="activity-section surface" aria-labelledby="activity-heading"><div className="section-top activity-heading"><div><h2 id="activity-heading">Latest on Sepolia <span className={`badge ${source === 'live' ? 'badge-success' : ''}`}>{source === 'live' ? 'Live network data' : source === 'sample' ? 'Sample data' : 'Connecting'}</span></h2><p>Ethereum testnet activity, beyond the hamster wheel.</p></div><button type="button" className="button button-secondary refresh-button" onClick={() => void load()} disabled={loading}><Icon name="refresh" className={loading ? 'refreshing' : ''} />{loading ? 'Refreshing' : 'Refresh'}</button></div>
    <div className="feed-toolbar"><div className="filter-group" role="group" aria-label="Filter transactions">{[{ id: 'all', title: 'All activity' }, { id: 'transfer', title: 'Transfers' }, { id: 'contract', title: 'Contract calls' }].map((option) => <button type="button" key={option.id} aria-pressed={filter === option.id} className={filter === option.id ? 'filter-active' : ''} onClick={() => { setFilter(option.id); setVisibleCount(5); }}>{option.title}</button>)}</div><a href={`${EXPLORER_URL}/txs`} target="_blank" rel="noreferrer" className="text-link explorer-link">Open explorer <Icon name="external" /></a></div>
    <p className="feed-notice" role="status">{loading ? 'Fetching the latest confirmed transactions…' : source === 'sample' ? 'Live feed unavailable. Showing illustrative activity. Refresh to try again.' : `${filtered.length} ${filtered.length === 1 ? 'transaction' : 'transactions'} in this snapshot. Updated at ${new Date(updated ?? now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`}</p>
    <div className="transaction-table"><div className="table-header" aria-hidden="true"><span>Transaction</span><span>Activity</span><span>Value</span><span>Status</span><span>When</span><span /></div>{loading && items.length === 0 ? <div className="feed-empty"><Icon name="refresh" className="refreshing" /><p>Listening for little bits of activity.</p></div> : filteredItems.length > 0 ? <ul className="transaction-list">{filteredItems.map((item) => <li key={item.id}><button type="button" className="transaction-row" aria-label={`View ${item.title}: ${shortHash(item.id)}`} onClick={() => onSelect(item)}><span className="tx-identity"><span className="tx-icon"><Icon name={item.kind === 'transfer' ? 'arrow' : 'work'} /></span><span className="mono">{shortHash(item.id)}</span></span><span className="tx-kind">{item.title}</span><span className="tx-value mono">{item.value}</span><span className={`tx-status ${item.status === 'Failed' ? 'tx-failed' : ''}`}>{item.status === 'Confirmed' && <Icon name="check" />}{item.status}</span><span className="tx-time">{timeAgo(item.timestamp, now)}</span><Icon name="chevron" className="tx-chevron" /></button></li>)}</ul> : <div className="feed-empty"><Icon name="info" /><p>No {filter === 'transfer' ? 'transfers' : filter === 'contract' ? 'contract calls' : 'transactions'} in this snapshot.</p><button type="button" className="text-button" onClick={() => { setFilter('all'); if (items.length === 0) void load(); }}>Show all activity{items.length === 0 ? ' and refresh' : ''}</button></div>}</div>
    <div className="feed-footer"><span><span className="status-dot" />{source === 'live' ? 'Read-only · Ethereum Sepolia' : 'Demo activity · no transactions sent'}</span>{filtered.length > visibleCount && <button type="button" className="text-button" onClick={() => setVisibleCount((count) => count + 5)}>Show more activity <Icon name="arrow" /></button>}</div>
  </section>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);

import { useEffect, useMemo, useRef, useState } from 'react';
import { W, H, LOOP_MS, TEMPLATES, drawFrame } from './cardRenderer';
import { cutOutPerson } from './segmentPerson';
import './ShareStudio.css';

const HEADLINES = ['LEG DAY', 'PUSH DAY', 'PULL DAY', 'CHEST DAY', 'ARM DAY', 'CARDIO DAY', 'BEAST MODE', 'NO EXCUSES'];
const PR_EXERCISES = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Incline Bench Press', 'Lat Pull Down', 'Barbell Curl', 'Pull-ups', '5K Run'];
const STAT_PRESETS = ['Sets', 'Reps', 'Volume', 'Duration', 'Calories', 'Distance', 'Streak'];
const MAX_STATS = 4;
const MAX_SIDE = 1600;

const todayIST = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD

function formatDay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function pickVideoMime() {
  if (typeof MediaRecorder === 'undefined') return null;
  const types = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || null;
}

/** Draw an image/video source into a canvas no larger than MAX_SIDE. */
function toCanvas(source, sw, sh, mirror = false) {
  const s = Math.min(1, MAX_SIDE / Math.max(sw, sh));
  const c = document.createElement('canvas');
  c.width = Math.round(sw * s);
  c.height = Math.round(sh * s);
  const ctx = c.getContext('2d');
  if (mirror) {
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, 0, 0, c.width, c.height);
  return c;
}

/**
 * Share-card editor. Everything on the card comes from what the user types —
 * nothing is read from logged workouts, so it works for visitors too.
 */
export default function ShareStudio({ defaultName = '' }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const startRef = useRef(0);
  const optsRef = useRef({});

  const [photo, setPhoto] = useState(null);
  const [cutout, setCutout] = useState(null);
  const [segState, setSegState] = useState('idle'); // idle | done | failed
  const [removeBg, setRemoveBg] = useState(true);
  const [template, setTemplate] = useState('pulse');
  const [camera, setCamera] = useState(false);
  const [recording, setRecording] = useState(null); // null | 0..1
  const [lastVideo, setLastVideo] = useState(null);
  const [logo, setLogo] = useState(null);
  const [note, setNote] = useState('');

  // user-entered card content
  const [name, setName] = useState(defaultName);
  const [day, setDay] = useState(todayIST());
  const [showDate, setShowDate] = useState(true);
  const [headline, setHeadline] = useState('LEG DAY');
  const [prOn, setPrOn] = useState(true);
  const [prExercise, setPrExercise] = useState('Squat');
  const [prValue, setPrValue] = useState('120 KG');
  const [stats, setStats] = useState([
    { label: 'Sets', value: '20' },
    { label: 'Duration', value: '70 MIN' },
    { label: 'Calories', value: '540' },
  ]);

  const videoMime = useMemo(() => pickVideoMime(), []);
  const canShareFiles = typeof navigator !== 'undefined' && !!navigator.canShare;

  /* ── logo + fonts ── */
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLogo(img);
    img.src = '/fittnation logo.jpg';
    document.fonts?.load('80px "Bebas Neue"').catch(() => {});
  }, []);

  /* ── latest render options for the animation loop ── */
  useEffect(() => {
    optsRef.current = {
      template,
      photo,
      cutout: removeBg ? cutout : null,
      headline,
      name: name.trim().split(' ')[0] || '',
      dateLabel: showDate ? formatDay(day) : '',
      stats,
      pr: prOn ? { exercise: prExercise, value: prValue } : null,
      logo,
    };
  });

  /* ── animation loop ── */
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    let raf;
    if (!startRef.current) startRef.current = performance.now();
    const tick = (now) => {
      drawFrame(ctx, now - startRef.current, optsRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [camera]);

  /* ── background removal whenever the photo changes ── */
  useEffect(() => {
    if (!photo || !removeBg || cutout || segState === 'failed') return;
    let cancelled = false;
    cutOutPerson(photo)
      .then((c) => {
        if (cancelled) return;
        if (c) { setCutout(c); setSegState('done'); }
        else { setSegState('failed'); setNote('We couldn’t find a person in this photo — showing it full-frame instead.'); }
      })
      .catch(() => {
        if (cancelled) return;
        setSegState('failed');
        setNote('Background removal isn’t available on this device — showing your photo full-frame.');
      });
    return () => { cancelled = true; };
  }, [photo, removeBg, cutout, segState]);

  const applyPhoto = (canvas) => {
    setCutout(null);
    setSegState('idle');
    setNote('');
    setLastVideo(null);
    setPhoto(canvas);
    startRef.current = performance.now();
  };

  /* ── camera ── */
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamera(false);
  };

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const startCamera = async () => {
    setNote('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setNote('Camera isn’t available here — upload a photo instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      setCamera(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setNote('Camera permission was denied — you can upload a photo instead.');
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = toCanvas(v, v.videoWidth, v.videoHeight, true);
    stopCamera();
    applyPhoto(c);
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      applyPhoto(toCanvas(img, img.naturalWidth, img.naturalHeight));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => setNote('That file couldn’t be opened as an image.');
    img.src = url;
  };

  /* ── stats editing ── */
  const updateStat = (i, field, value) => setStats((s) => s.map((x, j) => (j === i ? { ...x, [field]: value } : x)));
  const removeStat = (i) => setStats((s) => s.filter((_, j) => j !== i));
  const addStat = (label = '') => setStats((s) => (s.length >= MAX_STATS ? s : [...s, { label, value: '' }]));

  /* ── export ── */
  const fileBase = `fittnation-${day || todayIST()}`;

  const renderStill = () =>
    new Promise((resolve) => {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      drawFrame(c.getContext('2d'), LOOP_MS * 0.6, optsRef.current);
      c.toBlob((b) => resolve(b), 'image/png');
    });

  const download = (blob, fname) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const savePhoto = async () => download(await renderStill(), `${fileBase}.png`);

  const saveVideo = () => {
    if (!videoMime || recording !== null) return;
    const stream = canvasRef.current.captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: videoMime, videoBitsPerSecond: 8_000_000 });
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const type = videoMime.split(';')[0];
      const blob = new Blob(chunks, { type });
      const ext = type === 'video/mp4' ? 'mp4' : 'webm';
      const file = new File([blob], `${fileBase}.${ext}`, { type });
      setLastVideo(file);
      setRecording(null);
      download(blob, file.name);
    };
    startRef.current = performance.now(); // record exactly one loop from the start
    rec.start(250);
    setRecording(0);
    const t0 = performance.now();
    const iv = setInterval(() => {
      const p = (performance.now() - t0) / LOOP_MS;
      if (p >= 1) { clearInterval(iv); rec.stop(); } else setRecording(p);
    }, 100);
  };

  const share = async () => {
    try {
      const file = lastVideo || new File([await renderStill()], `${fileBase}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My FittNation workout', text: 'Trained at FittNation 💪 @fittnation.gym' });
      } else {
        download(file, file.name);
        setNote('Sharing isn’t supported in this browser, so the file was downloaded instead.');
      }
    } catch { /* user cancelled */ }
  };

  const bgDisabled = template === 'original';
  const segWorking = !!photo && removeBg && !bgDisabled && !cutout && segState !== 'failed';
  const busy = camera || recording !== null;

  return (
    <div className="ss">
      <div className="ss-grid">
        {/* Preview */}
        <div className="ss-preview">
          <div className="ss-phone">
            {camera ? (
              <>
                <video ref={videoRef} className="ss-video" playsInline muted />
                <div className="ss-cam-bar">
                  <button className="ss-cam-cancel" onClick={stopCamera}>Cancel</button>
                  <button className="ss-shutter" onClick={capture} aria-label="Take photo"><span /></button>
                  <span className="ss-cam-spacer" />
                </div>
              </>
            ) : (
              <>
                <canvas ref={canvasRef} width={W} height={H} className="ss-canvas" aria-label="Share card preview" />
                {!photo && (
                  <div className="ss-empty">
                    <div className="ss-empty-icon">
                      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
                    </div>
                    <p>Add your photo to start</p>
                  </div>
                )}
                {segWorking && (
                  <div className="ss-working"><span className="ss-spinner" />Cutting you out…</div>
                )}
                {recording !== null && (
                  <div className="ss-rec"><span className="ss-rec-dot" />REC {Math.round(recording * 5)}s / 5s
                    <div className="ss-rec-bar"><span style={{ width: `${recording * 100}%` }} /></div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="ss-controls">
          <div className="ss-step">
            <span className="ss-step-num">1</span>
            <div className="ss-step-body">
              <h3>Your photo</h3>
              <div className="ss-btn-row">
                <button className="btn-primary" onClick={startCamera} disabled={camera}>Take selfie</button>
                <button className="btn-outline" onClick={() => fileRef.current?.click()}>Upload photo</button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
              </div>
              <label className={`ss-switch ${bgDisabled ? 'disabled' : ''}`}>
                <input type="checkbox" checked={removeBg && !bgDisabled} disabled={bgDisabled} onChange={(e) => setRemoveBg(e.target.checked)} />
                <span className="ss-switch-track"><span /></span>
                Remove background &amp; add animation
              </label>
              <p className="ss-privacy">🔒 Your photo is processed on this device and is never uploaded.</p>
            </div>
          </div>

          <div className="ss-step">
            <span className="ss-step-num">2</span>
            <div className="ss-step-body">
              <h3>Style</h3>
              <div className="ss-templates">
                {TEMPLATES.map((t) => (
                  <button key={t.id} className={`ss-tpl ${template === t.id ? 'active' : ''}`} onClick={() => setTemplate(t.id)}>
                    <span className="ss-tpl-swatch" style={{ background: t.swatch }} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="ss-step">
            <span className="ss-step-num">3</span>
            <div className="ss-step-body">
              <h3>Your day</h3>
              <div className="ss-fields">
                <label className="ss-field">
                  <span>Name (optional)</span>
                  <input className="ss-input-sm" value={name} maxLength={24} placeholder="e.g. Dhruv" onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="ss-field">
                  <span>Date</span>
                  <input className="ss-input-sm" type="date" value={day} onChange={(e) => setDay(e.target.value)} disabled={!showDate} />
                </label>
              </div>
              <label className="ss-switch">
                <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} />
                <span className="ss-switch-track"><span /></span>
                Show date on card
              </label>
              <label className="ss-field">
                <span>Headline</span>
                <input className="ss-input" value={headline} maxLength={18} placeholder="LEG DAY" onChange={(e) => setHeadline(e.target.value.toUpperCase())} />
              </label>
              <div className="ss-chips">
                {HEADLINES.map((h) => (
                  <button key={h} className={`ss-chip ${headline === h ? 'active' : ''}`} onClick={() => setHeadline(h)}>{h}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="ss-step">
            <span className="ss-step-num">4</span>
            <div className="ss-step-body">
              <div className="ss-step-head">
                <h3>PR highlight</h3>
                <label className="ss-switch">
                  <input type="checkbox" checked={prOn} onChange={(e) => setPrOn(e.target.checked)} />
                  <span className="ss-switch-track"><span /></span>
                  {prOn ? 'On' : 'Off'}
                </label>
              </div>
              {prOn && (
                <div className="ss-fields">
                  <label className="ss-field">
                    <span>Exercise</span>
                    <input className="ss-input-sm" list="ss-pr-list" value={prExercise} maxLength={24} placeholder="Bench Press" onChange={(e) => setPrExercise(e.target.value)} />
                    <datalist id="ss-pr-list">
                      {PR_EXERCISES.map((x) => <option key={x} value={x} />)}
                    </datalist>
                  </label>
                  <label className="ss-field">
                    <span>Weight / time</span>
                    <input className="ss-input-sm" value={prValue} maxLength={12} placeholder="100 KG" onChange={(e) => setPrValue(e.target.value.toUpperCase())} />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="ss-step">
            <span className="ss-step-num">5</span>
            <div className="ss-step-body">
              <div className="ss-step-head">
                <h3>Stats</h3>
                <span className="ss-count">{stats.length}/{MAX_STATS}</span>
              </div>
              {stats.map((s, i) => (
                <div key={i} className="ss-stat-row">
                  <input className="ss-input-sm" value={s.label} maxLength={14} placeholder="Label" aria-label={`Stat ${i + 1} label`} onChange={(e) => updateStat(i, 'label', e.target.value)} />
                  <input className="ss-input-sm" value={s.value} maxLength={10} placeholder="Value" aria-label={`Stat ${i + 1} value`} onChange={(e) => updateStat(i, 'value', e.target.value.toUpperCase())} />
                  <button className="ss-remove" onClick={() => removeStat(i)} aria-label={`Remove stat ${i + 1}`}>✕</button>
                </div>
              ))}
              {stats.length < MAX_STATS && (
                <div className="ss-chips">
                  {STAT_PRESETS.filter((p) => !stats.some((s) => s.label === p)).map((p) => (
                    <button key={p} className="ss-chip" onClick={() => addStat(p)}>+ {p}</button>
                  ))}
                  <button className="ss-chip" onClick={() => addStat('')}>+ Custom</button>
                </div>
              )}
            </div>
          </div>

          <div className="ss-step">
            <span className="ss-step-num">6</span>
            <div className="ss-step-body">
              <h3>Share it</h3>
              <div className="ss-btn-row">
                <button className="btn-outline" onClick={savePhoto} disabled={busy}>Save photo</button>
                {videoMime && (
                  <button className="btn-outline" onClick={saveVideo} disabled={busy}>
                    {recording !== null ? 'Recording…' : 'Save 5s video'}
                  </button>
                )}
                {canShareFiles && (
                  <button className="btn-primary" onClick={share} disabled={busy}>
                    Share{lastVideo ? ' video' : ''}
                  </button>
                )}
              </div>
              <p className="ss-hint">Tip: post the video to your Instagram story and tag <strong>@fittnation.gym</strong>.</p>
            </div>
          </div>

          {note && <p className="ss-note">{note}</p>}
        </div>
      </div>
    </div>
  );
}

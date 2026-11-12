import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const API = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const PLANS = ['Monthly', '6 Months', 'Annual'];

function BranchSelect({ branches, value, onChange, required }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} required={required}>
      <option value="">Select branch</option>
      {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
    </select>
  );
}

function Analytics({ users, transactions, branches }) {
  const now = new Date();
  const [from, setFrom] = useState(() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    return d.toISOString().slice(0, 7);
  });
  const [to, setTo] = useState(() => now.toISOString().slice(0, 7));
  const [expiryMonths, setExpiryMonths] = useState(1);

  const filtered = useMemo(() => {
    const f = new Date(from + '-01');
    const t = new Date(to + '-01');
    t.setMonth(t.getMonth() + 1);
    return transactions.filter(tx => {
      const d = new Date(tx.date);
      return d >= f && d < t;
    });
  }, [transactions, from, to]);

  const totalRevenue  = filtered.reduce((s, tx) => s + (tx.amount || 0), 0);
  const totalMembers  = useMemo(() => {
    const f = new Date(from + '-01');
    const t = new Date(to + '-01');
    t.setMonth(t.getMonth() + 1);
    return users.filter(u => { const d = new Date(u.startDate || u.createdAt); return d >= f && d < t; }).length;
  }, [users, from, to]);

  const activeMembers  = users.filter(u => new Date() <= new Date(u.expiryDate)).length;
  const expiredMembers = users.length - activeMembers;

  const monthlyData = useMemo(() => {
    const map = {};
    filtered.forEach(tx => {
      const key = new Date(tx.date).toISOString().slice(0, 7);
      if (!map[key]) map[key] = { revenue: 0, count: 0 };
      map[key].revenue += tx.amount || 0;
      map[key].count   += 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const branchData = useMemo(() => {
    return branches.map(b => ({
      label:   b.name,
      revenue: filtered.filter(tx => (tx.branch?._id || tx.branch) === b._id).reduce((s, tx) => s + (tx.amount || 0), 0),
      count:   filtered.filter(tx => (tx.branch?._id || tx.branch) === b._id).length,
    }));
  }, [filtered, branches]);

  const planData = useMemo(() => {
    return PLANS.map(p => ({
      plan:    p,
      revenue: filtered.filter(tx => tx.plan === p).reduce((s, tx) => s + (tx.amount || 0), 0),
      count:   filtered.filter(tx => tx.plan === p).length,
    }));
  }, [filtered]);

  const expiringUsers = useMemo(() => {
    const from = new Date();
    const to   = new Date();
    to.setMonth(to.getMonth() + expiryMonths);
    return users
      .filter(u => {
        const exp = new Date(u.expiryDate);
        return exp >= from && exp <= to;
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [users, expiryMonths]);

  const maxMonthRev  = Math.max(...monthlyData.map(([, v]) => v.revenue), 1);
  const maxBranchRev = Math.max(...branchData.map(b => b.revenue), 1);
  const maxPlanRev   = Math.max(...planData.map(p => p.revenue), 1);

  return (
    <section className="admin-section">
      <h2>Analytics</h2>

      <div className="analytics-range">
        <div className="form-group">
          <label>From</label>
          <input type="month" value={from} max={to} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="form-group">
          <label>To</label>
          <input type="month" value={to} min={from} max={now.toISOString().slice(0,7)} onChange={e => setTo(e.target.value)} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="analytics-cards">
        <div className="analytics-card">
          <span className="ac-label">Total Revenue</span>
          <span className="ac-value">₹{totalRevenue.toLocaleString('en-IN')}</span>
        </div>
        <div className="analytics-card">
          <span className="ac-label">New Members</span>
          <span className="ac-value">{totalMembers}</span>
        </div>
        <div className="analytics-card">
          <span className="ac-label">Active Members</span>
          <span className="ac-value ac-green">{activeMembers}</span>
        </div>
        <div className="analytics-card">
          <span className="ac-label">Expired Members</span>
          <span className="ac-value ac-red">{expiredMembers}</span>
        </div>
      </div>

      {/* Charts row 1: monthly + branch */}
      <div className="analytics-charts">
        <div className="analytics-chart-box">
          <h3>Monthly Revenue</h3>
          {monthlyData.length === 0 ? (
            <p className="analytics-empty">No data for selected range.</p>
          ) : (
            <div className="bar-chart">
              {monthlyData.map(([month, val]) => (
                <div key={month} className="bar-group">
                  <div className="bar-wrap">
                    <span className="bar-val">₹{val.revenue.toLocaleString('en-IN')}</span>
                    <div className="bar" style={{ height: `${(val.revenue / maxMonthRev) * 160}px` }} />
                  </div>
                  <span className="bar-label">{month.slice(0,7)}</span>
                  <span className="bar-sub">{val.count}p</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="analytics-chart-box">
          <h3>Branch Revenue</h3>
          <div className="branch-bars">
            {branchData.map(b => (
              <div key={b.label} className="branch-bar-row">
                <span className="branch-bar-label">{b.label}</span>
                <div className="branch-bar-track">
                  <div className="branch-bar-fill" style={{ width: `${(b.revenue / maxBranchRev) * 100}%` }} />
                </div>
                <span className="branch-bar-val">₹{b.revenue.toLocaleString('en-IN')} <em>({b.count})</em></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2: plan + active/expired */}
      <div className="analytics-charts" style={{ marginTop: '1.5rem' }}>
        <div className="analytics-chart-box">
          <h3>Plan-wise Revenue</h3>
          <div className="branch-bars">
            {planData.map(p => (
              <div key={p.plan} className="branch-bar-row">
                <span className="branch-bar-label">{p.plan}</span>
                <div className="branch-bar-track">
                  <div className="branch-bar-fill" style={{ width: `${(p.revenue / maxPlanRev) * 100}%` }} />
                </div>
                <span className="branch-bar-val">₹{p.revenue.toLocaleString('en-IN')} <em>({p.count})</em></span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-chart-box">
          <h3>Active vs Expired</h3>
          <div className="av-wrap">
            <div className="av-bar-row">
              <span className="av-label av-active">Active</span>
              <div className="av-track">
                <div className="av-fill av-fill-active" style={{ width: users.length ? `${(activeMembers / users.length) * 100}%` : '0%' }} />
              </div>
              <span className="av-count">{activeMembers}</span>
            </div>
            <div className="av-bar-row">
              <span className="av-label av-expired">Expired</span>
              <div className="av-track">
                <div className="av-fill av-fill-expired" style={{ width: users.length ? `${(expiredMembers / users.length) * 100}%` : '0%' }} />
              </div>
              <span className="av-count">{expiredMembers}</span>
            </div>
            <p className="av-total">Total: {users.length} members</p>
          </div>
        </div>
      </div>

      {/* Expiring soon */}
      <div className="analytics-chart-box" style={{ marginTop: '1.5rem' }}>
        <div className="expiry-header">
          <h3>Memberships Expiring Soon</h3>
          <div className="expiry-range">
            <label>Within</label>
            <select value={expiryMonths} onChange={e => setExpiryMonths(Number(e.target.value))}>
              {[1,2,3,6].map(m => <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        </div>
        {expiringUsers.length === 0 ? (
          <p className="analytics-empty">No memberships expiring in this period.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Plan</th>
                  <th>Branch</th>
                  <th>Expires On</th>
                  <th>Days Left</th>
                </tr>
              </thead>
              <tbody>
                {expiringUsers.map(u => {
                  const daysLeft = Math.ceil((new Date(u.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={u._id} className={daysLeft <= 7 ? 'expired-row' : ''}>
                      <td>{u.name}</td>
                      <td>{u.phone}</td>
                      <td>{u.plan}</td>
                      <td>{u.branch?.name || '—'}</td>
                      <td>{new Date(u.expiryDate).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span className={`status-badge ${daysLeft <= 7 ? 'expired' : 'active'}`}>
                          {daysLeft}d
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function BranchManagement() {
  const [branches, setBranches]           = useState([]);
  const [selected, setSelected]           = useState(null);
  const [form, setForm]                   = useState(null);
  const [facilityInput, setFacilityInput] = useState('');
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);

  useEffect(() => {
    fetch(`${API}/admin/branches`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setBranches(data); if (data.length) selectBranch(data[0]); });
  }, []);

  const selectBranch = (b) => {
    setSelected(b.slug);
    setForm({ ...b, facilities: [...(b.facilities || [])] });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`${API}/admin/branches/${selected}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    const updated = await res.json();
    setBranches(bs => bs.map(b => b.slug === selected ? updated : b));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addFacility = () => {
    const f = facilityInput.trim();
    if (!f || form.facilities.includes(f)) return;
    setForm({ ...form, facilities: [...form.facilities, f] });
    setFacilityInput('');
  };

  const removeFacility = (f) => setForm({ ...form, facilities: form.facilities.filter(x => x !== f) });

  if (!form) return <section className="admin-section"><h2>Branch Management</h2><p className="admin-loading-text">Loading…</p></section>;

  return (
    <section className="admin-section">
      <h2>Branch Management</h2>

      <div className="bm-tabs">
        {branches.map(b => (
          <button key={b.slug} className={`bm-tab ${selected === b.slug ? 'active' : ''}`} onClick={() => selectBranch(b)}>
            {b.name}
          </button>
        ))}
      </div>

      <div className="bm-form">
        <div className="bm-row">
          <div className="form-group">
            <label>Branch Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Tag (e.g. Main Branch)</label>
            <input value={form.tag || ''} placeholder="Optional" onChange={e => setForm({ ...form, tag: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="bm-row">
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Hours</label>
            <input value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Google Maps Embed URL</label>
          <input value={form.mapUrl} onChange={e => setForm({ ...form, mapUrl: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Google Maps Link</label>
          <input value={form.mapLink} onChange={e => setForm({ ...form, mapLink: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Facilities</label>
          <div className="bm-facilities">
            {form.facilities.map(f => (
              <span key={f} className="bm-facility-tag">
                {f} <button onClick={() => removeFacility(f)}>×</button>
              </span>
            ))}
          </div>
          <div className="bm-facility-add">
            <input
              placeholder="Add facility…"
              value={facilityInput}
              onChange={e => setFacilityInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFacility())}
            />
            <button className="btn-outline" onClick={addFacility}>Add</button>
          </div>
        </div>

        <div className="bm-actions">
          {saved && <span className="bm-saved">✓ Saved successfully</span>}
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </section>
  );
}

const TABS = ['Members', 'Analytics', 'Branches', 'Exercises', 'Roles'];
const PERM_KEYS = ['members', 'analytics', 'branches'];
const PERM_LABELS = { members: 'Members', analytics: 'Analytics', branches: 'Branches' };

function ExerciseManagement() {
  const [muscleMap, setMuscleMap]       = useState({});
  const [strengthGroups, setStrengthGroups] = useState([]);
  const [cardioGroups, setCardioGroups]     = useState([]);
  const [exType, setExType]             = useState('strength'); // 'strength' | 'cardio'
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newExercise, setNewExercise]   = useState('');
  const [status, setStatus]             = useState(null);

  useEffect(() => { fetchMuscleMap(); }, []);

  const fetchMuscleMap = async () => {
    const res  = await fetch(`${API}/api/muscle-exercises`, { credentials: 'include' });
    const json = await res.json();
    const map  = json.data || {};
    const sg   = json.strengthGroups || [];
    const cg   = json.cardioGroups   || [];
    setMuscleMap(map);
    setStrengthGroups(sg);
    setCardioGroups(cg);
    if (!selectedGroup) setSelectedGroup(sg[0] || '');
  };

  // When switching type, auto-select first group of that type
  const switchType = (type) => {
    setExType(type);
    setSelectedGroup(type === 'strength' ? (strengthGroups[0] || '') : (cardioGroups[0] || ''));
    setNewExercise('');
    setStatus(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newExercise.trim();
    if (!name || !selectedGroup) return;
    if ((muscleMap[selectedGroup] || []).map(n => n.toLowerCase()).includes(name.toLowerCase())) {
      setStatus({ type: 'error', msg: 'Exercise already exists in this group' });
      return;
    }
    const res  = await fetch(`${API}/api/muscle-exercises/${encodeURIComponent(selectedGroup)}/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (json.success) {
      setMuscleMap(prev => ({ ...prev, [selectedGroup]: json.data.exercises }));
      setNewExercise('');
      setStatus({ type: 'success', msg: `"${name}" added to ${selectedGroup}` });
      setTimeout(() => setStatus(null), 3000);
    } else {
      setStatus({ type: 'error', msg: json.message });
    }
  };

  const handleRemove = async (group, exercise) => {
    if (!confirm(`Remove "${exercise}" from ${group}?`)) return;
    const res  = await fetch(`${API}/api/muscle-exercises/${encodeURIComponent(group)}/exercises`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: exercise }),
    });
    const json = await res.json();
    if (json.success) setMuscleMap(prev => ({ ...prev, [group]: json.data.exercises }));
  };

  const activeGroups = exType === 'strength' ? strengthGroups : cardioGroups;

  return (
    <section className="admin-section">
      <h2>Exercise Management</h2>

      {/* Strength / Cardio toggle */}
      <div className="bm-tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`bm-tab${exType === 'strength' ? ' active' : ''}`} onClick={() => switchType('strength')}>Strength Training</button>
        <button className={`bm-tab${exType === 'cardio' ? ' active' : ''}`} onClick={() => switchType('cardio')}>Cardio</button>
      </div>

      <div className="em-layout">
        {/* Sidebar */}
        <div className="em-sidebar">
          {activeGroups.map(g => (
            <button
              key={g}
              className={`em-muscle-btn${selectedGroup === g ? ' active' : ''}`}
              onClick={() => { setSelectedGroup(g); setNewExercise(''); setStatus(null); }}
            >
              <span>{g}</span>
              <span className="em-count">{(muscleMap[g] || []).length}</span>
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="em-panel">
          {selectedGroup && (
            <>
              <div className="em-panel-header">
                <span className="em-panel-title">{selectedGroup}</span>
                <span className="admin-count">{(muscleMap[selectedGroup] || []).length} exercises</span>
              </div>

              <form className="em-add-form" onSubmit={handleAdd}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Add Exercise</label>
                  <input
                    type="text"
                    placeholder={exType === 'cardio' ? 'e.g. Cycling (Indoor)' : 'e.g. Cable Fly'}
                    value={newExercise}
                    onChange={e => setNewExercise(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end' }}>Add</button>
              </form>

              {status && (
                <p className={`form-msg ${status.type}`}>{status.type === 'success' ? '✓' : '✗'} {status.msg}</p>
              )}

              <div className="em-exercise-list">
                {(muscleMap[selectedGroup] || []).length === 0 ? (
                  <p className="admin-loading-text">No exercises yet. Add one above.</p>
                ) : (
                  (muscleMap[selectedGroup] || []).map((ex, idx) => (
                    <div key={ex} className="em-exercise-row">
                      <span className="em-exercise-num">{idx + 1}</span>
                      <span className="em-exercise-name">{ex}</span>
                      <button className="del-btn" onClick={() => handleRemove(selectedGroup, ex)}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function RoleManagement() {
  const [adminUsers, setAdminUsers] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', permissions: { members: [], analytics: [], branches: [] } });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchAdminUsers();
    fetch(`${API}/admin/branches`, { credentials: 'include' }).then(r => r.json()).then(setAllBranches);
  }, []);

  const fetchAdminUsers = async () => {
    const res = await fetch(`${API}/admin/roles`, { credentials: 'include' });
    setAdminUsers(await res.json());
  };

  const toggleBranch = (permsObj, perm, branchId) => {
    const cur = permsObj[perm] || [];
    return { ...permsObj, [perm]: cur.includes(branchId) ? cur.filter(id => id !== branchId) : [...cur, branchId] };
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const res = await fetch(`${API}/admin/roles`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('success');
      setForm({ name: '', email: '', phone: '', permissions: { members: [], analytics: [], branches: [] } });
      fetchAdminUsers();
      setTimeout(() => setStatus(null), 3000);
    } else { setStatus(data.error || 'error'); }
  };

  const updatePermissions = async (id, permissions) => {
    await fetch(`${API}/admin/roles/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ permissions }),
    });
    fetchAdminUsers();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this admin user?')) return;
    await fetch(`${API}/admin/roles/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchAdminUsers();
  };

  return (
    <section className="admin-section">
      <h2>Role Management</h2>

      <form className="admin-form" onSubmit={handleCreate}>
        <div className="admin-form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Jane Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email (Google account)</label>
            <input type="email" placeholder="admin@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating…' : 'Create Admin'}
          </button>
        </div>
        <div className="role-branch-grid">
          {PERM_KEYS.map(perm => (
            <div key={perm} className="role-branch-col">
              <span className="role-perms-label">{PERM_LABELS[perm]}</span>
              {allBranches.map(b => (
                <label key={b._id} className="role-perm-check">
                  <input type="checkbox"
                    checked={form.permissions[perm].includes(b._id)}
                    onChange={() => setForm({ ...form, permissions: toggleBranch(form.permissions, perm, b._id) })}
                  />
                  {b.name}
                </label>
              ))}
            </div>
          ))}
        </div>
        {status === 'success' && <p className="form-msg success">✓ Admin user created.</p>}
        {status && status !== 'loading' && status !== 'success' && <p className="form-msg error">✗ {status}</p>}
      </form>

      <div style={{ marginTop: '2rem' }}>
        {adminUsers.map(au => (
          <div key={au._id} className="role-user-card">
            <div className="role-user-header">
              <div>
                <strong>{au.name}</strong>
                <span className="role-user-email">{au.email}</span>
                {au.phone && <span className="role-user-email">{au.phone}</span>}
              </div>
              <button className="del-btn" onClick={() => handleDelete(au._id)}>Remove</button>
            </div>
            <div className="role-branch-grid">
              {PERM_KEYS.map(perm => (
                <div key={perm} className="role-branch-col">
                  <span className="role-perms-label">{PERM_LABELS[perm]}</span>
                  {allBranches.map(b => {
                    const allowed = (au.permissions?.[perm] || []).map(id => id._id || id).map(String);
                    const checked = allowed.includes(String(b._id));
                    return (
                      <label key={b._id} className="role-perm-check">
                        <input type="checkbox" checked={checked} onChange={() => {
                          const cur = (au.permissions?.[perm] || []).map(id => id._id?.toString() || id.toString());
                          const updated = checked ? cur.filter(id => id !== String(b._id)) : [...cur, String(b._id)];
                          updatePermissions(au._id, { ...au.permissions, [perm]: updated });
                        }} />
                        {b.name}
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
        {adminUsers.length === 0 && <p className="admin-loading-text">No admin users yet.</p>}
      </div>
    </section>
  );
}

export default function Admin() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Members');

  const [users, setUsers]               = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [branches, setBranches]         = useState([]);
  const [form, setForm]                 = useState({ name: '', email: '', phone: '', plan: 'Monthly', branch: '', amountPaid: '' });
  const [status, setStatus]             = useState(null);
  const [fetching, setFetching]         = useState(true);
  const [search, setSearch]             = useState('');
  const [sort, setSort]                 = useState({ key: 'createdAt', dir: 'desc' });
  const [renewModal, setRenewModal]     = useState(null);
  const [renewForm, setRenewForm]       = useState({ plan: 'Monthly', branch: '', amountPaid: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) navigate('/login');
  }, [user, loading, navigate]);

  const canAccess = (perm) => user?.isSuperAdmin || (Array.isArray(user?.permissions?.[perm]) && user.permissions[perm].length > 0);
  const visibleTabs = TABS.filter(t => {
    if (t === 'Members')   return canAccess('members');
    if (t === 'Analytics') return canAccess('analytics');
    if (t === 'Branches')  return canAccess('branches');
    if (t === 'Exercises') return user?.isSuperAdmin;
    if (t === 'Roles')     return user?.isSuperAdmin;
    return false;
  });

  useEffect(() => {
    if (visibleTabs.length && !visibleTabs.includes(tab)) setTab(visibleTabs[0]);
  }, [visibleTabs.join()]);

  useEffect(() => {
    if (user?.isAdmin) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setFetching(true);
    const [uRes, tRes, bRes] = await Promise.all([
      fetch(`${API}/admin/users`, { credentials: 'include' }),
      fetch(`${API}/admin/transactions`, { credentials: 'include' }),
      fetch(`${API}/admin/branches`, { credentials: 'include' }),
    ]);
    const [u, t, b] = await Promise.all([uRes.json(), tRes.json(), bRes.json()]);
    setUsers(u);
    setTransactions(t);
    setBranches(b);
    if (b.length) setForm(f => ({ ...f, branch: b[0]._id }));
    setFetching(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const res = await fetch(`${API}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('success');
      setForm({ name: '', email: '', phone: '', plan: 'Monthly', branch: branches[0]?._id || '', amountPaid: '' });
      fetchAll();
      setTimeout(() => setStatus(null), 3000);
    } else {
      setStatus(data.error || 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`${API}/admin/users/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchAll();
  };

  const handleRenewSubmit = async () => {
    if (!renewForm.amountPaid) return;
    await fetch(`${API}/admin/users/${renewModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ plan: renewForm.plan, branch: renewForm.branch, amountPaid: Number(renewForm.amountPaid) }),
    });
    setRenewModal(null);
    setRenewForm({ plan: 'Monthly', branch: branches[0]?._id || '', amountPaid: '' });
    fetchAll();
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    let list = q ? users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    ) : [...users];

    list.sort((a, b) => {
      let av = sort.key === 'branch' ? (a.branch?.name || '') : a[sort.key];
      let bv = sort.key === 'branch' ? (b.branch?.name || '') : b[sort.key];
      if (sort.key === 'expiryDate' || sort.key === 'createdAt') { av = new Date(av); bv = new Date(bv); }
      else { av = (av || '').toString().toLowerCase(); bv = (bv || '').toString().toLowerCase(); }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, search, sort]);

  const toggleSort = (key) => setSort(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  const sortIcon   = (key) => sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ' ⇅';
  const isExpired  = (date) => new Date() > new Date(date);

  if (loading) return <div className="admin-loading">Loading…</div>;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <img src="/fittnation logo.jpg" alt="FittNation" className="admin-logo" />
          <span className="admin-title">FITT<span>NATION</span> <em>Admin</em></span>
        </div>
        <div className="admin-header-right">
          <span className="admin-user">{user?.name}</span>
          <button className="btn-outline" onClick={() => navigate('/')}>View Site</button>
          <button className="btn-outline" onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
        <button
          className={`admin-hamburger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </header>

      <nav className={`admin-tabs ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {visibleTabs.map(t => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setMobileMenuOpen(false); }}>{t}</button>
        ))}
      </nav>

      <main className="admin-main">
        {tab === 'Members' && (
          <section className="admin-section">
            <h2>Create Member</h2>
            <form className="admin-form" onSubmit={handleCreate}>
              <div className="admin-form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="member@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Plan</label>
                  <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>
                    {PLANS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Branch</label>
                  <BranchSelect branches={branches} value={form.branch} onChange={v => setForm({ ...form, branch: v })} required />
                </div>
                <div className="form-group">
                  <label>Amount Received (₹)</label>
                  <input type="number" placeholder="0" value={form.amountPaid} onChange={e => setForm({ ...form, amountPaid: e.target.value })} required />
                </div>
                <button type="submit" className="btn-primary" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Creating…' : 'Create Member'}
                </button>
              </div>
              {status === 'success' && <p className="form-msg success">✓ Member created successfully.</p>}
              {status && status !== 'loading' && status !== 'success' && <p className="form-msg error">✗ {status}</p>}
            </form>
          </section>
        )}

        {tab === 'Analytics' && <Analytics users={users} transactions={transactions} branches={branches} />}

        {tab === 'Members' && (
          <section className="admin-section">
            <h2>All Members <span className="admin-count">{users.length}</span></h2>
            <input className="search-input" type="text" placeholder="Search by name, email or phone…" value={search} onChange={e => setSearch(e.target.value)} />
            {fetching ? (
              <p className="admin-loading-text">Loading members…</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort('name')} className="sortable">Name{sortIcon('name')}</th>
                      <th onClick={() => toggleSort('phone')} className="sortable">Phone{sortIcon('phone')}</th>
                      <th onClick={() => toggleSort('email')} className="sortable">Email{sortIcon('email')}</th>
                      <th onClick={() => toggleSort('plan')} className="sortable">Plan{sortIcon('plan')}</th>
                      <th onClick={() => toggleSort('branch')} className="sortable">Branch{sortIcon('branch')}</th>
                      <th onClick={() => toggleSort('expiryDate')} className="sortable">Expiry{sortIcon('expiryDate')}</th>
                      <th onClick={() => toggleSort('expiryDate')} className="sortable">Status{sortIcon('expiryDate')}</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className={isExpired(u.expiryDate) ? 'expired-row' : ''}>
                        <td>{u.name}</td>
                        <td>{u.phone}</td>
                        <td>{u.email}</td>
                        <td>
                          {isExpired(u.expiryDate) ? (
                            <select
                              value={renewModal?.id === u._id ? renewForm.plan : u.plan}
                              onChange={e => { setRenewModal({ id: u._id, name: u.name }); setRenewForm({ plan: e.target.value, branch: u.branch?._id || '', amountPaid: '' }); }}
                              className="plan-select"
                            >
                              {PLANS.map(p => <option key={p}>{p}</option>)}
                            </select>
                          ) : (
                            <span className="plan-locked">{u.plan}</span>
                          )}
                        </td>
                        <td>{u.branch?.name || '—'}</td>
                        <td>{new Date(u.expiryDate).toLocaleDateString('en-IN')}</td>
                        <td>
                          <span className={`status-badge ${isExpired(u.expiryDate) ? 'expired' : 'active'}`}>
                            {isExpired(u.expiryDate) ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td>
                          {isExpired(u.expiryDate) && (
                            <button className="renew-btn" onClick={() => { setRenewModal({ id: u._id, name: u.name }); setRenewForm({ plan: u.plan, branch: u.branch?._id || '', amountPaid: '' }); }}>Renew</button>
                          )}
                          <button className="del-btn" onClick={() => handleDelete(u._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={9} className="empty-row">No members yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === 'Branches' && <BranchManagement />}
        {tab === 'Exercises' && <ExerciseManagement />}
        {tab === 'Roles'    && <RoleManagement />}
      </main>

      {renewModal && (
        <div className="modal-overlay" onClick={() => setRenewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Renew — {renewModal.name}</h3>
            <div className="form-group">
              <label>Plan</label>
              <select value={renewForm.plan} onChange={e => setRenewForm({ ...renewForm, plan: e.target.value })}>
                {PLANS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Branch</label>
              <BranchSelect branches={branches} value={renewForm.branch} onChange={v => setRenewForm({ ...renewForm, branch: v })} />
            </div>
            <div className="form-group">
              <label>Amount Received (₹)</label>
              <input type="number" placeholder="0" value={renewForm.amountPaid} onChange={e => setRenewForm({ ...renewForm, amountPaid: e.target.value })} autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setRenewModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleRenewSubmit} disabled={!renewForm.amountPaid}>Confirm Renewal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { isSupabaseConfigured, supabase } from './supabaseClient.js';

const TRIAGE_RULES = [
  {
    priority: 'CRITICAL',
    basePoints: 100,
    keywords: ['fire', 'smoke', 'explosion', 'medical', 'injury', 'blood', 'unconscious', 'heart', 'breathing', 'collapsed', 'accident', 'fight', 'weapon', 'gun', 'knife', 'assault', 'emergency']
  },
  {
    priority: 'HIGH',
    basePoints: 75,
    keywords: ['stolen', 'theft', 'steal', 'robbed', 'laptop', 'phone', 'wallet', 'broken in', 'intruder', 'suspicious', 'stalking', 'harassment', 'trespass', 'vandalism', 'fight', 'assault']
  },
  {
    priority: 'MEDIUM',
    basePoints: 50,
    keywords: ['leak', 'flood', 'burst pipe', 'broken', 'lockout', 'power out', 'blackout', 'elevator', 'stuck', 'wi-fi down', 'sparking', 'heat missing', 'hazard', 'maintenance']
  },
  {
    priority: 'LOW',
    basePoints: 25,
    keywords: ['lost item', 'complaint', 'feedback', 'noise', 'parking', 'litter', 'clean', 'lightbulb', 'registration', 'card missing']
  }
];
const HIGH_THREAT_WORDS = TRIAGE_RULES[0].keywords;
const UTILITY_WORDS = TRIAGE_RULES[2].keywords;
const WELLBEING_WORDS = ['anxious', 'panic', 'distressed', 'unsafe', 'harassment', 'threatened', 'wellbeing', 'well-being'];
const SECURITY_WORDS = ['theft', 'stolen', 'intruder', 'suspicious', 'door', 'access', 'fight'];
const FACILITIES_WORDS = ['light', 'toilet', 'water', 'maintenance', 'repair', 'temperature'];
const STATUS_VALUES = ['OPEN', 'ASSIGNED', 'RESPONDING', 'RESOLVED'];
const SESSION_HISTORY_KEY = 'campuscare-session-incidents';

const state = {
  view: 'student',
  session: null,
  authMode: 'signin',
  incidents: [],
  responders: [],
  sessionIncidentIds: new Set(JSON.parse(sessionStorage.getItem(SESSION_HISTORY_KEY) || '[]')),
  pendingIncidentIds: new Set(),
  realtimeChannels: []
};

const elements = {
  connectionStatus: document.getElementById('connectionStatus'),
  syncChip: document.getElementById('syncChip'),
  viewCrumb: document.getElementById('viewCrumb'),
  todayLabel: document.getElementById('todayLabel'),
  heroTitle: document.getElementById('heroTitle'),
  heroDescription: document.getElementById('heroDescription'),
  studentViewBtn: document.getElementById('studentViewBtn'),
  dispatcherViewBtn: document.getElementById('dispatcherViewBtn'),
  studentView: document.getElementById('studentView'),
  dispatcherView: document.getElementById('dispatcherView'),
  summaryGrid: document.getElementById('summaryGrid'),
  incidentsList: document.getElementById('incidentsList'),
  responderList: document.getElementById('responderList'),
  historyList: document.getElementById('historyList'),
  historyCount: document.getElementById('historyCount'),
  incidentCountBadge: document.getElementById('incidentCountBadge'),
  responderCount: document.getElementById('responderCount'),
  availableCoverageText: document.getElementById('availableCoverageText'),
  threatMetrics: document.getElementById('threatMetrics'),
  incidentForm: document.getElementById('incidentForm'),
  reportIncidentBtn: document.getElementById('reportIncidentBtn'),
  profileBtn: document.getElementById('profileBtn'),
  authStatus: document.getElementById('authStatus'),
  authModal: document.getElementById('authModal'),
  authForm: document.getElementById('authForm'),
  authEmail: document.getElementById('authEmail'),
  authPassword: document.getElementById('authPassword'),
  authModeBtn: document.getElementById('authModeBtn'),
  authSubmitBtn: document.getElementById('authSubmitBtn'),
  authTitle: document.getElementById('authTitle'),
  authDescription: document.getElementById('authDescription'),
  authCloseBtn: document.getElementById('authCloseBtn'),
  refreshBtn: document.getElementById('refreshBtn'),
  toast: document.getElementById('toast')
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.className = `toast visible${isError ? ' error' : ''}`;
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => { elements.toast.className = 'toast'; }, 4500);
}

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function evaluateTriage({ type = '', description = '', location = '' }) {
  const text = normalizeText(`${type} ${description} ${location}`);
  const matchedRules = TRIAGE_RULES.map((rule) => ({
    ...rule,
    matches: rule.keywords.filter((keyword) => text.includes(keyword))
  })).filter((rule) => rule.matches.length > 0);
  const strongestRule = matchedRules[0];

  if (!strongestRule) {
    return {
      threat_points: 20,
      priority: 'LOW',
      priority_reason: 'Routed to Standard Campus Security Review Queue',
      matched_keywords: []
    };
  }

  const matchedKeywords = [...new Set(matchedRules.flatMap((rule) => rule.matches))];
  const multiKeywordBonus = matchedKeywords.length > 1 ? 25 : 0;
  const threat_points = Math.min(150, strongestRule.basePoints + multiKeywordBonus);
  const priority = threat_points >= 100 ? 'CRITICAL' : threat_points >= 70 ? 'HIGH' : threat_points >= 45 ? 'MEDIUM' : 'LOW';

  return {
    threat_points,
    priority,
    priority_reason: `${priority} triage: matched ${matchedKeywords.join(', ')}${multiKeywordBonus ? ' with multi-signal escalation bonus.' : '.'}`,
    matched_keywords: matchedKeywords
  };
}

function calculateThreatScore(incident) {
  return evaluateTriage(incident).threat_points;
}

function classifyIncident({ description, location }) {
  const text = normalizeText(`${description} ${location}`);
  if (HIGH_THREAT_WORDS.some((word) => text.includes(word)) || SECURITY_WORDS.some((word) => text.includes(word))) return 'Security';
  if (WELLBEING_WORDS.some((word) => text.includes(word))) return 'Wellbeing';
  if (FACILITIES_WORDS.some((word) => text.includes(word)) || UTILITY_WORDS.some((word) => text.includes(word))) return 'Facilities';
  return 'General safety';
}

function extractIncidentType(description) {
  const match = String(description || '').match(/^\[([^\]]+)\]\s*/);
  return match ? match[1] : 'Incident';
}

function getThreatLevel(score) {
  if (score >= 100) return 'HIGH THREAT';
  if (score >= 50) return 'UTILITY RISK';
  return 'ROUTINE';
}

function normalizeIncident(incident) {
  const triage = evaluateTriage(incident);
  const normalized = {
    ...incident,
    type: incident.type || incident.incident_type || extractIncidentType(incident.description),
    reportedAt: incident.created_at || incident.reported_at,
    assignedResponderId: incident.assigned_responder_id || incident.responder_id || null,
    reporterId: incident.reporter_id || null,
    status: incident.status || 'OPEN',
    threat_points: Number.isFinite(Number(incident.threat_points)) ? Number(incident.threat_points) : triage.threat_points,
    priority_reason: incident.priority_reason || triage.priority_reason,
    matched_keywords: incident.matched_keywords || triage.matched_keywords
  };
  if (Number.isFinite(Number(incident.threat_score)) && !Number.isFinite(Number(incident.threat_points))) {
    normalized.threat_points = Number(incident.threat_score);
  }
  normalized.threatScore = normalized.threat_points;
  return normalized;
}

function normalizeResponder(responder) {
  const capabilities = normalizeText(`${responder.name || ''} ${responder.role || ''} ${responder.type || ''}`);
  return {
    ...responder,
    isBusy: Boolean(responder.is_busy ?? (responder.availability === 'BUSY' || responder.status === 'BUSY')),
    availability: responder.is_busy ? 'BUSY' : String(responder.availability || responder.status || 'AVAILABLE').toUpperCase(),
    capabilities
  };
}

function formatRelativeTime(value) {
  if (!value) return 'Just now';
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  return minutes < 60 ? `${minutes} min ago` : `${Math.round(minutes / 60)} hr ago`;
}

function persistSessionHistory() {
  sessionStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify([...state.sessionIncidentIds]));
}

function trackOwnIncident(incident) {
  if (state.session?.user?.id && String(incident.reporterId) === String(state.session.user.id)) {
    state.sessionIncidentIds.add(String(incident.id));
    persistSessionHistory();
  }
}

async function loadOwnHistory() {
  if (!state.session?.user?.id) return;
  try {
    const { data, error } = await supabase.from('incidents').select('*').eq('reporter_id', state.session.user.id).order('created_at', { ascending: false });
    if (error) throw error;
    (data || []).forEach((incident) => {
      const normalized = normalizeIncident(incident);
      trackOwnIncident(normalized);
      mergeRealtimeRow(state.incidents, normalized, false);
    });
    render();
  } catch (error) {
    console.warn('Persistent personal history is unavailable until reporter_id is added:', error.message);
  }
}

async function insertIncidentWithSchemaFallback(report) {
  const fullResponse = await supabase.from('incidents').insert(report).select('*').limit(1);
  if (!fullResponse.error) return fullResponse;

  const missingTriageColumn = /reporter_id|threat_score|threat_points|priority_reason|schema cache/i.test(fullResponse.error.message || '');
  if (!missingTriageColumn) return fullResponse;

  console.warn('Retrying report with legacy incidents schema:', fullResponse.error.message);
  const legacyReport = {
    type: report.type,
    location: report.location,
    description: report.description,
    status: report.status
  };
  return supabase.from('incidents').insert(legacyReport).select('*').limit(1);
}

function updateConnection(status, isError = false) {
  elements.connectionStatus.textContent = status;
  elements.syncChip.textContent = isError ? 'Sync issue' : status;
  elements.syncChip.classList.toggle('error-chip', isError);
}

function isAuthenticated() {
  return Boolean(state.session?.user);
}

function updateAuthUi() {
  const user = state.session?.user;
  elements.authStatus.textContent = user ? user.email : 'Signed out';
  elements.profileBtn.textContent = user ? String(user.email || 'U')[0].toUpperCase() : 'SD';
  elements.profileBtn.setAttribute('aria-label', user ? 'Open account menu' : 'Sign in');
}

function openAuthModal() {
  elements.authModal.classList.remove('hidden');
  elements.authModal.setAttribute('aria-hidden', 'false');
  elements.authEmail.focus();
}

function closeAuthModal() {
  elements.authModal.classList.add('hidden');
  elements.authModal.setAttribute('aria-hidden', 'true');
  elements.authForm.reset();
}

function setAuthMode(mode) {
  state.authMode = mode;
  const signIn = mode === 'signin';
  elements.authTitle.textContent = signIn ? 'Sign in to CampusCare' : 'Create a CampusCare account';
  elements.authDescription.textContent = signIn ? 'Use your campus email to submit reports and operate the dispatch console.' : 'Create an account to keep your session secure across devices.';
  elements.authSubmitBtn.textContent = signIn ? 'Sign in' : 'Create account';
  elements.authModeBtn.textContent = signIn ? 'Create account' : 'Back to sign in';
}

async function requireAuth() {
  if (isAuthenticated()) return true;
  showToast('Sign in before using this action.', true);
  openAuthModal();
  return false;
}

async function loadAuthSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    state.session = data.session;
    updateAuthUi();
    if (state.session) loadOwnHistory();
    supabase.auth.onAuthStateChange((_event, session) => {
      state.session = session;
      updateAuthUi();
      if (session) {
        closeAuthModal();
        showToast(`Signed in as ${session.user.email}.`);
        loadLiveData();
        loadOwnHistory();
      }
    });
  } catch (error) {
    console.error('Unable to restore auth session:', error);
    showToast(`Authentication unavailable: ${error.message}`, true);
  }
}

async function submitAuth(event) {
  event.preventDefault();
  try {
    const email = elements.authEmail.value.trim();
    const password = elements.authPassword.value;
    const response = state.authMode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (response.error) throw response.error;
    if (state.authMode === 'signup' && !response.data.session) {
      showToast('Account created. Check your email to confirm it.');
      closeAuthModal();
      return;
    }
    showToast(state.authMode === 'signin' ? 'Signed in.' : 'Account created and signed in.');
    closeAuthModal();
  } catch (error) {
    console.error('Authentication request failed:', error);
    showToast(`Authentication failed: ${error.message}`, true);
  }
}

async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    state.session = null;
    updateAuthUi();
    showToast('Signed out.');
  } catch (error) {
    console.error('Sign out failed:', error);
    showToast(`Sign out failed: ${error.message}`, true);
  }
}

async function loadLiveData() {
  try {
    if (!isSupabaseConfigured) throw new Error('Supabase configuration is missing.');
    const [incidentsResponse, respondersResponse] = await Promise.all([
      supabase.from('incidents').select('*').order('created_at', { ascending: false }),
      supabase.from('responders').select('*').order('name', { ascending: true })
    ]);
    if (incidentsResponse.error) throw incidentsResponse.error;
    if (respondersResponse.error) throw respondersResponse.error;
    state.incidents = (incidentsResponse.data || []).map(normalizeIncident);
    state.responders = (respondersResponse.data || []).map(normalizeResponder);
    updateConnection('Live and synced');
    render();
  } catch (error) {
    console.error('Unable to load live CampusCare data:', error);
    updateConnection('Offline mode', true);
    showToast(`Live data unavailable: ${error.message}`, true);
    render();
  }
}

function mergeRealtimeRow(collection, incoming, isDelete) {
  const id = incoming.id;
  const index = collection.findIndex((item) => item.id === id);
  if (isDelete) {
    if (index >= 0) collection.splice(index, 1);
    return;
  }
  if (index < 0) collection.push(incoming);
  else collection[index] = { ...collection[index], ...incoming };
}

function subscribeToLiveData() {
  if (!isSupabaseConfigured) return;
  try {
    const incidentChannel = supabase.channel('campuscare-incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
        try {
          const row = normalizeIncident(payload.new || payload.old);
          if (!row.id) return;
          trackOwnIncident(row);
          mergeRealtimeRow(state.incidents, row, payload.eventType === 'DELETE');
          state.pendingIncidentIds.delete(row.id);
          updateConnection('Live and synced');
          render();
        } catch (error) {
          console.error('Incident Realtime update failed:', error);
          showToast('A live incident update could not be rendered.', true);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') updateConnection('Live and synced');
        if (['CHANNEL_ERROR', 'TIMED_OUT'].includes(status)) updateConnection('Sync issue', true);
      });

    const responderChannel = supabase.channel('campuscare-responders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'responders' }, (payload) => {
        try {
          const row = normalizeResponder(payload.new || payload.old);
          if (!row.id) return;
          mergeRealtimeRow(state.responders, row, payload.eventType === 'DELETE');
          updateConnection('Live and synced');
          render();
        } catch (error) {
          console.error('Responder Realtime update failed:', error);
          showToast('A live responder update could not be rendered.', true);
        }
      })
      .subscribe((status) => {
        if (['CHANNEL_ERROR', 'TIMED_OUT'].includes(status)) updateConnection('Sync issue', true);
      });

    state.realtimeChannels = [incidentChannel, responderChannel];
  } catch (error) {
    console.error('Unable to subscribe to Realtime:', error);
    updateConnection('Sync issue', true);
    showToast(`Realtime unavailable: ${error.message}`, true);
  }
}

function setView(view) {
  try {
    state.view = view;
    const student = view === 'student';
    elements.studentView.classList.toggle('hidden', !student);
    elements.dispatcherView.classList.toggle('hidden', student);
    elements.studentViewBtn.classList.toggle('active', student);
    elements.dispatcherViewBtn.classList.toggle('active', !student);
    elements.studentViewBtn.setAttribute('aria-selected', String(student));
    elements.dispatcherViewBtn.setAttribute('aria-selected', String(!student));
    elements.viewCrumb.textContent = student ? 'Student portal' : 'Dispatcher console';
    elements.heroTitle.textContent = student ? 'Report a campus concern' : 'Dispatcher command center';
    elements.heroDescription.textContent = student ? 'Send a report to the safety desk and keep track of its progress.' : 'Monitor the global queue, threat scores, and live response coverage.';
    elements.reportIncidentBtn.classList.toggle('hidden', !student);
    elements.summaryGrid.classList.toggle('hidden', student);
    render();
  } catch (error) {
    console.error('View switch failed:', error);
    showToast('The selected view could not be opened.', true);
  }
}

function renderSummary() {
  const active = state.incidents.filter((incident) => incident.status !== 'RESOLVED');
  const highThreat = active.filter((incident) => incident.threatScore >= 100).length;
  const busy = state.responders.filter((responder) => responder.isBusy).length;
  const available = state.responders.filter((responder) => !responder.isBusy).length;
  const resolved = state.incidents.filter((incident) => incident.status === 'RESOLVED').length;
  const cards = [
    ['Threat alerts', highThreat, '100+ priority incidents', '!'],
    ['Active response', busy, 'units currently busy', '~'],
    ['Available team', available, 'responders ready now', '+'],
    ['Resolved', resolved, 'incidents closed', 'v']
  ];
  elements.summaryGrid.innerHTML = cards.map(([label, value, description, icon]) => `<article class="summary-card"><div class="summary-header"><span>${icon}</span><span>${label}</span></div><strong>${value}</strong><small>${description}</small></article>`).join('');
  elements.incidentCountBadge.textContent = String(active.length);
  elements.responderCount.textContent = `${state.responders.length} members`;
  elements.availableCoverageText.textContent = `${available} responders available`;
}

function renderHistory() {
  const history = state.incidents.filter((incident) => state.sessionIncidentIds.has(String(incident.id))).sort((a, b) => new Date(b.reportedAt || 0) - new Date(a.reportedAt || 0));
  elements.historyCount.textContent = String(history.length);
  elements.historyList.innerHTML = history.map((incident) => `<article class="timeline-item"><span class="timeline-marker"></span><div><strong>${escapeHtml(incident.type)} · ${escapeHtml(incident.location)}</strong><p>${escapeHtml(incident.status)} · ${formatRelativeTime(incident.reportedAt)}</p><small>${escapeHtml(incident.description)}</small><button type="button" class="delete-btn" data-delete-id="${escapeHtml(incident.id)}">Delete report</button></div></article>`).join('') || '<p class="empty-state">Your submitted reports will appear here.</p>';
}

function renderResponders() {
  elements.responderList.innerHTML = state.responders.map((responder) => {
    const initials = escapeHtml(responder.name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
    return `<article class="responder-row"><div class="avatar">${initials}</div><div class="responder-meta"><div><span class="responder-name">${escapeHtml(responder.name)}</span><span class="responder-role">${escapeHtml(responder.role || responder.type || 'Responder')}</span></div><span class="responder-state ${responder.isBusy ? 'busy' : 'available'}">${responder.isBusy ? 'Busy' : 'Available'}</span></div></article>`;
  }).join('') || '<p class="empty-state">No responders found.</p>';
}

function responderForIncident(incident) {
  const text = normalizeText(`${incident.type || ''} ${incident.description || ''}`);
  const available = state.responders.filter((responder) => !responder.isBusy);
  const ranked = available.map((responder) => {
    let score = 0;
    const capabilities = responder.capabilities || '';
    if (incident.type === 'Security' && /security|officer|access|safety/.test(capabilities)) score += 100;
    if (incident.type === 'Facilities' && /facilit|maintenance|utility|engineering/.test(capabilities)) score += 100;
    if (incident.type === 'Fire' && /fire|emergency|safety/.test(capabilities)) score += 100;
    if (incident.type === 'Medical' && /medical|medic|nurse|health|first response/.test(capabilities)) score += 100;
    if (incident.type === 'Wellbeing' && /wellbeing|counsel|mental|support/.test(capabilities)) score += 100;
    if (/fire|weapon|injury|medical|blood|unconscious/.test(text) && /fire|security|medical|emergency|safety/.test(capabilities)) score += 30;
    return { responder, score };
  }).sort((a, b) => b.score - a.score);
  return ranked[0]?.responder || null;
}

function renderIncidents() {
  const incidents = [...state.incidents].sort((a, b) => (b.threat_points || 0) - (a.threat_points || 0) || (new Date(b.reportedAt || 0) - new Date(a.reportedAt || 0)));
  elements.incidentsList.innerHTML = incidents.map((incident) => {
    const assigned = state.responders.find((responder) => String(responder.id) === String(incident.assignedResponderId));
    const level = incident.priority || getThreatLevel(incident.threat_points);
    const points = incident.threat_points || 0;
    const priorityClass = level === 'CRITICAL' ? 'priority-critical' : level === 'HIGH' ? 'priority-high' : level === 'MEDIUM' ? 'priority-medium' : 'priority-low';
    const candidate = responderForIncident(incident);
    const disabled = !candidate || incident.status === 'RESOLVED';
    return `<article class="incident-card"><div class="incident-top"><span class="priority-label ${priorityClass}">${escapeHtml(level)}</span><strong class="threat-score">${points} pts</strong></div><div class="incident-type-wrap"><span class="incident-type-icon">${escapeHtml((incident.type || 'I')[0])}</span><span>${escapeHtml(incident.type || 'Incident')}</span></div><div class="incident-title"><strong>${escapeHtml(incident.location)}</strong><span class="incident-time">${formatRelativeTime(incident.reportedAt)}</span></div><p class="incident-description">${escapeHtml(incident.description)}</p><p class="priority-reason">${escapeHtml(incident.priority_reason)}</p><div class="incident-footer"><span class="badge-inline">${escapeHtml(incident.status)}</span><span class="badge-inline">${escapeHtml(assigned?.name || 'Unassigned')}</span></div><div class="lifecycle-actions" role="group" aria-label="Incident lifecycle"><span class="action-label">Set status</span>${STATUS_VALUES.map((status) => `<button type="button" class="status-btn ${incident.status === status ? 'selected' : ''}" data-status-id="${escapeHtml(incident.id)}" data-status-value="${status}" ${incident.status === status ? 'disabled' : ''}>${status}</button>`).join('')}</div><button type="button" class="assign-btn full-width" data-assign-id="${escapeHtml(incident.id)}" ${disabled ? 'disabled' : ''}>${candidate ? `Assign ${escapeHtml(candidate.name)}` : 'No available unit'}</button></article>`;
  }).join('') || '<p class="empty-state">No incidents have been reported.</p>';
}

function renderThreatMetrics() {
  const active = state.incidents.filter((incident) => incident.status !== 'RESOLVED');
  const critical = active.filter((incident) => (incident.threat_points || 0) >= 100).length;
  const high = active.filter((incident) => (incident.threat_points || 0) >= 70 && (incident.threat_points || 0) < 100).length;
  const medium = active.filter((incident) => (incident.threat_points || 0) >= 45 && (incident.threat_points || 0) < 70).length;
  const low = active.filter((incident) => (incident.threat_points || 0) < 45).length;
  elements.threatMetrics.innerHTML = [['100+', critical, 'critical'], ['70-99', high, 'high'], ['45-69', medium, 'medium'], ['<45', low, 'low']].map(([score, count, label]) => `<div><strong>${count}</strong><span>${score} pts · ${label}</span></div>`).join('');
}

function render() {
  try {
    renderSummary();
    renderHistory();
    renderIncidents();
    renderResponders();
    renderThreatMetrics();
  } catch (error) {
    console.error('Dashboard render failed:', error);
    showToast('The dashboard could not render the latest data.', true);
  }
}

async function submitIncident(event) {
  event.preventDefault();
  try {
    if (!(await requireAuth())) return;
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const data = new FormData(elements.incidentForm);
    const location = String(data.get('location') || '').trim();
    const description = String(data.get('description') || '').trim();
    const type = classifyIncident({ location, description });
    const triage = evaluateTriage({ type, location, description });
    const report = { type, location, description, reporter_id: state.session.user.id, threat_points: triage.threat_points, priority_reason: triage.priority_reason, status: 'OPEN' };
    if (!location || !description) throw new Error('Location and description are required.');
    const provisional = normalizeIncident({ ...report, id: `pending-${Date.now()}`, created_at: new Date().toISOString() });
    state.pendingIncidentIds.add(provisional.id);
    showToast(`Autonomous triage: ${triage.priority} · ${triage.threat_points} points. Submitting...`);
    const { data: createdRows, error } = await insertIncidentWithSchemaFallback(report);
    if (error) throw error;
    const createdIncident = createdRows?.[0];
    if (createdIncident?.id) {
      state.sessionIncidentIds.add(String(createdIncident.id));
      persistSessionHistory();
      state.incidents = state.incidents.filter((incident) => String(incident.id) !== String(createdIncident.id));
      state.incidents.push(normalizeIncident(createdIncident));
      render();
    }
    elements.incidentForm.reset();
    showToast('Report submitted to the live board.');
  } catch (error) {
    console.error('Incident submission failed:', error);
    showToast(`Report failed: ${error.message}`, true);
  }
}

async function deleteIncident(incidentId) {
  try {
    if (!(await requireAuth())) return;
    const incident = state.incidents.find((item) => String(item.id) === String(incidentId));
    const isKnownOwnReport = state.sessionIncidentIds.has(String(incidentId)) || String(incident?.reporterId) === String(state.session.user.id);
    if (!incident || !isKnownOwnReport) throw new Error('You can only delete your own reports.');
    const { error } = await supabase.from('incidents').delete().eq('id', incidentId);
    if (error) throw error;
    state.incidents = state.incidents.filter((item) => String(item.id) !== String(incidentId));
    state.sessionIncidentIds.delete(String(incidentId));
    persistSessionHistory();
    render();
    showToast('Report deleted.');
  } catch (error) {
    console.error('Report deletion failed:', error);
    showToast(`Delete failed: ${error.message}`, true);
  }
}

async function assignIncident(incidentId) {
  try {
    if (!(await requireAuth())) return;
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const incident = state.incidents.find((item) => String(item.id) === String(incidentId));
    const responder = incident && responderForIncident(incident);
    if (!incident || !responder) throw new Error('That responder is no longer available.');

    const { data: lockedRows, error: lockError } = await supabase.from('responders').update({ is_busy: true }).eq('id', responder.id).eq('is_busy', false).select('id');
    if (lockError) throw lockError;
    if (!lockedRows?.length) throw new Error('Another dispatcher assigned this responder first.');

    const { error: incidentError } = await supabase.from('incidents').update({ assigned_responder_id: responder.id, status: 'ASSIGNED' }).eq('id', incidentId).neq('status', 'RESOLVED');
    if (incidentError) {
      await supabase.from('responders').update({ is_busy: false }).eq('id', responder.id);
      throw incidentError;
    }
    showToast(`${responder.name} assigned safely.`);
  } catch (error) {
    console.error('Assignment failed:', error);
    showToast(`Assignment failed: ${error.message}`, true);
    await loadLiveData();
  }
}

async function updateIncidentStatus(incidentId, status) {
  try {
    if (!(await requireAuth())) return;
    if (!STATUS_VALUES.includes(status)) throw new Error('Unsupported incident status.');
    const { error } = await supabase.from('incidents').update({ status }).eq('id', incidentId);
    if (error) throw error;
    showToast(`Incident moved to ${status}.`);
  } catch (error) {
    console.error('Status update failed:', error);
    showToast(`Status update failed: ${error.message}`, true);
    await loadLiveData();
  }
}

async function refreshQueue() {
  try {
    await loadLiveData();
    showToast('Queue refreshed from Supabase.');
  } catch (error) {
    console.error('Queue refresh failed:', error);
    showToast('Queue refresh failed.', true);
  }
}

function bindEvents() {
  elements.studentViewBtn.addEventListener('click', () => { try { setView('student'); } catch (error) { console.error(error); } });
  elements.dispatcherViewBtn.addEventListener('click', () => { try { setView('dispatcher'); } catch (error) { console.error(error); } });
  elements.reportIncidentBtn.addEventListener('click', () => { try { setView('student'); elements.incidentForm.scrollIntoView({ behavior: 'smooth', block: 'center' }); elements.incidentLocation.focus(); } catch (error) { console.error(error); showToast('Could not open the report form.', true); } });
  elements.profileBtn.addEventListener('click', () => { try { if (isAuthenticated()) { signOut(); } else { setAuthMode('signin'); openAuthModal(); } } catch (error) { console.error(error); showToast('Could not open account controls.', true); } });
  elements.authCloseBtn.addEventListener('click', () => { try { closeAuthModal(); } catch (error) { console.error(error); } });
  elements.authModal.addEventListener('click', (event) => { try { if (event.target.matches('[data-auth-close="true"]')) closeAuthModal(); } catch (error) { console.error(error); } });
  elements.authModeBtn.addEventListener('click', () => { try { setAuthMode(state.authMode === 'signin' ? 'signup' : 'signin'); } catch (error) { console.error(error); } });
  elements.authForm.addEventListener('submit', (event) => { try { submitAuth(event); } catch (error) { console.error(error); showToast('Could not process authentication.', true); } });
  elements.refreshBtn.addEventListener('click', () => { try { refreshQueue(); } catch (error) { console.error(error); } });
  elements.incidentForm.addEventListener('submit', (event) => { try { submitIncident(event); } catch (error) { console.error(error); showToast('Could not submit the report.', true); } });
  document.addEventListener('click', (event) => {
    try {
      const statusButton = event.target.closest('[data-status-id]');
      if (statusButton && !statusButton.disabled) updateIncidentStatus(statusButton.dataset.statusId, statusButton.dataset.statusValue);
      const assignButton = event.target.closest('[data-assign-id]');
      if (assignButton && !assignButton.disabled) assignIncident(assignButton.dataset.assignId);
      const deleteButton = event.target.closest('[data-delete-id]');
      if (deleteButton) deleteIncident(deleteButton.dataset.deleteId);
    } catch (error) {
      console.error('Action handler failed:', error);
      showToast('That action could not be completed.', true);
    }
  });
}

function initialize() {
  elements.todayLabel.textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
  bindEvents();
  updateAuthUi();
  loadAuthSession();
  setView('student');
  render();
  loadLiveData();
  subscribeToLiveData();
}

initialize();

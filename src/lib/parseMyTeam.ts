// parseMyTeam.ts - Robust CSV parser for team data
export function parseMyTeamCSV(text: string) {
  const lines = text.replace(/\r/g, '').trim().split('\n');
  if (!lines.length) return [];
  const rawHeaders = lines[0].split(',').map(h => h.trim());
  const headers = rawHeaders.map(h => h.toLowerCase());
  const idx = (name: string) => headers.indexOf(name.toLowerCase());
  const get = (values: string[], name: string) => { const i = idx(name); return i >= 0 ? values[i] : ''; };
  const n = (values: string[], name: string, alts: string[] = []) => {
    const v = get(values, name); if (v !== '') return parseFloat(v) || 0;
    for (const a of alts) { const z = get(values, a); if (z !== '') return parseFloat(z) || 0; }
    return 0;
  };

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const firstName = get(values, 'firstname') || get(values, 'first_name') || '';
    const lastName  = get(values, 'lastname')  || get(values, 'last_name')  || '';
    const name = (get(values, 'name') || get(values, 'player') || get(values, 'displayname') || `${firstName} ${lastName}`).trim();
    const rawNum = get(values, 'number') || get(values, 'jersey') || get(values, 'shirt') || get(values, 'kit') || get(values, 'id') || '';
    const number = rawNum === '' ? 0 : (parseInt(rawNum, 10) || 0);
    const pfRaw = get(values, 'preferredfoot') || get(values, 'foot') || '';
    const pf = (() => {
      const s = String(pfRaw).trim().toLowerCase();
      if (!s) return ''; if (s.startsWith('r')) return 'R'; if (s.startsWith('l')) return 'L'; if (s.startsWith('b')) return 'B'; return '';
    })();
    const pos = (get(values, 'position') || get(values, 'slot') || '').toUpperCase();

    return {
      id: get(values, 'id') || '',
      firstName, lastName, name, number, preferredFoot: pf, height: n(values, 'height'), position: pos,
      quality: n(values, 'quality', ['qualityscore','overall']),
      speed: n(values, 'speed'), stamina: n(values, 'stamina'), strength: n(values, 'strength'),
      balance: n(values, 'balance'), agility: n(values, 'agility'), jumping: n(values, 'jumping'),
      heading: n(values, 'heading'), aerial: n(values, 'aerial'), passing: n(values, 'passing'),
      vision: n(values, 'vision'), firstTouch: n(values, 'firsttouch'), finishing: n(values, 'finishing'),
      tackling: n(values, 'tackling'), positioning: n(values, 'positioning'),
      pressResistance: n(values, 'pressresistance'), offBall: n(values, 'offball'),
    };
  });
}
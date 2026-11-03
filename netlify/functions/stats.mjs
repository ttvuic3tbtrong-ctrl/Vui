import { getStore, connectLambda } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';


const CATS = [
  'Chế giễu, xúc phạm',
  'Bắt nạt lặp lại',
  'Cô lập, tẩy chay',
  'Tung tin sai sự thật',
  'Xâm phạm hình ảnh và đời tư',
  'Đe dọa, uy hiếp',
  'Bạo lực thể chất',
  'Ép buộc, khống chế',
  'Quấy rối, xâm phạm ranh giới',
  'Mâu thuẫn và trả đũa',
  'Tình cảm học đường',
  'Tiền bạc, cờ bạc và vay nợ',
  'Lừa đảo và an toàn tài khoản',
  'Khó khăn học tập và tâm lý'
];

// Chỉ dùng để bảo toàn số liệu lịch sử.
const LEGACY_CATS = [
  'Chế giễu/xúc phạm',
  'Ảnh & đời tư',
  'Cô lập/tung tin',
  'Đe dọa',
  'Mâu thuẫn',
  'Tiền bạc/nợ',
  'Cờ bạc trực tuyến',
  'Vay trực tuyến',
  'Lừa đảo trực tuyến',
  'Khác'
];

const response = (statusCode, data) => ({
  statusCode,
  headers: {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'},
  body: JSON.stringify(data)
});

export async function handler(event) {
  try {
    connectLambda(event);
    const store = getStore({ name: 'co-giao-ai-stats', consistency: 'eventual' });
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!['visit','consult'].includes(body.type)) return response(400,{error:'Sự kiện không hợp lệ'});
      if ((event.body || '').length > 2000) return response(413,{error:'Dữ liệu quá lớn'});
      
const cats = body.type === 'consult' &&
  Array.isArray(body.categories)
  ? [...new Set(
      body.categories.filter(
        c => typeof c === 'string' && CATS.includes(c)
      )
    )].slice(0, 14)
  : [];

      // Each event is stored separately: no read-modify-write counter race.
      const date = new Date().toISOString();
      await store.setJSON(`events/${date.slice(0,10)}/${randomUUID()}`, {type:body.type, cats, date});
      return response(200,{ok:true});
    }
    if (event.httpMethod !== 'GET') return response(405,{error:'Phương thức không hỗ trợ'});
   
const totals = {
  visits: 0,
  aiUses: 0,
  cats: Object.fromEntries(CATS.map(c => [c, 0])),
  legacyCats: {},
  byDay: {}
};

    let cursor;
    do {
      const page = await store.list({prefix:'events/', ...(cursor ? {cursor} : {})});
      for (const blob of page.blobs) {
        const row = await store.get(blob.key,{type:'json'});
        if (!row || !['visit','consult'].includes(row.type)) continue;
        const day = typeof row.date === 'string' ? row.date.slice(0,10) : 'unknown';
        if (!totals.byDay[day]) totals.byDay[day]={visits:0,aiUses:0};
        if (row.type === 'visit') { totals.visits++; totals.byDay[day].visits++; }
        else {
          totals.aiUses++; totals.byDay[day].aiUses++;
          for (const c of new Set(Array.isArray(row.cats)?row.cats:[])) {
          
if (CATS.includes(c)) {
  totals.cats[c]++;
} else if (LEGACY_CATS.includes(c)) {
  totals.legacyCats[c] =
    (totals.legacyCats[c] || 0) + 1;
}

          }
        }
      }
      cursor = page.cursor;
    } while (cursor);
    return response(200,totals);
  } catch (err) {
    console.error('stats error',err);
    return response(500,{error:'Không thể truy cập thống kê tập trung'});
  }
}

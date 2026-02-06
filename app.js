// Angel｜Happy Being Myself — Organizer v1
const STORAGE_KEY = 'hbm_organizer_v1';
const CONFIG = {
  cardPwaUrl: '',      // ← 預留：名片PWA網址（未填就不顯示）
  feedbackUrl: '',     // ← 預留：Google表單網址（未填就不顯示）
  quoteEnabled: true
};

const DEFAULT_QUOTES = [
  '慢一點，也是在前進。',
  '把心放回身上，就不會那麼飄。',
  '今天先把自己放好，就很夠了。',
  '不必美化想法，這裡是你的私密空間。',
  '能看見，就是力量。'
];

const state = load() || {
  step: 1,
  quotes: DEFAULT_QUOTES.slice(),
  quoteEnabled: true,
  quoteIndex: 0,
  card1: {
    worries: [],
    worriesOther: '',
    share: [],
    shareOther: '',
    direction: [],
    directionOther: '',
    notes: ''
  },
  card2: {
    focus: [],
    focusOther: '',
    notes: ''
  },
  card3: {
    gifts: [],
    giftsOther: '',
    notes: ''
  },
  card4: {
    dir: '',
    dirOther: '',
    notes: ''
  },
  outputs: {
    nicknameOptions: '',
    summaryState: '',
    summaryFocus: '',
    summaryGifts: '',
    summaryDir: '',
    oneLineMe: '',
    altLine: ''
  },
  contact: {
    email: '',
    links: ''
  }
};

const $ = (sel, el=document)=>el.querySelector(sel);
const $$ = (sel, el=document)=>Array.from(el.querySelectorAll(sel));

function load(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)); }catch(e){ return null; }
}
function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 1600);
}

function pickQuote(){
  if(!state.quoteEnabled || !state.quotes.length) return;
  const idx = Math.floor(Math.random() * state.quotes.length);
  state.quoteIndex = idx;
  $('#quoteText').textContent = `「${state.quotes[idx]}」`;
  save();
}

function renderNav(){
  $$('.stepbtn').forEach(btn=>{
    const n = Number(btn.dataset.step);
    btn.setAttribute('aria-current', n===state.step ? 'true' : 'false');
  });
  $$('.stepPanel').forEach(p=>{
    p.hidden = (Number(p.dataset.step) !== state.step);
  });
}

function setStep(n){
  state.step = n;
  save();
  renderNav();
  window.scrollTo({top:0, behavior:'smooth'});
}

function bindNav(){
  $$('.stepbtn').forEach(btn=>{
    btn.addEventListener('click', ()=> setStep(Number(btn.dataset.step)));
  });
}

function renderChecks(containerId, items, selected, otherId){
  const box = $(containerId);
  box.innerHTML = '';
  items.forEach(label=>{
    const wrap = document.createElement('label');
    wrap.className = 'chk';
    wrap.innerHTML = `<input type="checkbox" value="${escapeHtml(label)}"><div><div class="break-safe">${escapeHtml(label)}</div></div>`;
    const inp = $('input', wrap);
    inp.checked = selected.includes(label);
    inp.addEventListener('change', ()=>{
      if(inp.checked){
        if(!selected.includes(label)) selected.push(label);
      }else{
        const i = selected.indexOf(label);
        if(i>=0) selected.splice(i,1);
      }
      save();
    });
    box.appendChild(wrap);
  });
  const other = $(otherId);
  other.addEventListener('input', ()=>{ save(); });
}

function bindText(id, getterSetter){
  const el = $(id);
  el.value = getterSetter.get();
  el.addEventListener('input', ()=>{
    getterSetter.set(el.value);
    save();
  });
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ---------- AI Prompt builders ----------
function buildPromptCard1(){
  const w = state.card1.worries.concat(state.card1.worriesOther ? [`其他：${state.card1.worriesOther}`] : []);
  const sh = state.card1.share.concat(state.card1.shareOther ? [`其他：${state.card1.shareOther}`] : []);
  const dr = state.card1.direction.concat(state.card1.directionOther ? [`其他：${state.card1.directionOther}`] : []);
  return `請你根據我提供的資訊，協助我更認識「現在的自己」。\n\n` +
  `請你先幫我建議 3～5 個「適合我現在狀態的稱呼」。\n` +
  `這些稱呼不是暱稱、不是角色、不是品牌名稱，\n` +
  `而是能讓我一看到就覺得「這個有點像我現在」的稱呼。\n\n` +
  `原則：\n- 用生活語感，不浮誇\n- 不勵志、不鼓勵改變\n- 不分析人格、不下結論\n- 描述現在，而不是理想\n- 若有模糊或矛盾，請保留，不必統一\n\n` +
  `每個稱呼請附一句很短的說明。\n\n` +
  `接著請整理：\n1. 我現在大概是一個怎樣狀態的人\n2. 我最近的關注重心\n3. 我自然能帶給別人的東西\n4. 用一句話描述「現在的我」\n\n` +
  `以下是我目前對自己的整理：\n\n` +
  `在意的事：\n${w.length?('- '+w.join('\n- ')):'（尚未填寫）'}\n\n` +
  `可以分享給別人的：\n${sh.length?('- '+sh.join('\n- ')):'（尚未填寫）'}\n\n` +
  `生活重心方向：\n${dr.length?('- '+dr.join('\n- ')):'（尚未填寫）'}\n\n` +
  `補充：\n${state.card1.notes || '（無）'}\n\n` +
  `語氣：溫和、貼近生活，只做整理與照見，不給建議、不給行動方案。`;
}

function buildPromptCard2(){
  const f = state.card2.focus.concat(state.card2.focusOther ? [`其他：${state.card2.focusOther}`] : []);
  return `題目：最近，哪些事情最常佔住你的心？\n\n` +
  `我勾選/填寫的內容：\n${f.length?('- '+f.join('\n- ')):'（尚未填寫）'}\n\n` +
  `請你只根據以上內容，幫我整理「我最近真正放在心上的事情」。\n` +
  `注意：不分析原因、不評價對錯、不給建議、不引導改變。\n\n` +
  `請完成：\n1) 用一小段話描述我最近的關注重心\n2) 用一句話說出「我其實在意的是什麼」\n\n` +
  `補充：\n${state.card2.notes || '（無）'}\n\n` +
  `語氣：貼近生活，像是在幫我把心裡的話說清楚。`;
}

function buildPromptCard3(){
  const g = state.card3.gifts.concat(state.card3.giftsOther ? [`其他：${state.card3.giftsOther}`] : []);
  return `題目：如果只是做自己，你可能自然分享給別人的是什麼？\n\n` +
  `我勾選/填寫的內容：\n${g.length?('- '+g.join('\n- ')):'（尚未填寫）'}\n\n` +
  `請你只根據以上內容，幫我整理「我如實存在時，可能自然帶給別人的東西」。\n` +
  `遵守：不評價高低、不包裝成能力或定位、不給建議、不引導行動，只做描述與整理。\n\n` +
  `請完成：\n1) 一小段話，描述我自然外溢的分享\n2) 一句話：別人可能會從我這裡感受到什麼\n\n` +
  `補充：\n${state.card3.notes || '（無）'}\n\n` +
  `語氣：貼近生活、溫和、不誇大。`;
}

function buildPromptCard4(){
  const d = state.card4.dir ? [state.card4.dir] : [];
  if(state.card4.dir === '其他' && state.card4.dirOther) d[0] = `其他：${state.card4.dirOther}`;
  return `題目：整體來說，你覺得你現在的生活比較朝哪個方向走？\n\n` +
  `我選擇/填寫的內容：\n${d.length?('- '+d.join('\n- ')):'（尚未填寫）'}\n\n` +
  `請你根據以上內容，幫我整理「我目前的生活方向」。\n` +
  `注意：不幫我訂目標、不建議下一步、不鼓勵改變，只描述我現在的重心狀態。\n\n` +
  `請完成：\n1) 一小段話：描述我目前生活重心的方向\n2) 一句話：我現在大概站在哪裡\n\n` +
  `補充：\n${state.card4.notes || '（無）'}\n\n` +
  `語氣：溫和、貼近生活，不勵志、不誇大。`;
}

function buildPromptAll(){
  return `請你根據以下四張卡的內容，協助我整理「現在的自己長什麼樣子」。\n\n` +
  `注意：不分析人格、不評價好壞、不給建議/行動、不鼓勵改變，只做整理與照見；語氣貼近生活、溫和、不誇大的。\n\n` +
  `請完成：\n1) 描述我現在怎麼看待自己（整體狀態與特徵）\n2) 整理我最近的關注重心與注意力走向\n3) 說明我如實存在時，能自然分享給別人的價值\n4) 描述我目前的生活重心與方向位置\n\n` +
  `最後請寫一句「可以代表現在的我」的話，不用漂亮，只要真實。\n\n` +
  `【稱呼｜貼近自己的特徵】\n${state.outputs.nicknameOptions || '（尚未貼上AI整理結果）'}\n\n` +
  `【常關注什麼】\n${state.outputs.summaryFocus || '（尚未貼上AI整理結果）'}\n\n` +
  `【可以分享什麼｜自我價值】\n${state.outputs.summaryGifts || '（尚未貼上AI整理結果）'}\n\n` +
  `【往哪裡走｜生活方向】\n${state.outputs.summaryDir || '（尚未貼上AI整理結果）'}\n`;
}

function bundleExport(){
  return {
    version: "hbm-card-bundle-v1",
    createdAt: new Date().toISOString(),
    name: (state.outputs.nicknameOptions || '').split('\n').find(Boolean)?.replace(/^[-•\s]+/,'') || '',
    card: {
      nickname: state.outputs.nicknameOptions || '',
      oneLine: state.outputs.oneLineMe || '',
      focus: state.outputs.summaryFocus || '',
      share: state.outputs.summaryGifts || '',
      direction: state.outputs.summaryDir || ''
    },
    contact: {
      email: state.contact.email || '',
      links: (state.contact.links || '').split('\n').map(s=>s.trim()).filter(Boolean)
    },
    quote: state.quotes[state.quoteIndex] || ''
  };
}

function copyText(text){
  navigator.clipboard?.writeText(text).then(()=>toast('已複製')).catch(()=>{
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    toast('已複製');
  });
}

// ---------- UI bindings ----------
function initQuoteUI(){
  $('#quoteToggle').checked = !!state.quoteEnabled;
  $('#quoteToggle').addEventListener('change', (e)=>{
    state.quoteEnabled = e.target.checked;
    save();
    $('#quoteArea').hidden = !state.quoteEnabled;
    if(state.quoteEnabled) pickQuote();
  });
  $('#quoteArea').hidden = !state.quoteEnabled;
  $('#quoteList').value = state.quotes.join('\n');
  $('#quoteList').addEventListener('input', ()=>{
    const lines = $('#quoteList').value.split('\n').map(s=>s.trim()).filter(Boolean);
    state.quotes = lines.length ? lines : DEFAULT_QUOTES.slice();
    save();
    pickQuote();
  });
  $('#quoteNext').addEventListener('click', ()=>{
    pickQuote();
    toast('換一句');
  });

  // refresh-based rotation
  pickQuote();
}

function initStep1(){
  const worriesItems = [
    '生活節奏太快','腦袋停不下來','情緒很滿','被某段關係困擾','工作/角色壓力',
    '身體/精力','未來不確定','需要被理解','想安靜一下'
  ];
  const shareItems = [
    '安心感','陪伴與傾聽','真實經驗','看事情的角度','穩定不急的氣氛','理解與同理','把複雜說清楚'
  ];
  const dirItems = [
    '照顧自己','穩定生活','修復關係','整理內在','探索可能性','放慢腳步','暫時停著'
  ];
  renderChecks('#worriesChecks', worriesItems, state.card1.worries, '#worriesOther');
  $('#worriesOther').value = state.card1.worriesOther;
  $('#worriesOther').addEventListener('input', ()=>{ state.card1.worriesOther = $('#worriesOther').value; save(); });

  renderChecks('#shareChecks', shareItems, state.card1.share, '#shareOther');
  $('#shareOther').value = state.card1.shareOther;
  $('#shareOther').addEventListener('input', ()=>{ state.card1.shareOther = $('#shareOther').value; save(); });

  renderChecks('#dirChecks', dirItems, state.card1.direction, '#dirOther');
  $('#dirOther').value = state.card1.directionOther;
  $('#dirOther').addEventListener('input', ()=>{ state.card1.directionOther = $('#dirOther').value; save(); });

  bindText('#card1Notes', {get:()=>state.card1.notes, set:v=>state.card1.notes=v});

  $('#copyPrompt1').addEventListener('click', ()=>copyText(buildPromptCard1()));
}

function initStep2(){
  const items = [
    '自己的狀態（累不累、好不好）','某段關係（家人／伴侶／朋友）','工作或角色壓力','身體與精力',
    '未來的不確定','想不想再這樣下去','需要被理解','想安靜一下'
  ];
  renderChecks('#focusChecks', items, state.card2.focus, '#focusOther');
  $('#focusOther').value = state.card2.focusOther;
  $('#focusOther').addEventListener('input', ()=>{ state.card2.focusOther = $('#focusOther').value; save(); });
  bindText('#card2Notes', {get:()=>state.card2.notes, set:v=>state.card2.notes=v});
  $('#copyPrompt2').addEventListener('click', ()=>copyText(buildPromptCard2()));
}

function initStep3(){
  const items = [
    '安心感','陪伴與傾聽','真實經驗（走過的事）','一種看事情的角度','穩定與不急的氣氛',
    '理解與同理','提醒別人慢下來','把複雜的事說清楚'
  ];
  renderChecks('#giftsChecks', items, state.card3.gifts, '#giftsOther');
  $('#giftsOther').value = state.card3.giftsOther;
  $('#giftsOther').addEventListener('input', ()=>{ state.card3.giftsOther = $('#giftsOther').value; save(); });
  bindText('#card3Notes', {get:()=>state.card3.notes, set:v=>state.card3.notes=v});
  $('#copyPrompt3').addEventListener('click', ()=>copyText(buildPromptCard3()));
}

function initStep4(){
  const opts = ['照顧自己','穩定生活','修復關係','整理內在','探索可能性','放慢腳步','暫時停著','其他'];
  const sel = $('#dirSelect');
  sel.innerHTML = opts.map(o=>`<option value="${o}">${o}</option>`).join('');
  sel.value = state.card4.dir || '';
  sel.addEventListener('change', ()=>{
    state.card4.dir = sel.value;
    save();
    $('#dirOtherWrap').hidden = (sel.value !== '其他');
  });
  $('#dirOtherWrap').hidden = (sel.value !== '其他');
  $('#dirOther2').value = state.card4.dirOther;
  $('#dirOther2').addEventListener('input', ()=>{ state.card4.dirOther = $('#dirOther2').value; save(); });
  bindText('#card4Notes', {get:()=>state.card4.notes, set:v=>state.card4.notes=v});
  $('#copyPrompt4').addEventListener('click', ()=>copyText(buildPromptCard4()));
}

function initStep5(){
  // outputs paste-in areas (AI results)
  bindText('#outNick', {get:()=>state.outputs.nicknameOptions, set:v=>state.outputs.nicknameOptions=v});
  bindText('#outFocus', {get:()=>state.outputs.summaryFocus, set:v=>state.outputs.summaryFocus=v});
  bindText('#outGifts', {get:()=>state.outputs.summaryGifts, set:v=>state.outputs.summaryGifts=v});
  bindText('#outDir', {get:()=>state.outputs.summaryDir, set:v=>state.outputs.summaryDir=v});
  bindText('#outOneLine', {get:()=>state.outputs.oneLineMe, set:v=>state.outputs.oneLineMe=v});

  $('#copyPromptAll').addEventListener('click', ()=>copyText(buildPromptAll()));

  $('#exportBundle').addEventListener('click', ()=>{
    const b = bundleExport();
    $('#bundlePreview').textContent = JSON.stringify(b, null, 2);
    copyText(JSON.stringify(b, null, 2));
  });
}

function initStep6(){
  bindText('#email', {get:()=>state.contact.email, set:v=>state.contact.email=v});
  bindText('#links', {get:()=>state.contact.links, set:v=>state.contact.links=v});

  $('#copyAltLine').addEventListener('click', ()=>{
    const base = state.outputs.oneLineMe?.trim() || '我正在把自己放好。';
    const alternatives = [
      base,
      '我現在比較需要：先穩定，再往前。',
      '我不急著變更好，我先把自己放回來。',
      '我正在練習：用更舒服的方式生活。',
      '今天先把心站穩，就很好。'
    ];
    const pick = alternatives[Math.floor(Math.random()*alternatives.length)];
    state.outputs.altLine = pick;
    $('#altLine').value = pick;
    save();
    copyText(pick);
  });

  $('#altLine').value = state.outputs.altLine || '';

  // links to other places (optional)
  const cardLink = $('#cardLink');
  if(CONFIG.cardPwaUrl){
    cardLink.hidden = false;
    cardLink.href = CONFIG.cardPwaUrl;
    cardLink.textContent = CONFIG.cardPwaUrl;
  }else{
    cardLink.hidden = true;
  }

  const fb = $('#feedbackLink');
  if(CONFIG.feedbackUrl){
    fb.hidden = false;
    fb.href = CONFIG.feedbackUrl;
  }else{
    fb.hidden = true;
  }
}

function initInstallHelp(){
  // no logic
}

function initReset(){
  $('#resetAll').addEventListener('click', ()=>{
    if(confirm('要清空這個工具裡的所有內容嗎？（不可復原）')){
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });
}

function main(){
  bindNav();
  renderNav();
  initQuoteUI();
  initStep1();
  initStep2();
  initStep3();
  initStep4();
  initStep5();
  initStep6();
  initInstallHelp();
  initReset();

  // route by hash (#help)
  function route(){
    const h = location.hash || '#tool';
    $('#pageTool').hidden = (h !== '#tool');
    $('#pageHelp').hidden = (h !== '#help');
    $$('#navTop a').forEach(a=>a.setAttribute('aria-current', a.getAttribute('href')===h ? 'true':'false'));
    window.scrollTo({top:0});
  }
  window.addEventListener('hashchange', route);
  route();
}
main();

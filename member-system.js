/* LIFEPASS Member Command Center
 * Presentation-ready member identity layer.
 * No new database columns required: identity is derived from the authenticated
 * Supabase user id, while scores/rewards are computed from the user's passport data.
 */
(function(){
  'use strict';

  const MEMBER_PLANS = {
    free: { name:'Free', stars:1 },
    startup: { name:'Startup', stars:2 },
    regular: { name:'Regular', stars:3 },
    pro: { name:'Pro', stars:4 },
    business: { name:'Business', stars:5 }
  };

  function esc(v){
    if(typeof window.esc === 'function') return window.esc(String(v ?? ''));
    return String(v ?? '').replace(/[&<>"']/g, function(ch){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
    });
  }

  function passports(){
    return Array.isArray(window.passports) ? window.passports : [];
  }

  function activeMembership(){
    const cached = typeof window.getLifepassMembershipCache === 'function'
      ? window.getLifepassMembershipCache()
      : null;

    if(window.isLifepassFreeAccess && window.isLifepassFreeAccess()){
      return { plan_id:'founder', status:'active', passport_limit:999999 };
    }
    return cached || { plan_id:'free', status:'active', passport_limit:10 };
  }

  function planMeta(){
    const m = activeMembership();
    if(m.plan_id === 'founder') return { name:'Founder Access', stars:5, founder:true };
    return MEMBER_PLANS[m.plan_id] || { name:String(m.plan_id || 'Free'), stars:1 };
  }

  function fallbackMemberCode(seed){
    let h = 2166136261;
    for(let i=0;i<seed.length;i++){
      h ^= seed.charCodeAt(i);
      h = Math.imul(h,16777619);
    }
    const hex = (h >>> 0).toString(16).toUpperCase().padStart(8,'0');
    return 'LP-MBR-' + hex;
  }

  async function getMemberId(){
    const user = window.currentUser;
    const seed = String(user?.id || user?.email || 'lifepass-member');
    try{
      if(window.crypto?.subtle){
        const data = new TextEncoder().encode('LIFEPASS|MEMBER|' + seed);
        const digest = await crypto.subtle.digest('SHA-256', data);
        const bytes = Array.from(new Uint8Array(digest));
        const hex = bytes.map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,10).toUpperCase();
        return 'LP-MBR-' + hex;
      }
    }catch(_){}
    return fallbackMemberCode(seed);
  }

  function numberFrom(p){
    const keys = ['estimatedValue','resaleValue','currentValue','marketValue','estimatedPrice','purchasePrice','price','amount','value'];
    for(const key of keys){
      const n = Number(String(p?.[key] ?? '').replace(/[^0-9.\-]/g,''));
      if(Number.isFinite(n) && n > 0) return n;
    }
    return 0;
  }

  function completeness(p){
    const keys = ['productName','productType','brand','model','serialNumber','purchaseDate','warrantyDate','ownerName'];
    let filled = 0;
    keys.forEach(k=>{ if(String(p?.[k] ?? '').trim()) filled++; });
    return Math.round(filled / keys.length * 100);
  }

  function calculateStats(){
    const ps = passports();
    let verified=0, docs=0, services=0, transfers=0, warranty=0, value=0, completenessTotal=0;

    ps.forEach(p=>{
      if(p?.status === 'Verified') verified++;
      docs += Array.isArray(p?.documents) ? p.documents.length : 0;
      services += Array.isArray(p?.serviceHistory) ? p.serviceHistory.length : 0;
      transfers += Array.isArray(p?.transferHistory) ? p.transferHistory.length : 0;
      if(p?.warrantyDate){
        const d = new Date(p.warrantyDate);
        if(!Number.isNaN(d.getTime()) && d >= new Date()) warranty++;
      }
      value += numberFrom(p);
      completenessTotal += completeness(p);
    });

    const avgCompleteness = ps.length ? Math.round(completenessTotal / ps.length) : 0;
    const trust = Math.min(100, Math.round(
      60 +
      Math.min(16, verified * 4) +
      Math.min(12, avgCompleteness * 0.12) +
      Math.min(6, docs) +
      Math.min(6, services) +
      Math.min(4, transfers)
    ));

    const points = 100 + verified*40 + docs*10 + services*15 + transfers*25;
    const achievements = [];
    if(ps.length) achievements.push(['FIRST-PASSPORT','Passport Pioneer']);
    if(verified) achievements.push(['VERIFIED','Verified Builder']);
    if(docs >= 3) achievements.push(['VAULT','Evidence Vault']);
    if(services >= 2) achievements.push(['CARE','Lifecycle Care']);
    if(transfers) achievements.push(['TRANSFER','Ownership Ready']);
    if(ps.length >= 5) achievements.push(['COLLECTOR','Asset Collector']);
    if(trust >= 90) achievements.push(['TRUST90','Trust 90+']);

    return {count:ps.length,verified,docs,services,transfers,warranty,value,avgCompleteness,trust,points,achievements};
  }

  function stars(count, founder){
    return '<span class="lp-member-stars" aria-label="'+esc(count)+' stars">'+
      Array.from({length:5},(_,i)=>'<span class="'+(i<count?'on':'')+'">★</span>').join('')+
      (founder ? '<small> FOUNDER</small>' : '')+
      '</span>';
  }

  function money(n){
    if(!n) return '₹0';
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  function injectStyles(){
    if(document.getElementById('lpMemberCommandStyles')) return;
    const style=document.createElement('style');
    style.id='lpMemberCommandStyles';
    style.textContent=`
      .lp-member-command{margin:0 0 24px;border-radius:24px;overflow:hidden;background:linear-gradient(135deg,#071d35 0%,#102f50 58%,#079eaa 100%);color:#fff;box-shadow:0 22px 55px rgba(16,47,80,.18)}
      .lp-member-command-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;padding:26px 28px 20px;flex-wrap:wrap}
      .lp-member-kicker{font-size:10px;font-weight:900;letter-spacing:1.8px;opacity:.72}
      .lp-member-command h3{margin:5px 0 4px;font-size:28px;color:#fff}
      .lp-member-id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:15px;font-weight:900;letter-spacing:1px;color:#d9fbff}
      .lp-member-tier{margin-top:9px;display:flex;align-items:center;gap:9px;flex-wrap:wrap}
      .lp-member-stars{display:inline-flex;align-items:center;gap:2px;font-size:17px}
      .lp-member-stars span{opacity:.28}.lp-member-stars span.on{opacity:1;color:#ffd76a;text-shadow:0 0 12px rgba(255,215,106,.3)}
      .lp-member-stars small{font-size:9px;font-weight:900;letter-spacing:1px;color:#ffd76a;margin-left:5px}
      .lp-member-actions{display:flex;gap:8px;flex-wrap:wrap}
      .lp-member-actions button{border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.1);color:#fff;border-radius:11px;padding:9px 12px;font-weight:800;cursor:pointer}
      .lp-member-actions button:hover{background:rgba(255,255,255,.18)}
      .lp-member-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 28px 26px}
      .lp-member-stat{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:14px;min-height:82px}
      .lp-member-stat small{display:block;color:#b8d6df;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.8px}
      .lp-member-stat strong{display:block;color:#fff;font-size:22px;margin-top:5px}
      .lp-member-stat .sub{font-size:11px;color:#c8e1e7;margin-top:3px}
      .lp-member-bottom{display:grid;grid-template-columns:1.15fr .85fr;gap:12px;padding:0 28px 28px}
      .lp-member-panel{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:16px}
      .lp-member-panel h4{margin:0 0 10px;color:#fff;font-size:13px}
      .lp-member-progress{height:8px;border-radius:99px;background:rgba(255,255,255,.15);overflow:hidden}
      .lp-member-progress span{display:block;height:100%;background:#62e1e4;border-radius:99px}
      .lp-member-achievements{display:flex;gap:7px;flex-wrap:wrap}
      .lp-member-achievement{padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.1);font-size:10px;font-weight:900;color:#e8fbfd}
      .lp-member-qr{display:grid;grid-template-columns:90px 1fr;gap:12px;align-items:center}
      .lp-member-qrbox{width:90px;height:90px;background:#fff;border-radius:12px;display:grid;place-items:center;padding:6px;box-sizing:border-box}
      .lp-member-qrbox img{width:100%;height:100%;object-fit:contain}
      .lp-member-note{font-size:10px;color:#b8d6df;line-height:1.45;margin-top:8px}
      .lp-membership-hero h2{display:block!important;color:#fff!important;visibility:visible!important;opacity:1!important}
      .lp-membership-hero p{display:block!important;color:#d8edf1!important;visibility:visible!important;opacity:1!important}
      .lp-plan-button{pointer-events:auto!important;position:relative!important;z-index:5!important;cursor:pointer!important;visibility:visible!important;opacity:1!important}
      @media(max-width:900px){.lp-member-grid{grid-template-columns:1fr 1fr}.lp-member-bottom{grid-template-columns:1fr}}
      @media(max-width:600px){.lp-member-command-head{padding:22px 18px 16px}.lp-member-grid{padding:0 18px 18px;grid-template-columns:1fr 1fr}.lp-member-bottom{padding:0 18px 18px}.lp-member-stat strong{font-size:18px}}
    `;
    document.head.appendChild(style);
  }

  function render(memberId){
    const page=document.getElementById('page-membership');
    const wrap=page?.querySelector('.lp-membership-wrap');
    if(!wrap || !window.currentUser) return;

    injectStyles();
    let card=document.getElementById('lpMemberCommand');
    if(!card){
      card=document.createElement('section');
      card.id='lpMemberCommand';
      card.className='lp-member-command';
      const summary=document.getElementById('membershipSummary');
      if(summary) summary.insertAdjacentElement('afterend',card);
      else wrap.prepend(card);
    }

    const m=activeMembership(), meta=planMeta(), s=calculateStats();
    const limit=Number(m.passport_limit || 10);
    const usage=limit>900000 ? 0 : Math.min(100,Math.round(s.count/Math.max(1,limit)*100));
    const status=String(m.status||'active').toUpperCase();

    card.innerHTML=`
      <div class="lp-member-command-head">
        <div>
          <div class="lp-member-kicker">LIFEPASS MEMBER COMMAND CENTER</div>
          <h3>${esc(meta.name)} Member</h3>
          <div class="lp-member-id" id="lpMemberIdValue">${esc(memberId)}</div>
          <div class="lp-member-tier">${stars(meta.stars,meta.founder)}<span style="font-size:11px;color:#c8e1e7">• ${esc(status)} • ${s.trust}/100 lifecycle trust</span></div>
        </div>
        <div class="lp-member-actions">
          <button type="button" id="lpCopyMemberId">Copy Member ID</button>
          <button type="button" id="lpPrintMemberCard">Print Member Card</button>
        </div>
      </div>
      <div class="lp-member-grid">
        <div class="lp-member-stat"><small>Trust Score</small><strong>${s.trust}/100</strong><div class="sub">passport record quality</div></div>
        <div class="lp-member-stat"><small>Protected Assets</small><strong>${s.count}</strong><div class="sub">${s.verified} verified passports</div></div>
        <div class="lp-member-stat"><small>Recorded Asset Value</small><strong>${money(s.value)}</strong><div class="sub">from passport values</div></div>
        <div class="lp-member-stat"><small>Member Rewards</small><strong>${s.points.toLocaleString('en-IN')} pts</strong><div class="sub">${s.achievements.length} achievements</div></div>
      </div>
      <div class="lp-member-bottom">
        <div class="lp-member-panel">
          <h4>Member health</h4>
          <div style="display:flex;justify-content:space-between;gap:10px;font-size:11px;color:#c8e1e7;margin-bottom:6px"><span>Passport capacity</span><strong style="color:#fff">${limit>900000?'Founder capacity':s.count+' / '+limit}</strong></div>
          <div class="lp-member-progress"><span style="width:${usage}%"></span></div>
          <div class="lp-member-note">${s.warranty} active warranties · ${s.services} service records · ${s.docs} evidence files · ${s.transfers} ownership transfers</div>
          <div style="margin-top:12px;display:flex;justify-content:space-between;gap:10px;font-size:11px;color:#c8e1e7"><span>Passport completeness</span><strong style="color:#fff">${s.avgCompleteness}%</strong></div>
          <div class="lp-member-progress" style="margin-top:6px"><span style="width:${s.avgCompleteness}%"></span></div>
        </div>
        <div class="lp-member-panel">
          <h4>Member achievements</h4>
          <div class="lp-member-achievements">${s.achievements.length?s.achievements.map(a=>'<span class="lp-member-achievement">✓ '+esc(a[1])+'</span>').join(''):'<span class="lp-member-achievement">Start your first passport</span>'}</div>
          <div class="lp-member-qr" style="margin-top:14px">
            <div class="lp-member-qrbox"><img id="lpMemberQr" alt="LIFEPASS member ID QR"></div>
            <div><strong style="font-size:13px">Member identity</strong><div class="lp-member-note">This QR encodes the LIFEPASS Member ID only. It does not expose private passport data.</div></div>
          </div>
        </div>
      </div>`;

    const copy=document.getElementById('lpCopyMemberId');
    if(copy) copy.onclick=async function(){
      try{ await navigator.clipboard.writeText(memberId); if(window.toast)toast('Member ID copied.'); }
      catch(_){ window.prompt('Copy your LIFEPASS Member ID:',memberId); }
    };

    const print=document.getElementById('lpPrintMemberCard');
    if(print) print.onclick=function(){
      const html='<!doctype html><html><head><title>LIFEPASS Member Card</title><style>body{font-family:Arial,sans-serif;padding:35px;color:#102f50} .card{max-width:620px;margin:auto;border:1px solid #d9e3ea;border-radius:22px;padding:30px} .brand{font-weight:900;letter-spacing:4px;color:#079eaa} h1{margin:8px 0}.id{font:900 20px monospace;letter-spacing:2px}.stars{color:#c69200;font-size:24px}.row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}.box{border:1px solid #e0e8ed;border-radius:12px;padding:12px}.small{font-size:11px;color:#6b7d8d}</style></head><body><div class="card"><div class="brand">LIFEPASS</div><h1>${esc(meta.name)} Member</h1><div class="id">${esc(memberId)}</div><div class="stars">${'★'.repeat(meta.stars)}${meta.founder?' FOUNDER':''}</div><div class="row"><div class="box"><div class="small">Trust Score</div><strong>${s.trust}/100</strong></div><div class="box"><div class="small">Protected Assets</div><strong>${s.count}</strong></div><div class="box"><div class="small">Rewards</div><strong>${s.points.toLocaleString('en-IN')} pts</strong></div><div class="box"><div class="small">Active Warranties</div><strong>${s.warranty}</strong></div></div><p class="small" style="margin-top:24px">Member analytics are calculated from the passport records available in this LIFEPASS account.</p></div><script>window.print();</script></body></html>';
      const w=window.open('','_blank'); if(w){w.document.write(html);w.document.close();}
    };

    const qr=document.getElementById('lpMemberQr');
    if(qr){
      const data=encodeURIComponent(memberId);
      qr.src='https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data='+data;
    }
  }

  function wirePlanButtons(){
    document.querySelectorAll('.lp-plan-button[data-plan]').forEach(function(btn){
      if(btn.dataset.lpMemberWired==='1') return;
      btn.dataset.lpMemberWired='1';
      btn.addEventListener('click',function(event){
        event.preventDefault();
        const plan=btn.getAttribute('data-plan');
        if(typeof window.selectMembershipPlan==='function'){
          window.selectMembershipPlan(plan);
        }else if(typeof window.openMembershipPaymentFallback==='function'){
          window.openMembershipPaymentFallback(plan);
        }else if(window.toast){
          window.toast('Payment screen is loading. Please try again.');
        }
      });
    });
  }

  async function refresh(){
    if(!window.currentUser) return;
    const id=await getMemberId();
    render(id);
    wirePlanButtons();
  }

  function boot(){
    try{
      const oldShow=window.showPage;
      if(typeof oldShow==='function' && !oldShow.__lpMemberCommandWrapped){
        function wrapped(page){
          const result=oldShow.apply(this,arguments);
          if(page==='membership') setTimeout(refresh,80);
          if(page==='profile') setTimeout(refresh,80);
          return result;
        }
        wrapped.__lpMemberCommandWrapped=true;
        window.showPage=wrapped;
      }
      refresh();
      setTimeout(refresh,700);
      setTimeout(refresh,1800);
      document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh();});
      window.addEventListener('lifepass:membership-updated',refresh);
    }catch(e){ console.error('LIFEPASS Member Command Center error:',e); }
  }

  window.refreshLifepassMemberCommand=refresh;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();

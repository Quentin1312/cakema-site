const {advanceRotor}=await import('./carousel-motion.js');
const $=s=>document.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const html=document.documentElement;
const menu=$('.menu-button');
function closeMenu(){menu.setAttribute('aria-expanded','false');$('#navigation').classList.remove('is-open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',open);$('#navigation').classList.toggle('is-open',open);});
$('#navigation').addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});

const hero=$('#hero-model');
hero.setAttribute('auto-rotate-delay','1400');hero.setAttribute('rotation-per-second','8deg');
hero.toggleAttribute('auto-rotate',!reduced);
hero.addEventListener('load',()=>hero.classList.add('loaded'));
hero.addEventListener('error',()=>{$('.hero-loading').innerHTML='<img src="assets/cakes/mariage-hexagonal.jpeg" alt="Pièce montée Cake’Ma">';});
const pieces=[['mariage-hexagonal','Hexagone dentelle','Mariage'],['naked-floral','Naked cake aux roses','Mariage'],['creme-florale','Couronne de fleurs','Anniversaire'],['fleurs-fuchsia','Volants fuchsia','Mariage'],['dix-huit','Dix-huit, noir et or','Anniversaire'],['geode-rose','Géode rose','Anniversaire'],['framboises','Framboises et volants','Anniversaire'],['chocolat-gourmand','Gourmand chocolat','Événement'],['one-ourson','Premier anniversaire','Anniversaire'],['chateau','Le château','Anniversaire'],['coeur-rouge','Cœur rouge','Événement'],['number-fruits','Number cake aux fruits','Anniversaire']];
const ring=$('.cake-ring'),carousel=$('.carousel-stage');
const motion={angle:0,velocity:reduced?0:-2.4,target:null};
let carouselPaused=false,dragging=false,dragAngle=0,startX=0,lastX=0,lastMoveAt=0,dragVelocity=0,moved=false,activePiece=-1,ringVisible=false,lastFrame=0,autoDirection=-1,keyboardMode=false,returnFocus=null;
const position=$('.piece-position'),category=$('#piece-category'),pieceName=$('#piece-name');
function openPhoto(i){const [file,name]=pieces[i];returnFocus=document.activeElement;const viewer=$('.image-viewer');viewer.querySelector('img').src=`assets/cakes/${file}.jpeg`;viewer.querySelector('img').alt=name;viewer.querySelector('p').textContent=name;viewer.hidden=false;html.style.overflow='hidden';$('.close-viewer').focus();}
function closePhoto(){if($('.image-viewer').hidden)return;$('.image-viewer').hidden=true;html.style.overflow='';returnFocus?.focus();}
function aimAt(target){motion.target=target;if(reduced){motion.angle=target;motion.target=null;motion.velocity=0;paintRing();}}
const shortTurn=n=>((n+180)%360+360)%360-180;
pieces.forEach(([file,name],i)=>{const c=document.createElement('div');c.className='ring-card';c.innerHTML=`<button type="button" aria-label="Agrandir : ${name}"><img src="assets/cakes/${file}.jpeg" alt="${name}" width="210" height="278" loading="eager" decoding="async" fetchpriority="low" draggable="false"></button>`;c.querySelector('button').addEventListener('click',e=>{if(moved){e.preventDefault();return;}if(i!==activePiece){aimAt(motion.angle+shortTurn(-i*30-motion.angle));return;}openPhoto(i);});ring.append(c);});
const cards=[...ring.children],cardButtons=cards.map(c=>c.querySelector('button'));
const norm=n=>(n%12+12)%12;
function paintRing(){ring.style.transform=`rotateY(${motion.angle}deg)`;const idx=norm(Math.round(-motion.angle/30));if(idx===activePiece)return;activePiece=idx;position.textContent=`${String(idx+1).padStart(2,'0')} / 12`;category.textContent=pieces[idx][2];pieceName.textContent=pieces[idx][1];cardButtons.forEach((b,i)=>{b.tabIndex=i===idx?0:-1;cards[i].setAttribute('aria-hidden',String(i!==idx));});}
function layoutRing(){const radius=innerWidth<=760?410:470;cards.forEach((el,i)=>el.style.transform=`rotateY(${i*30}deg) translateZ(${radius}px)`);paintRing();}
function stepPiece(d){autoDirection=-Math.sign(d);aimAt(Math.round(motion.angle/30)*30-d*30);}
$('#previous-piece').addEventListener('click',()=>stepPiece(-1));$('#next-piece').addEventListener('click',()=>stepPiece(1));
carousel.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();keyboardMode=true;stepPiece(e.key==='ArrowRight'?1:-1);}});
document.addEventListener('keydown',e=>{if(e.key==='Tab')keyboardMode=true;if(e.key==='Escape'){closeMenu();closePhoto();}if(!$('.image-viewer').hidden&&e.key==='Tab'){e.preventDefault();$('.close-viewer').focus();}});
document.addEventListener('pointerdown',()=>keyboardMode=false,{passive:true});
carousel.addEventListener('dragstart',e=>e.preventDefault());
carousel.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;dragging=true;moved=false;motion.target=null;dragVelocity=0;dragAngle=motion.angle;lastX=startX=e.clientX;lastMoveAt=e.timeStamp;});
addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX;const scale=innerWidth<=760?.23:.15;const elapsed=Math.max(.008,Math.min(.08,(e.timeStamp-lastMoveAt)/1000));if(Math.abs(e.clientX-startX)>5&&!moved){moved=true;carousel.setPointerCapture?.(e.pointerId);}dragAngle+=dx*scale;dragVelocity=dragVelocity*.45+(dx*scale/elapsed)*.55;dragVelocity=Math.max(-160,Math.min(160,dragVelocity));motion.angle=dragAngle;lastX=e.clientX;lastMoveAt=e.timeStamp;});
function finishDrag(e){if(!dragging)return;dragging=false;const idle=Math.max(0,(e.timeStamp-lastMoveAt-90)/1000);motion.velocity=reduced?0:dragVelocity*Math.exp(-idle*12);if(Math.abs(motion.velocity)>3)autoDirection=Math.sign(motion.velocity);if(e.type==='pointercancel')motion.velocity=0;setTimeout(()=>moved=false,90);}
addEventListener('pointerup',finishDrag);addEventListener('pointercancel',finishDrag);
$('.close-viewer').addEventListener('click',closePhoto);$('.image-viewer').addEventListener('click',e=>{if(e.target===$('.image-viewer'))closePhoto();});
const viewer=$('.image-viewer');
new IntersectionObserver(es=>ringVisible=es[0].isIntersecting,{rootMargin:'150px'}).observe(carousel);
let lastVisibilityCheck=-Infinity;
function animate(now){if(!document.hidden&&now-lastVisibilityCheck>250){const box=carousel.getBoundingClientRect();ringVisible=box.bottom>-150&&box.top<innerHeight+150;lastVisibilityCheck=now;}const dt=Math.min((now-lastFrame)/1000||0,.05);lastFrame=now;if(ringVisible&&!document.hidden){if(!dragging){const keyboardFocus=keyboardMode&&carousel.contains(document.activeElement);const cruise=!reduced&&!keyboardFocus&&!carouselPaused&&viewer.hidden?autoDirection*2.4:0;advanceRotor(motion,dt,cruise);}paintRing();}requestAnimationFrame(animate);}
layoutRing();requestAnimationFrame(animate);addEventListener('resize',layoutRing);

// Carte d'Emma : [nom affiché, nom dans le message, couleur, illustration (facultative)]
const B=[['Vanille','génoise vanille','#f5d488','photos/biscuit-vanille.webp'],['Chocolat','biscuit chocolat','#702d17','photos/biscuit-chocolat.webp'],['Cacao','biscuit cacao (chocolat noir)','#692613','photos/biscuit-cacao.webp'],['Coco','biscuit coco','#efd4a1','photos/biscuit-coco.webp'],['Amande','biscuit amande','#f0c783','photos/biscuit-amande.webp'],['Noisette','biscuit noisette','#b88a58'],['Spéculoos','biscuit spéculoos','#b5763f'],['Pistache','biscuit pistache','#a9b26a','pistache'],['Praliné','biscuit praliné','#b98a5e','praline'],['Marbré','biscuit marbré vanille-chocolat','#8a5a3a']];
const I=[['Framboise','insert framboise','#b51d45','framboise'],['Fraise','insert fraise','#d6304a','fruits-rouges'],['Passion','insert fruits de la passion','#efa21f','passion'],['Mangue','insert mangue','#f5a623'],['Caramel','insert caramel beurre salé','#a8652c','caramel'],['Chocolat','insert chocolat','#3d2318','chocolat'],['Coco','insert coco','#f1ebdf'],['Praliné','insert praliné','#9c6b3f','praline'],['Pistache','insert pistache','#93a04f','pistache'],['Spéculoos','insert spéculoos','#a8682f'],['Poire','insert poire','#d9cf86'],['Abricot','insert abricot','#f0a04b'],['Myrtille','insert myrtille','#4b3f8c']];
const C=[['Vanille','crème vanille','#f6ead2','vanille'],['Chocolat','crème chocolat','#6b4330','chocolat'],['Coco','crème coco','#fbf8f1'],['Passion','crème passion','#f3c35a','passion'],['Fraise','crème fraise','#f2a7b4'],['Framboise','crème framboise','#e8798f','framboise'],['Pistache','crème pistache','#c8cf98','pistache'],['Praliné','crème praliné','#c9a07a','praline'],['Caramel','crème caramel beurre salé','#d4a165','caramel'],['Noisette','crème noisette','#c49a72'],['Spéculoos','crème spéculoos','#c8925c'],['Café','crème café','#a77a5a'],['Mascarpone','crème mascarpone','#f5ecdc','mascarpone'],['Chantilly','chantilly vanille','#fdf9f0'],['Ganache','ganache montée','#e9d8bd']];
const describe=(kind,[label,full])=>({biscuit:'Biscuit',insert:'Le cœur du gâteau',creme:'Crème'}[kind]+' : '+full.replace(/^(génoise|biscuit|insert|crème) /,'')+'.');
const groups=[
 {key:'biscuit',legend:'Choisir le biscuit',options:B.map(o=>[o[0],o[1],o[2],describe('biscuit',o),o[3]])},
 {key:'insert',legend:'Choisir le cœur du gâteau',options:I.map(o=>[o[0],o[1],o[2],describe('insert',o),o[3]])},
 {key:'creme',legend:'Choisir la crème',options:C.map(o=>[o[0],o[1],o[2],describe('creme',o),o[3]])}
];
// Couleurs transmises au gâteau 3D
const darker=h=>'#'+h.slice(1).match(/../g).map(x=>Math.round(parseInt(x,16)*.78).toString(16).padStart(2,'0')).join('');
window.cakePalette={biscuit:B.map(o=>o[2]),insert:I.map(o=>o[2]),creme:C.map(o=>o[2]),fruit:I.map(o=>[o[2],darker(o[2])]),berry:I.map(o=>['Framboise','Fraise','Myrtille'].includes(o[0]))};
const recipe={biscuit:0,insert:0,creme:0,tiers:1};let cakeApi=null,currentGroup=0;

const groupTitles=['LE BISCUIT','LE CŒUR','LA CRÈME'];
function renderPalette(){const g=groups[currentGroup];$('#palette-title').textContent=groupTitles[currentGroup];$('.palette-options legend').textContent=g.legend;$('#flavour-options').innerHTML=g.options.map(([label,,color,,svg],i)=>`<label class="palette-choice"><input type="radio" name="${g.key}" value="${i}" ${recipe[g.key]===i?'checked':''}><span class="ingredient-sample" style="--swatch:${color}">${svg?`<img src="assets/ingredients/${svg.includes('.')?svg:svg+'.svg'}" alt="" width="85" height="85" loading="lazy" decoding="async">`:''}<i aria-hidden="true">✓</i></span><span class="palette-name">${label}</span></label>`).join('');$('#ingredient-description').textContent=g.options[recipe[g.key]][3];document.querySelectorAll('.flavour-anchor').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===currentGroup)));}
function updateRecipe(){groups.forEach(g=>$('#selected-'+g.key).textContent=g.options[recipe[g.key]][0]);const summary=groups.map(g=>g.options[recipe[g.key]][0]).join(' · ');const people=+($('#recipe-guests')?.value||$('#guests').value);const tierLabel=recipe.tiers+(recipe.tiers>1?' étages':' étage');const tierOutput=$('#tiers-label');if(tierOutput)tierOutput.textContent=tierLabel;$('#recipe-summary').textContent=summary;$('.event-recipe').textContent=summary+' · '+people+' personnes · '+tierLabel;$('#recipe-canvas').setAttribute('aria-label','Gâteau en coupe 3D : '+summary+', '+tierLabel+', pour '+people+' personnes. Glissez pour tourner.');$('#message-result').hidden=true;cakeApi?.set({...recipe});}
document.querySelectorAll('.flavour-anchor').forEach(b=>b.addEventListener('click',()=>{currentGroup=+b.dataset.group;renderPalette();}));
$('#flavour-options').addEventListener('change',e=>{if(!e.target.matches('input[type=radio]'))return;const g=groups[currentGroup];recipe[g.key]=+e.target.value;$('#ingredient-description').textContent=g.options[+e.target.value][3];updateRecipe();});
const eventDialog=$('#event-dialog');document.querySelectorAll('#open-event,#open-contact,#open-header').forEach(b=>b.addEventListener('click',()=>eventDialog.showModal()));$('.close-event').addEventListener('click',()=>eventDialog.close());eventDialog.addEventListener('click',e=>{if(e.target!==eventDialog)return;const r=eventDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)eventDialog.close();});
function setGuestCount(value){const raw=Math.round(+value||0);const n=Math.max(15,Math.min(300,raw||15));document.querySelectorAll('.guest-adjust').forEach(el=>{el.hidden=raw===n;el.textContent=raw<15?'Minimum 15 personnes : nous avons ajusté à 15.':'Au-delà de 300 personnes, écrivez-nous directement : nous avons ajusté à 300.';});['#guests','#recipe-guests','#recipe-size-range'].forEach(selector=>{const input=$(selector);if(input)input.value=n;});recipe.tiers=n<25?1:n<60?2:3;updateRecipe();}
$('#recipe-guests')?.addEventListener('input',e=>{const n=+e.target.value;if(n>=15&&n<=300)setGuestCount(n);});
$('#recipe-guests')?.addEventListener('change',e=>setGuestCount(e.target.value));
$('#recipe-size-range')?.addEventListener('input',e=>setGuestCount(e.target.value));
$('#guests').addEventListener('input',e=>{const n=+e.target.value;if(n>=15&&n<=300)setGuestCount(n);});
$('#guests').addEventListener('change',e=>setGuestCount(e.target.value));
$('#event-date').min=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());$('#event-date').addEventListener('change',()=>$('#message-result').hidden=true);$('#occasion').addEventListener('change',()=>$('#message-result').hidden=true);
function makeRequest(){const date=$('#event-date').value;const when=date?' le '+new Intl.DateTimeFormat('fr-FR',{dateStyle:'long'}).format(new Date(date+'T12:00:00')):'';const event=['un mariage','un anniversaire','un événement d’entreprise','une fête','un brunch'][$('#occasion').selectedIndex];if(event==='un brunch')return `Bonjour Emma ! J’organise un brunch plutôt ${document.querySelector('input[name=brunch-type]:checked')?.value||'sucré et salé'}${when} pour ${$('#guests').value} personnes. Pourrions-nous en parler pour composer la formule ensemble ?`;return `Bonjour Emma ! Je prépare ${event}${when} pour ${$('#guests').value} personnes. J’aimerais un gâteau de ${recipe.tiers} étage${recipe.tiers>1?'s':''} avec : ${groups[0].options[recipe.biscuit][1]}, ${groups[1].options[recipe.insert][1]} et ${groups[2].options[recipe.creme][1]}. Pourrions-nous imaginer le décor ensemble ?`;}
$('#event-panel').addEventListener('submit',async e=>{e.preventDefault();if(!e.target.reportValidity())return;const text=makeRequest();$('#message-text').value=text;let copied=false;try{await navigator.clipboard.writeText(text);copied=true;}catch{}$('#message-status').textContent=copied?'Votre demande est copiée. Collez-la dans la conversation avec Emma.':'Copiez votre demande ci-dessous, puis ouvrez Instagram.';$('#message-result').hidden=false;if(!copied){$('#message-text').focus();$('#message-text').select();}});
renderPalette();updateRecipe();

const recipeObserver=new IntersectionObserver(async es=>{if(!es[0].isIntersecting)return;recipeObserver.disconnect();try{const {mountCake}=await import('./cake3d.js');cakeApi=await mountCake($('#recipe-canvas'),{...recipe});cakeApi.set({...recipe});$('.recipe-loading').hidden=true;$('#recipe-canvas').classList.add('is-ready');}catch(e){$('.recipe-loading').hidden=true;$('.cake-live-fallback').hidden=false;console.warn('Aperçu 3D indisponible : les choix de saveurs restent disponibles.');}},{rootMargin:'400px'});recipeObserver.observe($('#recipe-canvas'));

// Bouton collant : visible après le hero, masqué près des autres appels à l'action
const stickyCta=$('#sticky-cta');stickyCta.addEventListener('click',()=>eventDialog.showModal());
const ctaHiders=new Set();let pastHero=false;
const refreshCta=()=>stickyCta.classList.toggle('is-shown',pastHero&&ctaHiders.size===0);
new IntersectionObserver(([e])=>{pastHero=!e.isIntersecting&&e.boundingClientRect.top<0;refreshCta();}).observe($('.hero'));
const ctaObserver=new IntersectionObserver(es=>{es.forEach(e=>e.isIntersecting?ctaHiders.add(e.target):ctaHiders.delete(e.target));refreshCta();});
['.accord-footer','#livraison','.footer'].forEach(s=>ctaObserver.observe($(s)));

// Menu mobile « coupe de layer cake » : icône en trois couches, liens empilés comme des étages
const menuNav=$('#navigation');
menu.insertAdjacentHTML('beforeend','<span class="tier-icon" aria-hidden="true"><i></i><i></i><i></i></span>');
menu.setAttribute('aria-label','Ouvrir le menu');
menuNav.insertAdjacentHTML('beforeend','<a href="#etapes" class="nav-extra">Les étapes</a><a href="#questions" class="nav-extra">Questions</a>');
const menuThumbs=['cakes/mariage-hexagonal.jpeg','emma.webp','cakes/framboises.jpeg','brunch-thumb.webp','cakes/naked-floral.jpeg','cakes/geode-rose.jpeg'];
[...menuNav.querySelectorAll('a')].forEach((a,i,all)=>{a.classList.add('nav-row');a.style.setProperty('--i',i);a.innerHTML=`<span class="nav-label">${a.textContent}</span><img class="nav-thumb" src="assets/${menuThumbs[i]}" alt="" loading="lazy">`;if(i<all.length-1)a.insertAdjacentHTML('afterend','<i class="nav-filling" aria-hidden="true"></i>');});
menuNav.insertAdjacentHTML('beforeend','<div class="nav-foot"><button type="button" class="nav-cta">Préparer ma demande <span aria-hidden="true">→</span></button><p>Une question ? <a href="https://www.instagram.com/cake_maaa/" target="_blank" rel="noopener">Écrivez à Emma sur Instagram</a></p></div>');
menuNav.querySelector('.nav-cta').addEventListener('click',()=>{closeMenu();eventDialog.showModal();});
new MutationObserver(()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');html.classList.toggle('menu-open',open);}).observe(menu,{attributes:true,attributeFilter:['aria-expanded']});

// Solution de secours sans Instagram : le même message, prêt dans un e-mail
$('#event-panel').addEventListener('submit',()=>{const occasion=$('#occasion').value;$('#email-link').href=`mailto:contactcakema@gmail.com?subject=${encodeURIComponent('Demande de gâteau : '+occasion)}&body=${encodeURIComponent(makeRequest())}`;});

// Présentoir : bouton pause (le mouvement automatique durait sans fin)
const carouselToggle=$('#carousel-toggle');
carouselToggle.addEventListener('click',()=>{carouselPaused=!carouselPaused;carouselToggle.setAttribute('aria-pressed',String(carouselPaused));carouselToggle.textContent=carouselPaused?'Relancer le présentoir':'Mettre en pause';if(carouselPaused)motion.velocity=0;});
if(reduced)carouselToggle.hidden=true;
// Après « Générer mon message », le bouton Instagram reste visible
$('#event-panel').addEventListener('submit',()=>setTimeout(()=>$('#message-result .action-link')?.scrollIntoView({block:'nearest',behavior:reduced?'auto':'smooth'}),60));
// Le bouton collant se retire pendant la composition (elle a son propre bouton)
ctaObserver.observe($('.flavour-studio'));ctaObserver.observe($('#brunch'));

// Estimation indicative : 7 à 8 € la part (tout est fait sur mesure, devis précis par Emma)
const priceOut=document.createElement('p');priceOut.className='guest-price';priceOut.setAttribute('aria-live','polite');
$('#guest-tier-caption').after(priceOut);
const euros=v=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(v)+'\u00a0€';
const refreshPrice=()=>{const n=Math.max(15,Math.min(300,+$('#recipe-guests').value||15));priceOut.innerHTML=`Environ <strong>${euros(n*7)} à ${euros(n*8)}</strong> pour ${n} personnes (7 à 8\u00a0€ la part, selon les saveurs et le décor).`;};
['#recipe-guests','#recipe-size-range','#guests'].forEach(sel=>{$(sel).addEventListener('input',refreshPrice);$(sel).addEventListener('change',refreshPrice);});
refreshPrice();

// Section brunch : ouvre la demande avec l'occasion « Brunch »
$('#open-brunch').addEventListener('click',()=>{$('#occasion').value='Brunch';$('#message-result').hidden=true;eventDialog.showModal();});
const syncRecipeLine=()=>{$('.event-recipe').hidden=$('#occasion').value==='Brunch';};
$('#occasion').addEventListener('change',syncRecipeLine);$('#open-brunch').addEventListener('click',syncRecipeLine);
document.querySelectorAll('#open-event,#open-contact,#open-header').forEach(b=>b.addEventListener('click',()=>{if($('#occasion').value==='Brunch')$('#occasion').value='Mariage';syncRecipeLine();}));

// Brunch : sucré, salé ou les deux, la carte et le bouton suivent le choix
const brunchSection=$('#brunch');
brunchSection.querySelector('.brunch-pick').addEventListener('change',e=>{const v=e.target.value;brunchSection.dataset.type=v;$('.brunch-cta-label').textContent=`Demander mon brunch ${v==='sucré et salé'?'sucré et salé':v}`;});

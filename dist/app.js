const {advanceRotor}=await import('./carousel-motion.js');
const $=s=>document.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const html=document.documentElement;
const menu=$('.menu-button');
function closeMenu(){menu.setAttribute('aria-expanded','false');$('#navigation').classList.remove('is-open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',open);$('#navigation').classList.toggle('is-open',open);});
$('#navigation').addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});

const heroVideo=$('#hero-video');
if(reduced){heroVideo.removeAttribute('autoplay');heroVideo.pause();}
const pieces=[['mariage-hexagonal','Hexagone dentelle','Mariage'],['naked-floral','Naked cake aux roses','Mariage'],['creme-florale','Couronne de fleurs','Anniversaire'],['fleurs-fuchsia','Volants fuchsia','Mariage'],['dix-huit','Dix-huit, noir et or','Anniversaire'],['geode-rose','Géode rose','Anniversaire'],['framboises','Framboises et volants','Anniversaire'],['chocolat-gourmand','Gourmand chocolat','Événement'],['one-ourson','Premier anniversaire','Anniversaire'],['chateau','Le château','Anniversaire'],['coeur-rouge','Cœur rouge','Événement'],['noel-cheminee','La cheminée du père Noël','Événement'],['laly','Laly, roses et œillets','Anniversaire'],['framboises-vintage','Vintage aux framboises','Anniversaire'],['vichy-fraises-paquerettes','Vichy, fraises et pâquerettes','Anniversaire'],['ninja','Le ninja','Anniversaire'],['rubans-chocolat','Rubans et chocolat','Anniversaire'],['gender-reveal','Fille ou garçon ?','Événement']];
// Angle entre deux gâteaux du présentoir : suit le nombre de photos
const STEP=360/pieces.length;
// plus de gâteaux = cercle plus grand, reculé d'autant pour garder la même taille à l'écran
let ringPush=0;
const ring=$('.cake-ring'),carousel=$('.carousel-stage');
const motion={angle:0,velocity:reduced?0:-2.4,target:null};
let carouselPaused=false,dragging=false,dragAngle=0,startX=0,lastX=0,lastMoveAt=0,dragVelocity=0,moved=false,activePiece=-1,ringVisible=false,lastFrame=0,autoDirection=-1,keyboardMode=false,returnFocus=null;
const position=$('.piece-position'),category=$('#piece-category'),pieceName=$('#piece-name');
// Texte alternatif descriptif : nom de la création + type de gâteau, pour la recherche d’images
const altTypes={Mariage:'gâteau de mariage',Anniversaire:'gâteau d’anniversaire','Événement':'gâteau d’événement'};
function pieceAlt(i){const [,name,cat]=pieces[i];return `${name}, ${altTypes[cat]||'gâteau'} Cake’Ma à Aurillac`;}
function openPhoto(i){const [file,name]=pieces[i];returnFocus=document.activeElement;const viewer=$('.image-viewer');viewer.querySelector('img').src=`assets/cakes/${file}.webp`;viewer.querySelector('img').alt=pieceAlt(i);viewer.querySelector('p').textContent=name;viewer.hidden=false;html.style.overflow='hidden';$('.close-viewer').focus();}
function closePhoto(){if($('.image-viewer').hidden)return;$('.image-viewer').hidden=true;html.style.overflow='';returnFocus?.focus();}
function aimAt(target){motion.target=target;if(reduced){motion.angle=target;motion.target=null;motion.velocity=0;paintRing();}}
const shortTurn=n=>((n+180)%360+360)%360-180;
pieces.forEach(([file,name],i)=>{const c=document.createElement('div');c.className='ring-card';c.innerHTML=`<button type="button" aria-label="Agrandir : ${name}"><img src="assets/cakes/${file}-420.webp" alt="${pieceAlt(i)}" width="210" height="278" loading="eager" decoding="async" fetchpriority="low" draggable="false"></button>`;c.querySelector('button').addEventListener('click',e=>{if(moved){e.preventDefault();return;}if(i!==activePiece){aimAt(motion.angle+shortTurn(-i*STEP-motion.angle));return;}openPhoto(i);});ring.append(c);});
const cards=[...ring.children],cardButtons=cards.map(c=>c.querySelector('button'));
const norm=n=>(n%pieces.length+pieces.length)%pieces.length;
function paintRing(){ring.style.transform=`translateZ(${-ringPush}px) rotateY(${motion.angle}deg)`;const idx=norm(Math.round(-motion.angle/STEP));if(idx===activePiece)return;activePiece=idx;position.textContent=`${String(idx+1).padStart(2,'0')} / ${String(pieces.length).padStart(2,'0')}`;category.textContent=pieces[idx][2];pieceName.textContent=pieces[idx][1];cardButtons.forEach((b,i)=>{b.tabIndex=i===idx?0:-1;cards[i].setAttribute('aria-hidden',String(i!==idx));});}
function layoutRing(){const base=innerWidth<=760?410:470,radius=Math.max(base,Math.round(pieces.length*232/(2*Math.PI)));ringPush=radius-base;cards.forEach((el,i)=>el.style.transform=`rotateY(${i*STEP}deg) translateZ(${radius}px)`);paintRing();}
function stepPiece(d){autoDirection=-Math.sign(d);aimAt(Math.round(motion.angle/STEP)*STEP-d*STEP);}
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

// Carte d'Emma : [nom affiché, nom dans le message, couleur, photo]
const B=[['Vanille','génoise vanille','#f5d488','photos/biscuit-vanille.webp'],['Cacao','biscuit cacao','#401e17','photos/biscuit-cacao-noir.webp'],['Coco','biscuit coco','#efd4a1','photos/biscuit-coco.webp'],['Amande','biscuit amande','#f0c783','photos/biscuit-amande.webp'],['Noisette','biscuit noisette','#e7b074','photos/biscuit-noisette.webp'],['Spéculoos','biscuit spéculoos','#ba6322','photos/biscuit-speculoos.webp'],['Pistache','biscuit pistache','#d2bf4f','photos/biscuit-pistache.webp'],['Praliné','biscuit praliné','#e1a25c','photos/biscuit-praline.webp'],['Marbré','biscuit marbré vanille-chocolat','#a9683f','photos/biscuit-marbre.webp']];
const I=[['Framboise','coulis framboise','#9c1720','photos/coeur-framboise.webp'],['Fraise','coulis fraise','#b71f19','photos/coeur-fraise.webp'],['Passion','coulis fruits de la passion','#d3840d','photos/coeur-passion.webp'],['Mangue','coulis mangue','#f59b07','photos/coeur-mangue.webp'],['Caramel','coulis caramel beurre salé','#a54a15','photos/coeur-caramel.webp'],['Chocolat','coulis chocolat','#703219','photos/coeur-chocolat.webp'],['Coco','coulis coco','#f1cfa0','photos/coeur-coco.webp'],['Praliné','coulis praliné','#b95d20','photos/coeur-praline-eclats.webp'],['Pistache','coulis pistache','#a97d1e','photos/coeur-pistache.webp'],['Spéculoos','coulis spéculoos','#ba5818','photos/coeur-speculoos-eclats.webp'],['Poire','coulis poire','#edbc6b','photos/coeur-poire.webp'],['Abricot','coulis abricot','#e3690e','photos/coeur-abricot.webp']];
const C=[['Vanille','crème vanille','#edca7e','photos/creme-vanille.webp'],['Chocolat','crème chocolat','#6f3015','photos/creme-chocolat.webp'],['Coco','crème coco','#eed3ab','photos/creme-coco.webp'],['Passion','crème passion','#f1be52','photos/creme-passion.webp'],['Fraise','crème fraise','#e46659','photos/creme-fraise.webp'],['Framboise','crème framboise','#c92d43','photos/creme-framboise.webp'],['Pistache','crème pistache','#bc9e32','photos/creme-pistache.webp'],['Praliné','crème praliné','#d18139','photos/creme-praline.webp'],['Caramel','crème caramel beurre salé','#c36715','photos/creme-caramel.webp'],['Spéculoos','crème spéculoos','#c26e23','photos/creme-speculoos.webp'],['Café','crème café','#a75e25','photos/creme-cafe.webp'],['Chantilly','chantilly vanille','#e2d4bf','photos/creme-chantilly.webp']];
// Garnitures : [nom, nom dans le message, couleur, photo, décor sur le gâteau 3D]
const X=[['Sans','sans garniture','#fbf6ee',,''],['Fraise','fraises fraîches','#d42a3a','photos/garniture-fraise.webp','fraise'],['Framboise','framboises fraîches','#b8173f','photos/garniture-framboise.webp','framboise'],['Passion','fruits de la passion','#f2b12a','photos/garniture-passion.webp','passion'],['Mangue','dés de mangue','#f7a51c','photos/garniture-mangue.webp','mangue'],['Coco râpé','coco râpée','#f4efe6','photos/garniture-coco.webp','coco'],['Oreo','Oreo','#2b1f1c','photos/garniture-oreo.webp','oreo'],['Kinder','Kinder','#d9a066','photos/garniture-kinder.webp','kinder'],['Nutella','Nutella','#4a2414','photos/garniture-nutella.webp','nutella'],['Coulis passion','coulis passion','#f2a41f','photos/garniture-coulis-passion.webp','coulis-passion'],['Coulis framboise','coulis framboise','#b3122f','photos/garniture-coulis-framboise.webp','coulis-framboise']];
const describe=(kind,[label,full])=>({biscuit:'Biscuit',insert:'Coulis',creme:'Crème',extra:'Garniture'}[kind]+' : '+full.replace(/^(génoise|biscuit|coulis|crème) /,'')+'.');
const groups=[
 {key:'biscuit',legend:'Choisir le biscuit',options:B.map(o=>[o[0],o[1],o[2],describe('biscuit',o),o[3]])},
 {key:'insert',legend:'Choisir le coulis',options:I.map(o=>[o[0],o[1],o[2],describe('insert',o),o[3]])},
 {key:'creme',legend:'Choisir la crème',options:C.map(o=>[o[0],o[1],o[2],describe('creme',o),o[3]])},
 {key:'extra',legend:'Choisir la garniture',options:X.map(o=>[o[0],o[1],o[2],o[0]==='Sans'?'Sans garniture : le décor se décide avec Emma.':describe('extra',o),o[3]])}
];
const FLAVOURS=['biscuit','insert','creme'];
// Couleurs transmises au gâteau 3D
const darker=h=>'#'+h.slice(1).match(/../g).map(x=>Math.round(parseInt(x,16)*.78).toString(16).padStart(2,'0')).join('');
window.cakePalette={biscuit:B.map(o=>o[2]),insert:I.map(o=>o[2]),creme:C.map(o=>o[2]),fruit:I.map(o=>[o[2],darker(o[2])]),berry:I.map(o=>['Framboise','Fraise'].includes(o[0])),extra:X.map(o=>o[4])};
// Un jeu de saveurs par étage (0 = bas). Hors pièce montée, les trois restent identiques.
const recipe={layers:[0,1,2].map(()=>({biscuit:0,insert:0,creme:0})),extra:0,tiers:1};let cakeApi=null,currentGroup=0,editTier=0;
const piece=()=>recipe.tiers===3;
const editedLayer=()=>recipe.layers[piece()?editTier:0];
const valueOf=g=>g.key==='extra'?recipe.extra:editedLayer()[g.key];
const sameLayers=()=>recipe.layers.every(L=>FLAVOURS.every(k=>L[k]===recipe.layers[0][k]));
const shortNames=L=>FLAVOURS.map((k,gi)=>groups[gi].options[L[k]][0]).join(' · ');
const fullNames=L=>`${groups[0].options[L.biscuit][1]}, ${groups[1].options[L.insert][1]} et ${groups[2].options[L.creme][1]}`;
const extraName=()=>recipe.extra?groups[3].options[recipe.extra][0]:'';
const summaryText=()=>{const s=piece()&&!sameLayers()?[2,1,0].map(t=>['Bas','Milieu','Haut'][t]+' : '+shortNames(recipe.layers[t])).join(' / '):shortNames(recipe.layers[0]);return extraName()?s+' · '+extraName():s;};
const cakeState=()=>({tiers:recipe.tiers,extra:recipe.extra,layers:recipe.layers.slice(0,recipe.tiers).map(L=>({...L}))});
// En pièce montée, la garniture ne se pose que sur l'étage du haut
const syncExtra=()=>{const off=X.length<2||(piece()&&editTier!==2);$('.anchor-extra').hidden=off;if(off&&currentGroup===3){currentGroup=0;renderPalette();}};

const groupTitles=['LE BISCUIT','LE COULIS','LA CRÈME','LA GARNITURE'];
function renderPalette(){const g=groups[currentGroup],v=valueOf(g);$('#palette-title').textContent=groupTitles[currentGroup]+(piece()&&g.key!=='extra'?' · ÉTAGE DU '+['BAS','MILIEU','HAUT'][editTier]:'');$('.palette-options legend').textContent=g.legend;$('#flavour-options').innerHTML=g.options.map(([label,,color,,svg],i)=>`<label class="palette-choice"><input type="radio" name="${g.key}" value="${i}" ${v===i?'checked':''}><span class="ingredient-sample" style="--swatch:${color}">${svg?`<img src="assets/ingredients/${svg.includes('.')?svg:svg+'.svg'}" alt="" width="85" height="85" loading="lazy" decoding="async">`:''}<i aria-hidden="true">✓</i></span><span class="palette-name">${label}</span></label>`).join('');$('#ingredient-description').textContent=g.options[v][3];document.querySelectorAll('.flavour-anchor').forEach(el=>el.setAttribute('aria-pressed',String(+el.dataset.group===currentGroup)));}
function updateRecipe(){groups.forEach(g=>{const el=$('#selected-'+g.key);if(el)el.textContent=g.options[valueOf(g)][0];});const summary=summaryText();const people=+($('#recipe-guests')?.value||$('#guests').value);const tierLabel=piece()?'Pièce montée':recipe.tiers+(recipe.tiers>1?' étages':' étage');const tierOutput=$('#tiers-label');if(tierOutput)tierOutput.textContent=tierLabel;$('#recipe-summary').textContent=summary;$('.event-recipe').textContent=summary+' · '+people+' personnes · '+tierLabel;$('#recipe-canvas').setAttribute('aria-label','Gâteau en coupe 3D : '+summary+', '+tierLabel+', pour '+people+' personnes. Glissez pour tourner.');$('#message-result').hidden=true;$('.tier-pick').hidden=!piece();document.querySelectorAll('.tier-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.tier===editTier)));syncExtra();cakeApi?.set(cakeState());}
document.querySelectorAll('.flavour-anchor').forEach(b=>b.addEventListener('click',()=>{currentGroup=+b.dataset.group;renderPalette();}));
document.querySelectorAll('.tier-tabs button').forEach(b=>b.addEventListener('click',()=>{editTier=+b.dataset.tier;renderPalette();updateRecipe();}));
$('#flavour-options').addEventListener('change',e=>{if(!e.target.matches('input[type=radio]'))return;const g=groups[currentGroup],v=+e.target.value;if(g.key==='extra')recipe.extra=v;else if(piece())recipe.layers[editTier][g.key]=v;else recipe.layers.forEach(L=>{L[g.key]=v;});$('#ingredient-description').textContent=g.options[v][3];updateRecipe();});
const eventDialog=$('#event-dialog');document.querySelectorAll('#open-event,#open-contact,#open-header').forEach(b=>b.addEventListener('click',()=>eventDialog.showModal()));$('.close-event').addEventListener('click',()=>eventDialog.close());eventDialog.addEventListener('click',e=>{if(e.target!==eventDialog)return;const r=eventDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)eventDialog.close();});
function setGuestCount(value){const raw=Math.round(+value||0);const n=Math.max(15,Math.min(300,raw||15));document.querySelectorAll('.guest-adjust').forEach(el=>{el.hidden=raw===n;el.textContent=raw<15?'Minimum 15 personnes : nous avons ajusté à 15.':'Au-delà de 300 personnes, écrivez-nous directement : nous avons ajusté à 300.';});['#guests','#recipe-guests','#recipe-size-range'].forEach(selector=>{const input=$(selector);if(input)input.value=n;});const was=piece();recipe.tiers=n<25?1:n<60?2:3;if(!piece()){recipe.layers.forEach(L=>Object.assign(L,recipe.layers[0]));editTier=0;}if(was!==piece())renderPalette();updateRecipe();}
$('#recipe-guests')?.addEventListener('input',e=>{const n=+e.target.value;if(n>=15&&n<=300)setGuestCount(n);});
$('#recipe-guests')?.addEventListener('change',e=>setGuestCount(e.target.value));
$('#recipe-size-range')?.addEventListener('input',e=>setGuestCount(e.target.value));
$('#guests').addEventListener('input',e=>{const n=+e.target.value;if(n>=15&&n<=300)setGuestCount(n);});
$('#guests').addEventListener('change',e=>setGuestCount(e.target.value));
$('#event-date').min=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());$('#event-date').addEventListener('change',()=>$('#message-result').hidden=true);$('#occasion').addEventListener('change',()=>$('#message-result').hidden=true);
function makeRequest(){const date=$('#event-date').value;const when=date?' le '+new Intl.DateTimeFormat('fr-FR',{dateStyle:'long'}).format(new Date(date+'T12:00:00')):'';const event=['un mariage','un anniversaire','un événement d’entreprise','une fête','un brunch'][$('#occasion').selectedIndex];const noDate=date?'':' La date n’est pas encore fixée.';if(event==='un brunch')return `Bonjour Emma ! J’organise un brunch${when}.${noDate}${brunchAnswers()}Pourrions-nous en parler pour composer la formule ensemble ?`;const L=recipe.layers;const cake=!piece()?`un gâteau de ${recipe.tiers} étage${recipe.tiers>1?'s':''} avec : ${fullNames(L[0])}.`:sameLayers()?`une pièce montée de 3 étages avec : ${fullNames(L[0])}.`:`une pièce montée de 3 étages : en bas, ${fullNames(L[0])} ; au milieu, ${fullNames(L[1])} ; en haut, ${fullNames(L[2])}.`;const plus=recipe.extra?` En garniture : ${groups[3].options[recipe.extra][1]}.`:'';const code=$('#guests').value+':'+L.slice(0,piece()?3:1).map(l=>FLAVOURS.map(k=>l[k]).join('.')).join(',')+(recipe.extra?':'+recipe.extra:'');return `Bonjour Emma ! Je prépare ${event}${when} pour ${$('#guests').value} personnes. J’aimerais ${cake}${plus}${noDate} Pourrions-nous imaginer le décor ensemble ?\n\nVoir mon gâteau : ${location.origin+location.pathname}?gateau=${code}#composition`;}
$('#event-panel').addEventListener('submit',async e=>{e.preventDefault();if(!e.target.reportValidity())return;const text=makeRequest();$('#message-text').value=text;let copied=false;try{await navigator.clipboard.writeText(text);copied=true;}catch{}$('#message-status').textContent=copied?'Votre demande est copiée. Collez-la dans la conversation avec Emma.':'Copiez votre demande ci-dessous, puis ouvrez Instagram.';$('#message-result').hidden=false;if(!copied){$('#message-text').focus();$('#message-text').select();}});
renderPalette();updateRecipe();

const recipeObserver=new IntersectionObserver(async es=>{if(!es[0].isIntersecting)return;recipeObserver.disconnect();try{const {mountCake}=await import('./cake3d.js?v=20261030b');cakeApi=await mountCake($('#recipe-canvas'),cakeState());$('.recipe-loading').hidden=true;$('#recipe-canvas').classList.add('is-ready');}catch(e){$('.recipe-loading').hidden=true;$('.cake-live-fallback').hidden=false;console.warn('Aperçu 3D indisponible : les choix de saveurs restent disponibles.');}},{rootMargin:'400px'});recipeObserver.observe($('#recipe-canvas'));

// Bouton collant : visible après le hero, masqué près des autres appels à l'action
const stickyCta=$('#sticky-cta');stickyCta.addEventListener('click',()=>eventDialog.showModal());
const ctaHiders=new Set();let pastHero=false;
const refreshCta=()=>stickyCta.classList.toggle('is-shown',pastHero&&ctaHiders.size===0);
new IntersectionObserver(([e])=>{pastHero=!e.isIntersecting&&e.boundingClientRect.top<0;refreshCta();}).observe($('.hero'));
const ctaObserver=new IntersectionObserver(es=>{es.forEach(e=>e.isIntersecting?ctaHiders.add(e.target):ctaHiders.delete(e.target));refreshCta();});
['.accord-footer','.footer'].forEach(s=>ctaObserver.observe($(s)));

// Menu mobile « coupe de layer cake » : icône en trois couches, liens empilés comme des étages
const menuNav=$('#navigation');
menu.insertAdjacentHTML('beforeend','<span class="tier-icon" aria-hidden="true"><i></i><i></i><i></i></span>');
menu.setAttribute('aria-label','Ouvrir le menu');
menuNav.insertAdjacentHTML('beforeend','<a href="#etapes" class="nav-extra">Les étapes</a><a href="#questions" class="nav-extra">Questions</a>');
const menuThumbs=['cakes/mariage-hexagonal-420.webp','emma.webp','cakes/framboises-420.webp','brunch-thumb.webp','cakes/naked-floral-420.webp','cakes/geode-rose-420.webp'];
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

// Section brunch : ouvre la demande avec l'occasion « Brunch »
$('#open-brunch').addEventListener('click',()=>{$('#occasion').value='Brunch';$('#message-result').hidden=true;eventDialog.showModal();});
const syncRecipeLine=()=>{const brunch=$('#occasion').value==='Brunch';$('.event-recipe').hidden=brunch;$('.brunch-quiz').hidden=!brunch;};
$('#occasion').addEventListener('change',syncRecipeLine);$('#open-brunch').addEventListener('click',syncRecipeLine);
document.querySelectorAll('#open-event,#open-contact,#open-header').forEach(b=>b.addEventListener('click',()=>{if($('#occasion').value==='Brunch')$('#occasion').value='Mariage';syncRecipeLine();}));

// Pas encore de date : la case remplace le champ date
$('#no-date').addEventListener('change',e=>{const d=$('#event-date');d.disabled=e.target.checked;d.required=!e.target.checked;if(e.target.checked)d.value='';$('#message-result').hidden=true;});
// Lien « Voir mon gâteau » : ?gateau=personnes:b.c.c[,b.c.c,b.c.c][:plus] recharge la sélection du client
(()=>{const m=/^(\d+):([\d.,]+)(?::(\d+))?$/.exec(new URLSearchParams(location.search).get('gateau')||'');if(!m)return;setGuestCount(+m[1]);const sets=m[2].split(',').map(t=>t.split('.').map(Number));const fit=(gi,v)=>v<groups[gi].options.length?v:0;recipe.layers.forEach((L,t)=>{const v=sets[sets.length===3?t:0]||[];FLAVOURS.forEach((k,gi)=>{L[k]=fit(gi,v[gi]||0);});});if(m[3])recipe.extra=fit(3,+m[3]);renderPalette();updateRecipe();})();
// Arrivée par un lien vers une section (#composition, #brunch…) : on y retourne une fois la page chargée, les images ayant pu décaler la mise en page
addEventListener('load',()=>{const t=location.hash&&document.querySelector(location.hash);if(t)t.scrollIntoView();});

// Les trois photos d’Emma restent visibles et fixes.

// Questionnaire brunch d'Emma : visible seulement pour l'occasion « Brunch », les réponses remplies s'ajoutent au message
function brunchAnswers(){const parts=[];document.querySelectorAll('.bq-section').forEach(sec=>{const lines=[];sec.querySelectorAll('.bq-field').forEach(f=>{const vals=[...f.querySelectorAll('input:checked')].map(i=>i.value);const t=f.querySelector('input[type=text],input[type=number],textarea');if(t&&t.value.trim())vals.push(t.value.trim());if(vals.length)lines.push(`- ${f.dataset.label} : ${vals.join(', ')}`);});if(lines.length)parts.push(`\n\n${sec.dataset.title.toUpperCase()}\n${lines.join('\n')}`);});return parts.length?`\n\nVoici mes réponses au questionnaire brunch :${parts.join('')}\n\n`:' ';}
const brunchQuiz=$('.brunch-quiz');
brunchQuiz.addEventListener('input',e=>{$('#message-result').hidden=true;const sec=e.target.closest('.bq-section');const n=[...sec.querySelectorAll('.bq-field')].filter(f=>f.querySelector('input:checked')||[...f.querySelectorAll('input[type=text],input[type=number],textarea')].some(t=>t.value.trim())).length;sec.querySelector('.bq-count').textContent=n?`${n} réponse${n>1?'s':''}`:'';});
syncRecipeLine();

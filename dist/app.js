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
let dragging=false,dragAngle=0,startX=0,lastX=0,lastMoveAt=0,dragVelocity=0,moved=false,activePiece=-1,ringVisible=false,lastFrame=0,autoDirection=-1,keyboardMode=false,returnFocus=null;
const position=$('.piece-position'),category=$('#piece-category'),pieceName=$('#piece-name');
function openPhoto(i){const [file,name]=pieces[i];returnFocus=document.activeElement;const viewer=$('.image-viewer');viewer.querySelector('img').src=`assets/cakes/${file}.jpeg`;viewer.querySelector('img').alt=name;viewer.querySelector('p').textContent=name;viewer.hidden=false;html.style.overflow='hidden';$('.close-viewer').focus();}
function closePhoto(){if($('.image-viewer').hidden)return;$('.image-viewer').hidden=true;html.style.overflow='';returnFocus?.focus();}
function aimAt(target){motion.target=target;if(reduced){motion.angle=target;motion.target=null;motion.velocity=0;paintRing();}}
const shortTurn=n=>((n+180)%360+360)%360-180;
pieces.forEach(([file,name],i)=>{const c=document.createElement('div');c.className='ring-card';c.innerHTML=`<button type="button" aria-label="Agrandir : ${name}"><img src="assets/cakes/${file}.jpeg" alt="${name}" width="210" height="278" loading="eager" decoding="async" fetchpriority="low" draggable="false"></button>`;c.querySelector('button').addEventListener('click',e=>{if(moved){e.preventDefault();return;}if(i!==activePiece){aimAt(motion.angle+shortTurn(-i*30-motion.angle));return;}openPhoto(i);});ring.append(c);});
const cards=[...ring.children],cardButtons=cards.map(c=>c.querySelector('button'));
const norm=n=>(n%12+12)%12;
function paintRing(){ring.style.transform=`rotateY(${motion.angle}deg)`;const idx=norm(Math.round(-motion.angle/30));if(idx===activePiece)return;activePiece=idx;position.textContent=`${String(idx+1).padStart(2,'0')} / 12`;category.textContent=pieces[idx][2];pieceName.textContent=pieces[idx][1];cardButtons.forEach((b,i)=>{b.tabIndex=i===idx?0:-1;cards[i].setAttribute('aria-hidden',String(i!==idx));});}
function layoutRing(){const radius=innerWidth<=760?270:470;cards.forEach((el,i)=>el.style.transform=`rotateY(${i*30}deg) translateZ(${radius}px)`);paintRing();}
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
function animate(now){const dt=Math.min((now-lastFrame)/1000||0,.05);lastFrame=now;if(ringVisible&&!document.hidden){if(!dragging){const keyboardFocus=keyboardMode&&carousel.contains(document.activeElement);const cruise=!reduced&&!keyboardFocus&&viewer.hidden?autoDirection*2.4:0;advanceRotor(motion,dt,cruise);}paintRing();}requestAnimationFrame(animate);}
layoutRing();requestAnimationFrame(animate);addEventListener('resize',layoutRing);

const groups=[
 {key:'biscuit',tab:'tab-biscuit',prompt:'D’abord, le biscuit.',legend:'Choisir le biscuit',next:'Le cœur du gâteau',options:[['Vanille','Génoise vanille','#e3b978','Une génoise légère et moelleuse, parfumée à la vanille.'],['Chocolat','Chocolat noir','#4a2c1f','Un biscuit au cacao intense, pour les vrais amateurs de chocolat.'],['Pistache','Pistache','#a9b26a','Un biscuit tendre, au goût délicat de pistache.'],['Citron','Citron','#e9cf78','Un biscuit fondant et une pointe de fraîcheur citronnée.']]},
 {key:'insert',tab:'tab-insert',prompt:'Ensuite, le cœur.',legend:'Choisir le cœur du gâteau',next:'La touche de crème',options:[['Framboise','Framboise','#b51d45','Un confit de framboises, fruité et légèrement acidulé.'],['Passion','Passion','#efa21f','Une touche vive et exotique au fruit de la passion.'],['Caramel salé','Caramel beurre salé','#a8652c','Un caramel généreux, relevé d’une pointe de sel.'],['Fruits rouges','Fruits rouges','#7d1830','Une compotée de fruits rouges, tout simplement gourmande.']]},
 {key:'creme',tab:'tab-creme',prompt:'Enfin, la crème.',legend:'Choisir la crème',next:'Et pour votre fête ?',options:[['Mascarpone','Mascarpone vanille','#f7efe2','Une crème onctueuse et légère à la vanille.'],['Chocolat blanc','Chocolat blanc','#f0e4cc','Une ganache montée, douce et fondante.'],['Praliné','Praliné','#c9a07a','Une crème gourmande au praliné noisette.'],['Rose & litchi','Rose et litchi','#f1c4cf','Une association florale et fruitée, tout en délicatesse.']]}
];
const recipe={biscuit:0,insert:0,creme:0,tiers:1};let cakeApi=null,currentGroup=0;
const illustrations={biscuit:['vanille','chocolat','pistache','citron'],insert:['framboise','passion','caramel','fruits-rouges'],creme:['mascarpone','chocolat-blanc','praline','rose-litchi']};
const groupTitles=['LE BISCUIT','LE CŒUR','LA CRÈME'];
function renderPalette(){const g=groups[currentGroup];$('#palette-title').textContent=groupTitles[currentGroup];$('.palette-options legend').textContent=g.legend;$('#flavour-options').innerHTML=g.options.map(([label,,color],i)=>`<label class="palette-choice"><input type="radio" name="${g.key}" value="${i}" ${recipe[g.key]===i?'checked':''}><span class="ingredient-sample"><img src="assets/ingredients/${illustrations[g.key][i]}.svg" alt="" width="85" height="85"><i aria-hidden="true">✓</i></span><span class="palette-name">${label}</span></label>`).join('');$('#ingredient-description').textContent=g.options[recipe[g.key]][3];document.querySelectorAll('.flavour-anchor').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===currentGroup)));}
function updateRecipe(){groups.forEach(g=>$('#selected-'+g.key).textContent=g.options[recipe[g.key]][0]);const summary=groups.map(g=>g.options[recipe[g.key]][0]).join(' · ');$('#recipe-summary').textContent=summary;$('.event-recipe').textContent=summary;$('#recipe-canvas').setAttribute('aria-label','Gâteau en coupe 3D : '+summary+'. Glissez pour tourner.');$('#message-result').hidden=true;cakeApi?.set({...recipe});}
document.querySelectorAll('.flavour-anchor').forEach(b=>b.addEventListener('click',()=>{currentGroup=+b.dataset.group;renderPalette();}));
$('#flavour-options').addEventListener('change',e=>{if(!e.target.matches('input[type=radio]'))return;const g=groups[currentGroup];recipe[g.key]=+e.target.value;$('#ingredient-description').textContent=g.options[+e.target.value][3];updateRecipe();});
const eventDialog=$('#event-dialog');document.querySelectorAll('#open-event,#open-contact').forEach(b=>b.addEventListener('click',()=>eventDialog.showModal()));$('.close-event').addEventListener('click',()=>eventDialog.close());eventDialog.addEventListener('click',e=>{if(e.target!==eventDialog)return;const r=eventDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)eventDialog.close();});
$('#guests').addEventListener('change',()=>{$('#guests').value=Math.max(15,Math.min(300,Math.round(+$('#guests').value||15)));$('#message-result').hidden=true;});
$('#event-date').min=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());$('#event-date').addEventListener('change',()=>$('#message-result').hidden=true);$('#occasion').addEventListener('change',()=>$('#message-result').hidden=true);
function makeRequest(){const date=$('#event-date').value;const when=date?' le '+new Intl.DateTimeFormat('fr-FR',{dateStyle:'long'}).format(new Date(date+'T12:00:00')):'';const event=['un mariage','un anniversaire','un événement d’entreprise','une fête'][$('#occasion').selectedIndex];return `Bonjour Emma ! Je prépare ${event}${when} pour ${$('#guests').value} personnes. J’aimerais un gâteau avec un biscuit ${groups[0].options[recipe.biscuit][1].toLowerCase()}, un cœur ${groups[1].options[recipe.insert][1].toLowerCase()} et une crème ${groups[2].options[recipe.creme][1].toLowerCase()}. Pourrions-nous imaginer le décor ensemble ?`;}
$('#event-panel').addEventListener('submit',async e=>{e.preventDefault();if(!e.target.reportValidity())return;const text=makeRequest();$('#message-text').value=text;let copied=false;try{await navigator.clipboard.writeText(text);copied=true;}catch{}$('#message-status').textContent=copied?'Votre demande est copiée. Collez-la dans la conversation avec Emma.':'Copiez votre demande ci-dessous, puis ouvrez Instagram.';$('#message-result').hidden=false;if(!copied){$('#message-text').focus();$('#message-text').select();}});
renderPalette();updateRecipe();

const recipeObserver=new IntersectionObserver(async es=>{if(!es[0].isIntersecting)return;recipeObserver.disconnect();try{const {mountCake}=await import('./cake3d.js');cakeApi=await mountCake($('#recipe-canvas'),{...recipe});$('.recipe-loading').hidden=true;$('#recipe-canvas').classList.add('is-ready');}catch(e){$('.recipe-loading').hidden=true;$('.cake-live-fallback').hidden=false;console.warn('Aperçu 3D indisponible : les choix de saveurs restent disponibles.');}},{rootMargin:'400px'});recipeObserver.observe($('#recipe-canvas'));

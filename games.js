(() => {
  'use strict';
  let cleanup = () => {};
  let wired = false;
  const styles = document.createElement('style');
  styles.textContent = `
    .ug-title{font:500 clamp(27px,7vw,38px)/1.1 Georgia,serif;margin:8px 0 12px;color:#362044}.ug-copy{line-height:1.6;color:#66556e;margin:0 0 16px}.ug-bar{display:flex;justify-content:space-between;gap:12px;align-items:center;min-height:42px;margin:10px 0;color:#594466;font-size:14px}.ug-status{min-height:48px;line-height:1.5;margin:14px 0;color:#594466}.ug-button{font:inherit;cursor:pointer;border:0;border-radius:18px;min-height:48px;padding:12px 20px;background:#79608c;color:white;touch-action:manipulation}.ug-button:focus-visible,.ug-card:focus-visible,.ug-target:focus-visible,.ug-star:focus-visible{outline:3px solid #df946b;outline-offset:4px}.ug-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.ug-card{border:1px solid #d3bce2;border-radius:16px;aspect-ratio:1;min-height:64px;background:#d9c7eb;color:#554161;font-size:27px;cursor:pointer;touch-action:manipulation;transition:background .2s,transform .2s}.ug-card[aria-pressed=true]{background:#fff9f1;transform:translateY(-2px)}.ug-card.ug-matched{background:#dae7da;border-color:#b3cbb4;color:#365640}.ug-field{position:relative;isolation:isolate;height:300px;max-height:40dvh;min-height:240px;overflow:hidden;border-radius:24px;background:radial-gradient(ellipse at 20% 10%,#665176,transparent 65%),#2c1e3b;color:#fff6dc}.ug-field::before{content:'';position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,#e8d9ff8a 1px,transparent 1.7px);background-size:38px 43px;opacity:.35}.ug-target{position:absolute;left:calc(50% - 30px);top:calc(50% - 30px);width:60px;height:60px;border:1px solid #ffe1a0;border-radius:50%;background:#ffe7b8;color:#5d3b42;font-size:32px;cursor:pointer;touch-action:manipulation;box-shadow:0 0 30px #ffe2a032}.ug-start{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;white-space:nowrap}.ug-star{position:absolute;width:52px;height:52px;transform:translate(-50%,-50%);border:1px solid #e4c8fd8a;background:#544164;border-radius:50%;color:#fff2ca;cursor:pointer;font:18px system-ui;touch-action:manipulation;z-index:2}.ug-star.ug-lit{background:#f4d8a7;color:#523747;box-shadow:0 0 24px #f4d8a740}.ug-lines{position:absolute;width:100%;height:100%;inset:0;pointer-events:none;z-index:1}.ug-actions{display:flex;gap:10px;flex-wrap:wrap}.ug-note{font-size:12px;color:#796a80;line-height:1.5}@media(max-width:370px){.ug-grid{gap:6px}.ug-card{font-size:24px;min-height:56px}.ug-field{min-height:220px}}@media(prefers-reduced-motion:reduce){.ug-card{transition:none}.ug-card[aria-pressed=true]{transform:none}}
  `;
  document.head.appendChild(styles);
  const el = (tag, cls, text) => { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; };
  const button = (label, fn, cls = 'ug-button') => { const b = el('button', cls, label); b.type = 'button'; b.addEventListener('click', fn); return b; };
  function win(type) { window.dispatchEvent(new CustomEvent('universe:win', {detail:{game:type}})); }
  function base(content, title, copy) {
    content.replaceChildren(el('h2','ug-title',title),el('p','ug-copy',copy));
    const status = el('p','ug-status',''); status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
    return status;
  }
  function memory(content) {
    const status = base(content,'Совпадения случаются','Найди шесть пар. Открывай по две карточки — здесь можно никуда не спешить.');
    const bar = el('div','ug-bar'); const movesText = el('span','','Ходов: 0'); const pairsText = el('span','','Пар: 0 / 6'); bar.append(movesText,pairsText);
    const grid = el('div','ug-grid'); grid.setAttribute('aria-label','Двенадцать карточек');
    content.append(bar,grid,status);
    let deck = ['🌙','🌷','🍓','🪐','🦋','✨'].flatMap((icon,i)=>[{icon,id:i},{icon,id:i}]);
    for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
    let first=null,locked=false,moves=0,pairs=0,timer;
    cleanup=()=>{clearTimeout(timer);locked=true;};
    deck.forEach((card,index)=>{
      const b=button('✦',()=>{
        if(locked||b===first?.b||b.classList.contains('ug-matched'))return;
        b.textContent=card.icon;b.setAttribute('aria-pressed','true');b.setAttribute('aria-label',`Карточка ${index+1}: ${card.icon}`);
        if(!first){first={b,card,index};return;}
        movesText.textContent=`Ходов: ${++moves}`;
        if(first.card.id===card.id){
          [first.b,b].forEach(item=>{item.classList.add('ug-matched');item.setAttribute('aria-disabled','true');});
          first=null;pairsText.textContent=`Пар: ${++pairs} / 6`;status.textContent='Есть пара!';
          if(pairs===6){status.textContent=`Все пары нашлись за ${moves} ходов. Маленькая победа — твоя ✨`;win('memory');}
        }else{
          locked=true;status.textContent='Попробуй другую пару.';const previous=first;
          timer=setTimeout(()=>{[previous.b,b].forEach(item=>{item.textContent='✦';item.setAttribute('aria-pressed','false');item.setAttribute('aria-label',`Закрытая карточка ${deck.indexOf(item===b?card:previous.card)+1}`);});first=null;locked=false;},850);
        }
      },'ug-card');
      b.setAttribute('aria-label',`Закрытая карточка ${index+1}`);b.setAttribute('aria-pressed','false');grid.append(b);
    });
    content.append(button('Ещё раз',()=>memoryRestart()));
    const memoryRestart=()=>{cleanup();memory(content);};
  }
  function stars(content) {
    const status=base(content,'Поймай немного света','За 20 секунд собери хотя бы 8 звёзд. Каждое касание — одна звезда.');
    const bar=el('div','ug-bar');const scoreText=el('span','','Звёзд: 0 / 8');const timeText=el('span','','Осталось: 20 с');bar.append(scoreText,timeText);
    const field=el('div','ug-field');field.setAttribute('aria-label','Поле для ловли звёзд');
    content.append(bar,field,status);
    let interval,active=false,score=0,deadline=0;
    cleanup=()=>{active=false;clearInterval(interval);};
    const target=button('★',()=>{if(!active)return;if(performance.now()>=deadline){finish();return;}score++;scoreText.textContent=`Звёзд: ${score} / 8`;position();},'ug-target');
    target.setAttribute('aria-label','Поймать звезду');
    function position(){const width=field.clientWidth;const height=field.clientHeight;target.style.left=`${8+Math.random()*Math.max(0,width-76)}px`;target.style.top=`${8+Math.random()*Math.max(0,height-76)}px`;}
    function finish(){if(!active)return;active=false;clearInterval(interval);target.remove();timeText.textContent='Время вышло';status.textContent=score>=8?`Поймано ${score} звёзд! Небо стало чуточку ярче ✨`:`Поймано ${score} звёзд. Можно попробовать ещё раз — без спешки и рекордов.`;if(score>=8)win('stars');restart.focus();}
    const start=button('Начать · 20 секунд',()=>{start.remove();active=true;deadline=performance.now()+20000;field.append(target);position();target.focus();status.textContent='Лови свет!';interval=setInterval(()=>{const left=Math.max(0,Math.ceil((deadline-performance.now())/1000));timeText.textContent=`Осталось: ${left} с`;if(left===0)finish();},150);},'ug-button ug-start');field.append(start);
    const restart=button('Сначала',()=>{cleanup();stars(content);});content.append(restart,el('p','ug-note','С клавиатурой: Tab до звезды, затем Enter или пробел.'));
  }
  function constellation(content) {
    const status=base(content,'Твоё созвездие','Соедини пять звёзд по порядку: от 1 до 5. Иногда для красоты нужно совсем немного.');
    const field=el('div','ug-field');const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('ug-lines');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');field.append(svg);
    const points=[[16,66],[34,30],[53,53],[70,22],[84,62]];let next=0;cleanup=()=>{};
    const buttons=[];
    points.forEach(([x,y],index)=>{
      const b=button(`${index+1}`,()=>{
        if(index<next)return;
        if(index!==next){status.textContent=`Сейчас очередь звезды ${next+1}.`;return;}
        b.classList.add('ug-lit');b.setAttribute('aria-label',`Звезда ${index+1}, соединена`);b.setAttribute('aria-pressed','true');
        if(index>0){const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',points[index-1][0]);line.setAttribute('y1',points[index-1][1]);line.setAttribute('x2',x);line.setAttribute('y2',y);line.setAttribute('stroke','#f4d8a7');line.setAttribute('stroke-width','.7');svg.append(line);}
        next++;if(next===5){status.textContent='Пять маленьких огней. Одно особенное созвездие ✨';win('constellation');}else{status.textContent=`Красиво! Теперь звезда ${next+1}.`;buttons[next].focus();}
      },'ug-star');b.style.left=`${x}%`;b.style.top=`${y}%`;b.setAttribute('aria-label',`Соединить звезду ${index+1}`);b.setAttribute('aria-pressed','false');buttons.push(b);field.append(b);
    });
    content.append(field,status,button('Зажечь заново',()=>{cleanup();constellation(content);}));status.textContent='Начни со звезды 1.';
  }
  window.UniverseGames={open(type){
    const dialog=document.getElementById('gameDialog');const content=document.getElementById('gameContent');if(!dialog||!content)return;
    cleanup();if(!wired){dialog.addEventListener('close',()=>cleanup());dialog.addEventListener('cancel',()=>cleanup());document.getElementById('closeGame')?.addEventListener('click',()=>{cleanup();if(dialog.open)dialog.close();});wired=true;}
    const aliases={catch:'stars',catcher:'stars',connect:'constellation'};type=aliases[type]||type;
    ({memory,stars,constellation}[type]||memory)(content);if(!dialog.open)dialog.showModal();
  }};
})();

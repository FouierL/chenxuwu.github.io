/* Original ceramic studies inspired by newyellow's Zen Pots.
   https://openprocessing.org/@newyellow/2036000 */
(() => {
  'use strict';

  // Each cubic traces the right side of a thrown vessel from lip to foot.
  // The profile is reflected about the wheel axis to close the silhouette.
  const forms = {
    bowl: { aspect: 1.82, height: .41, mouth: 48, side: [
      [50, 4, 50, 9, 48, 14], [45, 37, 36, 69, 23, 81],
      [17, 87, 17, 87, 19, 91], [22, 95, 21, 98, 20, 98]
    ] },
    bottle: { aspect: .58, height: .86, mouth: 19, side: [
      [23, 1, 23, 5, 19, 6], [14, 7, 15, 18, 16, 27],
      [17, 38, 43, 44, 46, 58], [50, 72, 42, 91, 32, 98]
    ] },
    pear: { aspect: .75, height: .73, mouth: 16, side: [
      [21, 2, 18, 6, 14, 8], [9, 22, 19, 36, 29, 47],
      [47, 64, 52, 76, 43, 87], [38, 94, 27, 95, 28, 98]
    ] },
    vase: { aspect: .82, height: .68, mouth: 39, side: [
      [46, 1, 43, 7, 32, 10], [24, 13, 24, 23, 31, 31],
      [37, 39, 52, 45, 48, 61], [46, 78, 31, 90, 29, 98]
    ] },
    jar: { aspect: 1.22, height: .48, mouth: 33, side: [
      [39, 1, 38, 7, 31, 9], [27, 13, 30, 18, 35, 20],
      [51, 29, 54, 57, 44, 75], [36, 89, 21, 89, 25, 95],
      [28, 97, 27, 98, 25, 98]
    ] }
  };

  // Shadow, body and light glazes, followed by the reserved slip decoration.
  const glazes = [
    ['#78463b', '#ad6651', '#ca8971', '#ead2ac'],
    ['#596952', '#86947a', '#aab49b', '#e4e2bb'],
    ['#876a45', '#b39262', '#c9ae80', '#f0dfb6'],
    ['#495c61', '#73888b', '#9aa7a2', '#d3ddcd']
  ];
  const turn = 2 * Math.PI;

  function randomSource(seed) {
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function outline({ mouth, side }) {
    const shape = new Path2D();
    shape.moveTo(-mouth, 0);
    shape.lineTo(mouth, 0);
    side.forEach(curve => shape.bezierCurveTo(...curve));
    const foot = side[side.length - 1][4];
    shape.quadraticCurveTo(0, 102, -foot, 98);
    for (let i = side.length - 1; i >= 0; i--) {
      const [x1, y1, x2, y2] = side[i];
      const previous = i > 0 ? side[i - 1] : [0, 0, 0, 0, mouth, 0];
      shape.bezierCurveTo(-x2, y2, -x1, y1, -previous[4], previous[5]);
    }
    shape.closePath();
    return shape;
  }
  Object.values(forms).forEach(form => { form.outline = outline(form); });

  function sprig(ctx, x, y, scale, direction) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(direction * scale, scale);
    ctx.lineWidth = .85;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#74604a';
    ctx.stroke(new Path2D('M0 0 Q-2 -9 5 -16 Q11 -22 12 -29 ' +
      'M-1 -6 Q-5 -12 -11 -13 M4 -16 Q2 -21 3 -24 M7 -19 Q14 -19 18 -23 ' +
      'M9 -21 Q12 -18 16 -16 M13 -18 L14 -14 M15 -17 L18 -14'));
    const blade = new Path2D('M0 0 Q-2 -1 -2.5 -3 L-4 -5 L-2.2 -4.5 ' +
      'L-3 -7.2 L-1.3 -6.5 L0 -10 L1 -6.8 L2.8 -7.2 L2 -4.5 L3.5 -5 Q3 -2 0 0Z');
    for (const [lx, ly, angle] of [[-10, -13, -1.12], [3, -23, -.42], [17, -22, 1.03]]) {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);
      ctx.fillStyle = '#788366';
      ctx.fill(blade);
      ctx.restore();
    }
    for (const [bx, by, radius] of [[15.7,-15.5,2], [14,-12.6,2.2], [18.4,-12.2,2]]) {
      ctx.beginPath();
      ctx.fillStyle = '#9e473b';
      ctx.arc(bx, by, radius, 0, turn);
      ctx.fill();
      ctx.fillStyle = '#d9ae84';
      ctx.fillRect(bx - .85, by - .9, .85, .8);
    }
    ctx.restore();
  }

  function vessel(ctx, pot, x, floor, scale, roomAbove) {
    const { form, glaze, seed } = pot;
    const random = randomSource(seed);
    const h = pot.height * scale;
    const w = h * form.aspect;
    const shoulder = floor - h;
    ctx.save();
    ctx.translate(x, shoulder);
    ctx.scale(w / 100, h / 100);
    const clay = ctx.createLinearGradient(-50, 0, 50, 0);
    clay.addColorStop(0, glaze[0]);
    clay.addColorStop(.26, glaze[1]);
    clay.addColorStop(.58, glaze[2]);
    clay.addColorStop(.86, glaze[1]);
    clay.addColorStop(1, glaze[0]);
    ctx.fillStyle = clay;
    ctx.fill(form.outline);
    ctx.save();
    ctx.clip(form.outline);

    // Slip bands dip toward the viewer on the curved wall of the pot.
    ctx.lineWidth = Math.min(2.2, 60 / h);
    ctx.strokeStyle = glaze[3];
    const firstBand = 14 + random() * 24;
    for (let i = 0; i < 3; i++) {
      const level = firstBand + i * 5;
      ctx.beginPath();
      ctx.moveTo(-52, level);
      ctx.quadraticCurveTo(-2, level + 13, 52, level);
      ctx.stroke();
    }
    ctx.fillStyle = glaze[0];
    ctx.globalAlpha = .75;
    ctx.beginPath();
    const count = Math.round(w * h * .52);
    for (let i = 0; i < count; i++) {
      const dx = random() * 100 - 50;
      const dy = random() * 100;
      if (random() > .12 + .4 * (1 - (dx + 50) / 100) + .24 * Math.pow(dy / 100, 3)) continue;
      const radius = .14 + random() * .36;
      const rx = 100 * radius / w;
      ctx.moveTo(dx + rx, dy);
      ctx.ellipse(dx, dy, rx, 100 * radius / h, 0, 0, turn);
    }
    ctx.fill();
    ctx.restore();
    ctx.restore();

    const rim = form.mouth * w / 100;
    const lip = Math.max(.65, rim * .16);
    ctx.lineWidth = Math.min(.85, .42 + rim * .025);
    ctx.beginPath();
    ctx.ellipse(x, shoulder, rim, lip, 0, 0, turn);
    ctx.fillStyle = glaze[0];
    ctx.fill();
    ctx.strokeStyle = glaze[3];
    ctx.stroke();
    if (pot.twig) sprig(ctx, x, shoulder + .15, Math.min(h / 35, roomAbove / 34), pot.direction);
  }

  function mount(canvas, index, desiredCount, seed) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const random = randomSource(seed);
    const names = Object.keys(forms);
    const pots = [];
    for (let i = 0; i < desiredCount; i++) {
      // Keep the News bottle (and occasional later one) even on a narrow shelf.
      const twig = i === 0 && (index === 0 || index === 3 || index === 5);
      const form = twig ? forms.bottle : forms[names.splice(Math.floor(random() * names.length), 1)[0]];
      if (twig) names.splice(names.indexOf('bottle'), 1);
      pots.push({
        form, twig, direction: random() < .5 ? 1 : -1,
        height: (twig ? .55 : form.height) * (.92 + .12 * random()),
        glaze: glazes[(index + i + (twig ? 0 : 1)) % glazes.length],
        seed: Math.floor(random() * 4294967296),
        gapWeight: .85 + random() * .30
      });
    }

    const insetVariation = random();
    function paint() {
      const { width, height } = canvas.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      const dpr = window.devicePixelRatio || 1;
      const pw = Math.round(width * dpr);
      const ph = Math.round(height * dpr);
      if (canvas.width === pw && canvas.height === ph && canvas.dataset.painted) return;
      canvas.width = pw;
      canvas.height = ph;
      ctx.setTransform(pw / width, 0, 0, ph / height, 0, 0);

      const capacity = width < 82 ? 1 : Math.max(2, Math.floor(width / (height * .68 + 5)));
      const group = pots.slice(0, capacity);
      if (group.length > 1) [group[0], group[1]] = [group[1], group[0]];
      // Give each composition its own breathing room along the shelf.
      // A spray leans beyond its bottle, so reserve room for its leaves.
      const wide = width >= 155;
      const lastPot = group[group.length - 1];
      const inset = (wide ? 14 : 8) + insetVariation * (wide ? 10 : 5);
      const right = Math.min(width * .32, inset + (lastPot.twig ? height * .19 : 0));
      const available = Math.max(1, width - right - 3);
      const units = group.reduce((sum, pot) => sum + pot.height * pot.form.aspect, 0);
      const gapUnits = group.slice(1).reduce((sum, pot) => sum + pot.gapWeight, 0);
      const scale = Math.min(height - 2, available / (units + .13 * gapUnits));
      const preferredGap = height * (wide ? .72 : .34);
      const gap = gapUnits ? Math.min(preferredGap, (available - units * scale) / gapUnits) : 0;
      let left = width - right - units * scale - gapUnits * gap;
      for (const [i, pot] of group.entries()) {
        const w = pot.height * scale * pot.form.aspect;
        if (i) left += pot.gapWeight * gap;
        vessel(ctx, pot, left + w / 2, height - .5, scale, height - pot.height * scale - 2);
        left += w;
      }
      canvas.dataset.painted = 'true';
    }
    paint();
    if ('ResizeObserver' in window) new ResizeObserver(paint).observe(canvas);
    else window.addEventListener('resize', paint);
  }

  // Rotate the sequence so there is always a mix of solitary pots and groups.
  const newsCount = Math.random() < .5 ? 2 : 3;
  const counts = [1, 3, 2, 4, 2];
  if (Math.random() < .5) counts.reverse();
  let start = Math.floor(Math.random() * counts.length);
  if (counts[start] === newsCount) start++;
  document.querySelectorAll('.page__content > h2[id]').forEach((heading, index) => {
    if (heading.querySelector('.zen-pots')) return;
    const count = index === 0 ? newsCount : counts[(start + index - 1) % counts.length];
    const canvas = document.createElement('canvas');
    canvas.className = 'zen-pots';
    canvas.setAttribute('aria-hidden', 'true');
    heading.appendChild(canvas);
    mount(canvas, index, count, Math.floor(Math.random() * 4294967296));
  });
})();

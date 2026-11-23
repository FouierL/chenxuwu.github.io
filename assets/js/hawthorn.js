/* A hawthorn sprig in ink and stipple, after the branching studies in
   newyellow's Zen Pots: https://openprocessing.org/@newyellow/2036000 */
(() => {
  'use strict';

  const width = 420;
  const height = 290;
  const tau = 2 * Math.PI;
  const bark = '#675144';

  // Replay the same marks when a particular sprig changes size.
  function makeRandom(seed) {
    return () => {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function stroke(ctx, path, ink, weight) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = weight;
    ctx.stroke(new Path2D(path));
  }

  function branch(ctx, random) {
    const wood = new Path2D(
      'M 426,-5 C 403,10 381,26 358,39 Q 341,47 322,48 ' +
      'C 305,49 297,62 276,70 Q 263,77 246,80 C 229,84 219,101 202,112 ' +
      'Q 193,120 178,126 C 157,134 151,150 130,159 Q 115,167 103,169 ' +
      'C 84,174 75,192 46,200 Q 75,194 89,181 Q 97,173 106,172 ' +
      'Q 120,169 132,162 C 154,154 161,135 180,129 Q 194,124 205,115 ' +
      'C 223,103 231,88 247,84 Q 265,81 279,74 C 300,65 307,53 323,53 ' +
      'Q 344,51 362,43 C 388,28 407,17 427,4 Z'
    );
    ctx.fillStyle = bark;
    ctx.fill(wood);
    ctx.save();
    ctx.clip(wood);
    // Broken slivers follow the grain of the older wood.
    ctx.strokeStyle = '#a78b69';
    ctx.lineWidth = 0.42;
    ctx.beginPath();
    for (let i = 0; i < 3000; i++) {
      const x = random() * width;
      const y = (width - x) * 0.54 + (random() - 0.5) * 37;
      ctx.moveTo(x, y);
      ctx.lineTo(x + 1 + 5 * random(), y - random() * 3);
    }
    ctx.stroke();
    ctx.restore();

    stroke(ctx,
      'M 355,42 Q 342,36 327,33 Q 302,35 278,22 ' +
      'M 327,33 Q 316,24 314,18 M 304,30 Q 294,35 285,36 ' +
      'M 372,35 Q 365,47 367,63 T 353,99 Q 350,107 350,114 ' +
      'M 365,75 Q 377,73 384,65 M 356,95 Q 360,101 368,104 ' +
      'M 302,59 Q 295,80 280,90 M 280,90 Q 274,95 272,103 ' +
      'M 247,82 Q 247,94 242,104 Q 233,119 237,134 ' +
      'M 240,109 Q 250,117 257,117 M 235,126 Q 227,132 221,134 ' +
      'M 218,100 Q 208,98 202,92 Q 194,74 175,68 ' +
      'M 199,87 Q 190,92 182,90 ' +
      'M 177,128 Q 176,146 166,159 M 143,153 Q 129,149 117,143 ' +
      'M 112,169 Q 105,183 108,194 Q 113,204 109,213 ' +
      'M 108,191 Q 116,194 121,195 M 78,187 Q 70,178 65,172',
      bark, 1.25);
    // Short, solitary thorns at the nodes.
    ctx.fillStyle = bark;
    ctx.fill(new Path2D('M 335,48 Q 338,41 338,34 Q 340,41 338,49 Z ' +
      'M 197,119 Q 198,113 195,105 Q 200,112 200,118 Z ' +
      'M 92,178 Q 84,178 80,180 Q 85,176 94,176 Z'));
  }

  const foliage = [
    ['#aeb293', '#7d896d', '#566c56'],
    ['#bbc0a1', '#91a086', '#687d66'],
    ['#a6a87c', '#889066', '#657554'],
    ['#b8ad82', '#9b9c72', '#798265']
  ];

  // Each raised tip points out along a lateral vein. Smaller teeth break up
  // the outside of each lobe, leaving the sinuses deep and open.
  const margin = [
    [0, 0], [.10, .25], [.19, .61], [.38, .99], [.32, .49],
    [.47, .80], [.61, .95], [.53, .32], [.69, .62],
    [.79, .62], [.72, .29], [.88, .32], [1, 0]
  ];

  function leaf(ctx, random, x, y, angle, length, breadth, tone, curl) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180);
    const stalk = length * .18;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(stalk * .55, 1.2, stalk, 0);
    ctx.strokeStyle = '#797354';
    ctx.lineWidth = .9;
    ctx.stroke();
    ctx.translate(stalk, 0);
    const axis = t => Math.sin(t * Math.PI * .83) * curl;
    const outline = new Path2D();
    for (const side of [-1, 1]) {
      const edge = [[0, 0]];
      for (let i = 1; i < margin.length; i++) {
        const [p, h] = margin[i - 1];
        const [q, k] = margin[i];
        const t = (p + q) / 2;
        // The two halves fold by different amounts around the midrib.
        const fold = side === 1 ? 1 - .13 * curl / 5 : 1;
        const skew = side === 1 ? .045 * Math.sin(Math.PI * q) : 0;
        if (q - p > .08 && i > 1) {
          edge.push([(t + .019) * length, axis(t) + side * ((h + k) / 2 + .06) * breadth * fold]);
          edge.push([t * length, axis(t) + side * (h + k) / 2 * breadth * fold]);
        }
        edge.push([(q + skew) * length, axis(q) + side * k * breadth * fold]);
      }
      if (side === 1) edge.reverse();
      for (const [px, py] of edge) outline.lineTo(px, py);
    }
    outline.closePath();
    const palette = foliage[tone];
    const wash = ctx.createLinearGradient(0, -breadth, length * .12, breadth);
    wash.addColorStop(0, palette[0]);
    wash.addColorStop(.54, palette[1]);
    wash.addColorStop(1, palette[2]);
    ctx.fillStyle = wash;
    ctx.fill(outline);
    ctx.strokeStyle = palette[2];
    ctx.lineWidth = .55;
    ctx.stroke(outline);

    ctx.clip(outline);
    ctx.fillStyle = 'rgba(53,68,43,.33)';
    ctx.beginPath();
    for (let i = 0; i < length * breadth * .35; i++) {
      const px = random() * length;
      const py = axis(px / length) + (random() * 2 - 1) * breadth;
      const r = .13 + .37 * random();
      ctx.moveTo(px + r, py);
      ctx.arc(px, py, r, 0, tau);
    }
    ctx.fill();

    ctx.beginPath();
    for (const side of [-1, 1]) {
      const spread = side === -1 ? 1 : .92;
      for (const [root, tip, depth] of [[.09,.38,.99], [.25,.61,.91], [.46,.79,.62], [.67,.88,.32]]) {
        const end = (tip + (side === 1 ? .025 : 0)) * length;
        const tipY = axis(tip) + side * depth * breadth * spread;
        ctx.moveTo(root * length, axis(root));
        ctx.quadraticCurveTo((root + .10) * length, axis(root) + side * .12 * breadth, end, tipY);
        ctx.moveTo((root * .35 + tip * .65) * length, axis(tip) + side * depth * breadth * .53);
        ctx.lineTo(end - length * .075, tipY);
      }
    }
    ctx.strokeStyle = 'rgba(225,224,184,.78)';
    ctx.lineWidth = .59;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(length * .33, axis(.33) * 1.16, length * .71, axis(.71) * 1.16, length, axis(1));
    ctx.lineWidth = .90;
    ctx.stroke();
    ctx.restore();
  }

  const reds = [
    ['#da8a64', '#b7473b', '#813933'],
    ['#c77656', '#a83f3b', '#753633'],
    ['#de936c', '#be5141', '#903c36'],
    ['#c16e50', '#9c4240', '#733633']
  ];

  function fruit(ctx, random, x, y, size, tone) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((random() - .5) * .6);
    ctx.scale(size, size);
    const rind = new Path2D('M 0,-.89 C .52,-1.04 .96,-.61 .98,-.08 ' +
      'C 1.02,.49 .65,.94 .13,.99 C -.47,1.04 -.94,.64 -.99,.09 ' +
      'C -1.07,-.52 -.69,-1.05 0,-.89 Z');
    const palette = reds[tone];
    const wash = ctx.createRadialGradient(-.38, -.43, .05, -.17, -.13, 1.16);
    palette.forEach((color, i) => wash.addColorStop(i / 2, color));
    ctx.fillStyle = wash;
    ctx.fill(rind);
    ctx.clip(rind);
    // Stippled shade, then the small cream lenticels of the ripe fruit.
    ctx.fillStyle = 'rgba(82,40,31,.36)';
    ctx.beginPath();
    for (let i = 0; i < 170; i++) {
      const px = random() * 2 - 1;
      const py = random() * 2 - 1;
      if (random() > .55 + (px + py) * .28) continue;
      const r = .012 + random() * .030;
      ctx.moveTo(px + r, py);
      ctx.arc(px, py, r, 0, tau);
    }
    ctx.fill();
    ctx.fillStyle = '#e2b58c';
    for (let i = 0; i < 15; i++) {
      const px = (random() * 2 - 1) * .87;
      const py = (random() * 2 - 1) * .87;
      ctx.beginPath();
      ctx.ellipse(px, py, .028 + random() * .029, .022 + random() * .021, -.35, 0, tau);
      ctx.fill();
    }
    ctx.translate((random() - .45) * .88, .40 + random() * .35);
    ctx.scale(1, .70);
    ctx.rotate(random() * tau);
    ctx.fillStyle = '#633c31';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5;
      const r = i % 2 ? .088 : .23 + random() * .07;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function cluster(ctx, random, x, y, berries) {
    ctx.lineWidth = .90;
    ctx.strokeStyle = '#85765b';
    ctx.beginPath();
    for (const [px, py, size] of berries) {
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + (px - x) * .15, y + 7,
        px - 3, py - size - 11, px, py - size * .77);
    }
    ctx.stroke();
    for (const berry of berries) fruit(ctx, random, ...berry);
  }

  function draw(ctx, seed) {
    const random = makeRandom(seed);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    branch(ctx, random);
    // Each entry gives a petiole attachment, direction, blade dimensions,
    // ink palette and bend of the midrib. Some blades turn edge-on.
    const leaves = [
      [314,18,-170,28,8,1,2], [278,22,176,40,11,2,-3],
      [285,36,151,31,10,1,-2], [384,65,-31,25,8,2,3],
      [368,104,29,39,11,0,5], [280,90,135,28,8,2,3],
      [272,103,92,34,12,1,-4], [175,68,-153,40,12,2,-4],
      [182,90,168,34,10,1,-2], [257,117,20,44,13,0,3],
      [221,134,138,26,8,3,2], [166,159,101,38,12,0,-4],
      [117,143,-140,33,10,1,3], [65,172,-143,28,8,2,-2],
      [46,200,160,31,9,1,-3], [121,195,28,24,7,3,1]
    ];
    for (const [x, y, angle, length, breadth, tone, curl] of leaves) {
      const tilt = angle + (random() - .5) * 9;
      leaf(ctx, random, x, y, tilt, length, breadth, tone, curl);
    }
    cluster(ctx, random, 350,114, [
      [332,134,7.6,3], [365,141,9.4,2], [345,149,10.8,1], [358,159,9.1,0]
    ]);
    cluster(ctx, random, 237,134, [
      [218,157,8.4,3], [248,157,8.5,1], [231,169,11.4,0],
      [252,176,10.3,2], [236,186,9.5,1]
    ]);
    cluster(ctx, random, 109,213, [
      [94,229,7.6,2], [114,235,9.4,1], [100,246,8.7,0]
    ]);
  }

  function mount(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const seed = Math.floor(Math.random() * 4294967296);
    let previousWidth = 0;
    let previousHeight = 0;
    function resize() {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const ratio = window.devicePixelRatio || 1;
      const pixelWidth = Math.max(1, Math.round(bounds.width * ratio));
      const pixelHeight = Math.max(1, Math.round(bounds.height * ratio));
      if (pixelWidth === previousWidth && pixelHeight === previousHeight) return;
      canvas.width = previousWidth = pixelWidth;
      canvas.height = previousHeight = pixelHeight;
      const scale = Math.min(pixelWidth / width, pixelHeight / height);
      ctx.setTransform(scale, 0, 0, scale, (pixelWidth - scale * width) / 2, (pixelHeight - scale * height) / 2);
      draw(ctx, seed);
      canvas.classList.add('is-drawn');
    }
    resize();
    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }
  }

  document.querySelectorAll('.hawthorn-art').forEach(mount);
})();

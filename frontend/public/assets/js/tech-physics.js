/* ============================================================
   Sec-5 "My Tech Stack" — Matter.js silhouette physics scene
   ------------------------------------------------------------
   Reuses the template throwable mechanism (matter.js engine +
   drop/bounce/stack behaviour) but replaces the rectangular
   bodies with convex-hull silhouette polygons derived from each
   logo's real outline, so every logo's physics body follows its
   own shape.

   Rendering:
   - Each logo <img> is sized to its body's local bounding box and
     painted around the body's centroid, so the visible silhouette
     always coincides with the physics body (no clipping, no
     floating) at any rotation.
   - Data-driven: the tech list lives in TECH_ITEMS below.
   - One rAF-driven pass updates the DOM <img> transforms.
   - Pauses off-screen, drops once on first view.
   - Rebuilds on (debounced) resize with fewer/smaller on mobile.
   - Honours prefers-reduced-motion with a settled static layout.
   ============================================================ */
(function () {
  "use strict";

  var M = window.Matter;
  if (!M) {
    return;
  }

  if (window.decomp && M.Common && typeof M.Common.setDecomp === "function") {
    try {
      M.Common.setDecomp(window.decomp);
    } catch (err) {
      /* decomp is optional; convex bodies still work without it */
    }
  }

  /* ------------------------------------------------------------
     Data array — single source of truth for the tech stack.
     verts are convex-hull silhouette polygons (derived from each
     logo's SVG outline), normalised to a ~[-50,50] box (longest
     axis = 100) and centred on the bounding-box centre.
     ------------------------------------------------------------ */
  var TECH_ITEMS = [
    {
      key: "docker",
      name: "Docker",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/docker.svg",
      size: 115,
      verts: [[-50, 0.8], [-29.1, -22.6], [-3.5, -36.5], [6.4, -35.7], [33.1, -19.9], [48.1, -10.2], [50, -4.6], [18.6, 26.4], [4.9, 33.6], [-10.4, 36.4], [-25.9, 35.5], [-40, 29.4], [-47.9, 16.2]]
    },
    {
      key: "kubernetes",
      name: "Kubernetes",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/kubernetes.svg",
      size: 120,
      verts: [[-50, 12.2], [-41.7, -25.3], [-37.9, -31.6], [-3.3, -48.2], [4.1, -47.8], [38.7, -31.2], [42, -24.5], [50, 13], [24.1, 46.2], [17, 48.2], [-13.8, 48.2], [-21.4, 47.8], [-26.9, 42.7]]
    },
    {
      key: "linux",
      name: "Linux",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/linux.svg",
      size: 110,
      verts: [[-40.4, 42.3], [-40.3, 26.8], [-11.5, -43.3], [-5.8, -48.6], [2, -50], [11.4, -46.9], [32, 3.2], [40.4, 32], [38, 38.5], [25.1, 47.7], [17.6, 50], [-17.7, 48.9]]
    },
    {
      key: "aws",
      name: "AWS",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/aws.svg",
      size: 120,
      verts: [[-50, 12.2], [-44.4, -28.3], [-37.9, -30.3], [38.4, -30.3], [44.3, -27.4], [50, 9.1], [46.6, 22.2], [42, 25.5], [7.3, 29.9], [-13.2, 29.4], [-32.8, 23.4]]
    },
    {
      key: "terraform",
      name: "Terraform",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/terraform.svg",
      size: 106,
      verts: [[-44, -50], [44, -32.4], [44, -2.9], [13.7, 50], [-11.8, 35.3], [-13.7, 32.1], [-44, -20.5]]
    },
    {
      key: "git",
      name: "Git",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/git.svg",
      size: 101,
      verts: [[-50, 0.1], [-48.8, -3.9], [-1.9, -49.9], [5.7, -47.3], [50, -1.5], [46.8, 5.9], [0.9, 49.9], [-6.4, 46.2], [-48.5, 4]]
    },
    {
      key: "nginx",
      name: "Nginx",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/nginx.svg",
      size: 106,
      verts: [[-43.4, 21.7], [-41.9, -25.8], [0, -50], [42.4, -25.5], [43.4, 22.3], [41.6, 26.1], [3.9, 47.9], [-0.2, 50], [-42.1, 25.8]]
    },
    {
      key: "github-actions",
      name: "GitHub Actions",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/github-actions.svg",
      size: 106,
      verts: [[-49.9, -28.3], [-48.1, -38], [-42, -45.9], [-32.9, -50], [-23, -49.5], [47.4, -6.9], [49.9, 39.1], [44.4, 47.2], [34.9, 50], [-5.8, 49.5], [-28.3, 32.6], [-33, 23.9]]
    },
    {
      key: "github",
      name: "GitHub",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/github.svg",
      size: 101,
      verts: [[-50, 0.2], [-45.9, -18.5], [-35, -34.4], [-18.9, -44.9], [4.8, -48.4], [23.3, -42.9], [38.2, -30.8], [47.6, -14], [49.9, 5.1], [42.4, 27.9], [29.3, 41.9], [16.4, 48.5], [-16.5, 48.6], [-33.1, 38.9], [-42.5, 27.9], [-48.3, 14.6]]
    },
    {
      key: "ubuntu",
      name: "Ubuntu",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/ubuntu.svg",
      size: 101,
      verts: [[-50, -2.4], [-46.7, -11.8], [-22.7, -38.5], [-3.9, -46], [23.4, -48.1], [30.6, -46.1], [36.9, -38.3], [47.9, -14.1], [50, 1.1], [45.1, 20.7], [32, 41.8], [28.5, 45.5], [18.9, 48.1], [-7.8, 44.9], [-25.9, 35.8], [-36, 24.3]]
    },
    {
      key: "bash",
      name: "Bash",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/bash.svg",
      size: 96,
      verts: [[-43.8, 16.9], [-42.7, -24.1], [-39.2, -28.7], [-3.8, -49.6], [7.4, -47.7], [42, -25.5], [43.8, -19.9], [43.8, 15.4], [41.2, 26.5], [6.3, 48.2], [-4.9, 49], [-35.3, 31], [-43.2, 22.7]]
    },
    {
      key: "python",
      name: "Python",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/python.svg",
      size: 101,
      verts: [[-49.4, -0.5], [-46.2, -16.7], [-21.6, -44.9], [-11.5, -49.1], [4.5, -49.9], [20, -45.1], [42.2, -22.4], [47.6, -13], [49.4, 3.4], [44.6, 19.1], [18.2, 45.6], [7.8, 49.3], [-3.2, 50], [-18.8, 45.1], [-43.6, 20.4], [-48.1, 10.4]]
    },
    {
      key: "go",
      name: "Go",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/go.svg",
      size: 106,
      verts: [[-50, -3.9], [-40.1, -9.2], [-3.9, -18.7], [34.5, -18.3], [45.7, -13.1], [50, -1.7], [46.1, 10], [36.1, 17.3], [-6.6, 18.7], [-14.7, 17.1]]
    },
    {
      key: "javascript",
      name: "JavaScript",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/javascript.svg",
      size: 100,
      verts: [[-50, -38], [-38, -50], [38, -50], [50, -38], [50, 38], [38, 50], [-38, 50], [-50, 38]]
    },
    {
      key: "postgresql",
      name: "PostgreSQL",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/postgresql.svg",
      size: 106,
      verts: [[-48.4, -26.4], [-46.9, -36.4], [-41.4, -44.6], [-32.2, -48.5], [27, -50], [36.7, -47.2], [44.7, -41.1], [48, -31.9], [48.4, 11.3], [18.1, 48.4], [8.3, 50], [-32.9, 20.9], [-42.2, 3.1]]
    },
    {
      key: "helm",
      name: "Helm",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/helm.svg",
      size: 96,
      verts: [[-43.4, 7.6], [-43.4, -6.4], [-27.4, -40.1], [1.4, -50], [31.8, -39.8], [42.8, -10.5], [43.4, 9.8], [30, 40.3], [2.3, 50], [-26.5, 40.1]]
    },
    {
      key: "prometheus",
      name: "Prometheus",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/prometheus.svg",
      size: 106,
      verts: [[-50, 0.5], [-46.3, -18.8], [-35.5, -35.2], [-19.2, -46.2], [0, -50], [17.3, -46.9], [34.1, -36.6], [45.6, -20.7], [50, -1.5], [46.7, 17.8], [36.3, 34.4], [20.2, 45.8], [1, 50], [-18.3, 46.6], [-34.8, 35.9], [-45.9, 19.7]]
    },
    {
      key: "grafana",
      name: "Grafana",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/grafana.svg",
      size: 101,
      verts: [[-45.8, 13.6], [-36.8, -29.9], [-33.6, -33.4], [3.4, -50], [34.4, -36.2], [45.8, -5.8], [43.7, 25.2], [22.3, 47.6], [18.1, 50], [-22.8, 45.7]]
    },
    {
      key: "argocd",
      name: "Argo CD",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/argocd.svg",
      size: 96,
      verts: [[-39.3, -14.8], [-27.1, -38], [-11.5, -47.8], [2.4, -50], [11.5, -48.2], [27.2, -38.3], [32.8, -30.9], [39.3, -14.5], [39.2, -5.1], [21, 43.3], [14.1, 49.3], [-7.7, 50], [-20.4, 43], [-39.3, -5.4]]
    },
    {
      key: "trivy",
      name: "Trivy",
      src: "https://res.cloudinary.com/dvatduo79/image/upload/assets/images/tech/trivy.svg",
      size: 96,
      verts: [[-44.1, -22], [-34.8, -31.5], [-6.8, -47.6], [2.7, -50], [40, -28.5], [44.1, -18.8], [44.1, 24.3], [7.9, 46.6], [-1.3, 50], [-38.5, 28.7], [-44.1, 21.1]]
    },
  ];

  var REDUCE_QUERY =
    window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  function prefersReduced() {
    return !!(REDUCE_QUERY && REDUCE_QUERY.matches);
  }

  /* Fewer + smaller logos on small screens. */
  function pickLayout() {
    var w = window.innerWidth || document.documentElement.clientWidth || 1024;
    if (w < 640) {
      return { count: 16, scale: 0.68 };
    }
    if (w < 1024) {
      return { count: 24, scale: 0.82 };
    }
    return { count: TECH_ITEMS.length, scale: 1 };
  }

  function TechScene(root) {
    this.root = root;
    this.stage = root.querySelector("[data-tech-physics-stage]") || root;
    this.engine = null;
    this.runner = null;
    this.mouse = null;
    this.mouseConstraint = null;
    this.nodes = [];
    this.bodies = [];
    this.dropped = false;
    this.topAdded = false;
    this._tickBound = false;
    this._resizeHandler = this._debounce(this.mount.bind(this), 250);
    this.mount();
    this._bindGlobal();
  }

  TechScene.prototype._debounce = function (fn, wait) {
    var t = null;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  };

  TechScene.prototype._bindGlobal = function () {
    var self = this;
    window.addEventListener("resize", this._resizeHandler);
    if (REDUCE_QUERY) {
      var onChange = function () {
        self.mount();
      };
      if (typeof REDUCE_QUERY.addEventListener === "function") {
        REDUCE_QUERY.addEventListener("change", onChange);
      } else if (typeof REDUCE_QUERY.addListener === "function") {
        REDUCE_QUERY.addListener(onChange);
      }
    }
  };

  /* ------------------------------------------------------------
     Lifecycle
     ------------------------------------------------------------ */
  TechScene.prototype.mount = function () {
    this.teardown();
    this.dropped = false;
    this.topAdded = false;

    var reduced = prefersReduced();
    this.stage.classList.toggle("tech-phys-static", reduced);

    var layout = pickLayout();
    this._renderItems(layout);

    if (reduced) {
      return;
    }
    this._initPhysics();
    this._observe();
  };

  TechScene.prototype.teardown = function () {
    if (this._visObs) {
      this._visObs.disconnect();
      this._visObs = null;
    }
    if (this._dropObs) {
      this._dropObs.disconnect();
      this._dropObs = null;
    }
    if (this.runner) {
      try {
        M.Runner.stop(this.runner);
      } catch (err) {}
    }
    if (this.engine) {
      try {
        M.Composite.clear(this.engine.world, false);
        M.Engine.clear(this.engine);
      } catch (err) {}
    }
    if (this.mouse) {
      try {
        var mo = this.mouse;
        this.stage.removeEventListener("mousemove", mo.mousemove);
        this.stage.removeEventListener("mousedown", mo.mousedown);
        this.stage.removeEventListener("mouseup", mo.mouseup);
        this.stage.removeEventListener("mouseleave", mo.mouseup);
        this.stage.removeEventListener("mousewheel", mo.mousewheel);
        this.stage.removeEventListener("DOMMouseScroll", mo.mousewheel);
        this.stage.removeEventListener("touchmove", mo.mousemove);
        this.stage.removeEventListener("touchstart", mo.mousedown);
        this.stage.removeEventListener("touchend", mo.mouseup);
      } catch (err) {}
    }
    this.runner = null;
    this.engine = null;
    this.mouse = null;
    this.mouseConstraint = null;
    this.bodies = [];
    this.nodes = [];
    this._tickBound = false;

    while (this.stage.firstChild) {
      this.stage.removeChild(this.stage.firstChild);
    }
  };

  /* ------------------------------------------------------------
     DOM items (one per tech)
     ------------------------------------------------------------ */
  TechScene.prototype._renderItems = function (layout) {
    var items = TECH_ITEMS.slice(0, layout.count);
    var frag = document.createDocumentFragment();
    var reduced = prefersReduced();
    this.nodes = [];

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var size = it.size * layout.scale;

      /* local bounding box of the silhouette (normalised hull units) */
      var minX = 1e9,
        minY = 1e9,
        maxX = -1e9,
        maxY = -1e9;
      for (var v = 0; v < it.verts.length; v++) {
        var vx = it.verts[v][0];
        var vy = it.verts[v][1];
        if (vx < minX) minX = vx;
        if (vx > maxX) maxX = vx;
        if (vy < minY) minY = vy;
        if (vy > maxY) maxY = vy;
      }
      var scale = size / 100; /* verts normalised so longest axis = 100 */
      var bw = (maxX - minX) * scale;
      var bh = (maxY - minY) * scale;

      var el = document.createElement("div");
      el.className = "tech-phys-item";
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", it.name);
      el.setAttribute("data-key", it.key);
      if (!reduced) {
        el.style.width = bw.toFixed(1) + "px";
        el.style.height = bh.toFixed(1) + "px";
      }

      var img = document.createElement("img");
      img.src = it.src;
      img.alt = "";
      img.draggable = false;
      img.setAttribute("aria-hidden", "true");
      img.setAttribute("decoding", "async");
      if (!reduced) {
        /* fill the body's bounding box exactly (aspect already matches) */
        img.style.objectFit = "fill";
      }
      el.appendChild(img);

      frag.appendChild(el);
      this.nodes.push({
        item: it,
        el: el,
        img: img,
        size: size,
        scale: scale,
        verts: it.verts,
        bw: bw,
        bh: bh,
        ox: 0,
        oy: 0,
        body: null
      });
    }
    this.stage.appendChild(frag);
  };

  /* ------------------------------------------------------------
     Physics
     ------------------------------------------------------------ */
  TechScene.prototype._initPhysics = function () {
    var stage = this.stage;
    var width = stage.offsetWidth;
    var height = stage.offsetHeight;
    this.width = width;
    this.height = height;

    this.engine = M.Engine.create();
    this.engine.gravity.y = 0.9;

    this.runner = M.Runner.create();
    this.runner.enabled = false;

    try {
      this.mouse = M.Mouse.create(stage);
      stage.removeEventListener("mousewheel", this.mouse.mousewheel);
      stage.addEventListener("mouseleave", this.mouse.mouseup);
      this.mouseConstraint = M.MouseConstraint.create(this.engine, {
        mouse: this.mouse,
        constraint: { render: { visible: false } }
      });
      M.Composite.add(this.engine.world, [this.mouseConstraint]);

      M.Events.on(this.mouseConstraint, "mousedown", function () {
        stage.style.pointerEvents = "auto";
      });
      M.Events.on(this.mouseConstraint, "mouseup", function () {
        stage.style.pointerEvents = "";
      });
    } catch (err) {
      this.mouse = null;
    }

    this._createBoundaries();
    this._createBodies();

    M.Runner.start(this.runner, this.engine);
  };

  TechScene.prototype._createBoundaries = function () {
    var w = this.width;
    var h = this.height;
    var opts = { isStatic: true, render: { visible: false } };
    this.boundLeft = M.Bodies.rectangle(-250, h / 2, 500, 4 * h, opts);
    this.boundRight = M.Bodies.rectangle(w + 250, h / 2, 500, 4 * h, opts);
    this.boundBottom = M.Bodies.rectangle(w / 2, h + 250, 2 * w + 1000, 500, opts);
    this.boundTop = null;
    M.Composite.add(this.engine.world, [this.boundLeft, this.boundRight, this.boundBottom]);
  };

  TechScene.prototype._createBodies = function () {
    var width = this.width;
    var nodes = this.nodes;
    var dense = nodes.length > 16;
    var gap = dense ? 30 : 90;

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var s = n.scale;
      var verts = [];
      for (var v = 0; v < n.verts.length; v++) {
        verts.push({ x: n.verts[v][0] * s, y: n.verts[v][1] * s });
      }

      var x = n.bw / 2 + Math.random() * Math.max(1, width - n.bw);
      var y = -n.bh - i * gap - Math.random() * 50;

      /* create at angle 0 so we can read the body's local bounding box */
      var body = M.Bodies.fromVertices(
        x,
        y,
        [verts],
        {
          restitution: 0.3,
          friction: 0.1,
          frictionAir: 0.008,
          density: 0.002
        },
        true
      );

      /* centroid offset from the body's top-left, in px (local frame) */
      n.ox = body.position.x - body.bounds.min.x;
      n.oy = body.position.y - body.bounds.min.y;
      n.el.style.transformOrigin = n.ox.toFixed(1) + "px " + n.oy.toFixed(1) + "px";

      M.Body.setAngle(body, (Math.random() * 2 - 1) * 0.3);
      M.Body.setStatic(body, true);
      M.Composite.add(this.engine.world, body);

      n.body = body;
      this.bodies.push(body);
      this._paint(n);
    }
  };

  /* ------------------------------------------------------------
     Render loop
     ------------------------------------------------------------ */
  TechScene.prototype._paint = function (n) {
    var b = n.body;
    n.el.style.transform =
      "translate(" +
      (b.position.x - n.ox).toFixed(1) +
      "px," +
      (b.position.y - n.oy).toFixed(1) +
      "px) rotate(" +
      b.angle.toFixed(3) +
      "rad)";
  };

  TechScene.prototype._bindTick = function () {
    if (this._tickBound) {
      return;
    }
    this._tickBound = true;
    var self = this;
    M.Events.on(this.runner, "tick", function () {
      if (!self.runner || !self.runner.enabled) {
        return;
      }
      if (!document.body.contains(self.root)) {
        self.runner.enabled = false;
        try {
          M.Runner.stop(self.runner);
        } catch (err) {}
        return;
      }

      for (var i = 0; i < self.nodes.length; i++) {
        var n = self.nodes[i];
        if (n.body) {
          self._paint(n);
        }
      }

      /* Add the ceiling once the whole stack has fallen inside,
         so logos can never escape out of the top afterwards. */
      if (
        !self.topAdded &&
        self.dropped &&
        self.bodies.length &&
        self.bodies[self.bodies.length - 1].position.y > self.height * 0.4
      ) {
        self.topAdded = true;
        self.boundTop = M.Bodies.rectangle(
          self.width / 2,
          -250,
          2 * self.width + 1000,
          500,
          { isStatic: true, render: { visible: false } }
        );
        M.Composite.add(self.engine.world, self.boundTop);
      }
    });
  };

  /* ------------------------------------------------------------
     Observers: pause off-screen + drop once on first view
     ------------------------------------------------------------ */
  TechScene.prototype._observe = function () {
    var self = this;
    this._bindTick();

    if (typeof IntersectionObserver === "undefined") {
      this.runner.enabled = true;
      this._startRain();
      return;
    }

    this._visObs = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (!self.runner) {
            return;
          }
          self.runner.enabled = entries[i].isIntersecting;
        }
      },
      { rootMargin: "150px" }
    );
    this._visObs.observe(this.root);

    this._dropObs = new IntersectionObserver(
      function (entries, obs) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            self._startRain();
            obs.disconnect();
            self._dropObs = null;
          }
        }
      },
      { threshold: 0.2 }
    );
    this._dropObs.observe(this.root);
  };

  TechScene.prototype._startRain = function () {
    if (this.dropped || prefersReduced() || !this.engine) {
      return;
    }
    this.dropped = true;

    var dense = this.bodies.length > 16;
    var stagger = dense ? 55 : 90;

    var bodies = this.bodies.slice();
    for (var i = 0; i < bodies.length; i++) {
      (function (body, index) {
        setTimeout(function () {
          try {
            M.Body.setStatic(body, false);
          } catch (err) {}
        }, stagger * index);
      })(bodies[i], i);
    }
  };

  /* ------------------------------------------------------------
     Boot / re-boot across client-side navigation
     ------------------------------------------------------------ */
  function scan() {
    var els = document.querySelectorAll("[data-tech-physics]");
    for (var i = 0; i < els.length; i++) {
      if (!els[i].getAttribute("data-tech-physics-ready")) {
        els[i].setAttribute("data-tech-physics-ready", "1");
        try {
          new TechScene(els[i]); /* eslint-disable no-new */
        } catch (err) {
          if (window.console && window.console.error) {
            window.console.error("tech-physics init failed", err);
          }
        }
      }
    }
  }

  function scheduleScan() {
    if (scan._t) {
      clearTimeout(scan._t);
    }
    scan._t = setTimeout(scan, 120);
  }

  function boot() {
    if (window.__techPhysicsBooted) {
      scan();
      return;
    }
    window.__techPhysicsBooted = true;
    scan();

    if (typeof MutationObserver !== "undefined") {
      var mo = new MutationObserver(function (records) {
        for (var i = 0; i < records.length; i++) {
          if (records[i].addedNodes && records[i].addedNodes.length) {
            scheduleScan();
            return;
          }
        }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
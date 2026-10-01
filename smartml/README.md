# SmartML

Front-end prototype (Figma -> code). Open `index.html` directly in a browser, no build step.

```
smartml/
├── index.html            # markup for all 4 pages (Home, Classification, Clustering, About)
├── css/
│   ├── tokens.css        # colors, fonts, radius
│   ├── base.css          # reset + typography
│   ├── layout.css        # wrap, grid, page switching, responsive
│   ├── components.css    # nav, card, button, form, table
│   └── pages.css         # page-specific styles
└── js/
    ├── data.js           # pipeline steps, cluster colors
    ├── router.js         # hash router (#home, #classification, ...)
    ├── home.js           # live sensor + edge simulator
    ├── classification.js # demo predictor
    ├── clustering.js     # demo clustering + PCA scatter
    └── main.js           # init
```

Prediction and clustering are demo simulations. Replace the logic in `classification.js` and `clustering.js` with real API calls to plug in a model.

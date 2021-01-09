module.exports = {
  entry: ["./src/ui/index.js"],
  target: "web",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js",
    libraryTarget: "var",
    library: "ui",
  },

  mode: "development",
};

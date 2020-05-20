const fs = require('fs');
const express = require('express');
const { createBundleRenderer } = require('vue-server-renderer');
const app = express();

// const bundle = require('./dist/vue-ssr-server-bundle.json');

// 创建一个 renderer
// const renderer = require('vue-server-renderer').createRenderer({
//   template: fs.readFileSync('./index.html', 'utf-8')
// });

app.get('*', (req, res) => {
  res.status(200);
  res.setHeader("Content-Type","text/html;charset-utf-8;");
  // renderer.renderToString(component, (err, html) => {
  //   if (err) {
  //     res.status(500).end('Internal Server Error');
  //     return
  //   }
  //   res.end(html)
  // });
});

const server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

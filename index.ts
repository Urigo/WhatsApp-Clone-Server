import express from 'express';

const app = express();

app.get('/_ping', (req, res) => {
  res.send('pong');
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

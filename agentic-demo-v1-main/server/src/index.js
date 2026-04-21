import express from 'express';
import cors from 'cors';
import fhirRouter from './routes/fhir.js';

const app = express();
const PORT = process.env.PORT || 4100;

app.use(cors());
app.use(express.json());
app.use('/fhir', fhirRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`FHIR mock server listening on http://localhost:${PORT}`);
});

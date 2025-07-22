import express from 'express'
import embed from './routes/embed';
import query from './routes/query';
const app = express();
const PORT  = process.env.PORT || 3001;
app.use(express.json());

app.use('/api/embed',embed);
app.use('/api/query',query);

app.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`)
})


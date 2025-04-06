import qr from "qr-image";
import fs from "fs";
import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
app.use(cors());


app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));


const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}
const fileName = `qr_${Date.now()}.png`;

app.post("/submit", (req, res) => {
    console.log("Data received:", req.body);

    const url = req.body["link"];
    if (!url) {
        return res.status(400).send("No URL provided");
    }

    
    const filePath = path.join(imagesDir, fileName);

    const qr_svg = qr.image(url, { type: "png" });
    const writeStream = fs.createWriteStream(filePath);

    qr_svg.pipe(writeStream);

    writeStream.on("finish", () => {
        console.log("QR code saved:", filePath);
        const serverUrl = `${req.protocol}://${req.get('host')}/images/${fileName}`;
        res.send(serverUrl);
    });

    writeStream.on("error", (err) => {
        console.error("Error saving QR code:", err);
        res.status(500).send("Error generating QR code");
    });
});

app.get(`/images/${fileName}`, (req, res) => {
  const filePath = path.join(__dirname, 'images', req.params.filename);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(filePath);
});


app.listen(port, () => {
    console.log(`Server Listening on http://localhost:${port}`);
});

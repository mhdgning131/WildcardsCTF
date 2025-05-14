const http = require('http');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } 
  else if (req.url === '/upload' && req.method.toLowerCase() === 'post') {
    let body = '';
	let filename;
    
    req.on('data', (chunk) => {
		const chunkString = chunk.toString();
		if (chunkString.includes('Content-Disposition: form-data')) {
			const filenameMatch = chunkString.match(/filename="([^"]*)"/);
			if (filenameMatch && filenameMatch[1]) {
			  filename = filenameMatch[1];
			}
		  }

        body += chunkString
	  
    });

    req.on('end', () => {
      if(!filename){
      	res.writeHead(500)
      	return res.end('Error: filename not found')
      }
	  
	  if(filename === 'ZmxhZw.txt'){
		  filename = 'tmp_ZmxhZw.txt';
	  }
    
      
      const filePath = path.join(__dirname, 'uploads', `${filename}`);
      fs.writeFileSync(filePath, body);

      if (filename !== 'ZmxhZw.txt') {
        setTimeout(() => {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Erreur lors de la suppression du fichier ${filename}:`, err);
            } else {
              console.log(`Fichier ${filename} supprimé après 10 secondes`);
            }
          });
        }, 10000); // 10 secondes
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      try {
        const fileContent = fs.readFileSync(filePath);
        res.end(fileContent);
      } catch (err) {
        console.error(`Erreur lors de la lecture du fichier ${filename}:`, err);
        res.end(`Erreur lors de la lecture du fichier: ${err.message}`);
      }
    });
  } 
  else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(3000, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:3000`);
});


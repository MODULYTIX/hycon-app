const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../hycon-backend/src/modules/uploads');
fs.mkdirSync(dir, { recursive: true });

const serviceContent = `import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../core/config/env';

export const RUTA_PUBLICA_UPLOADS = '/uploads/imagenes';

export const almacenImagenes = {
  eliminar: async (url: string) => {
    try {
      if (!url.startsWith(env.PUBLIC_URL)) return;
      const parsedUrl = new URL(url);
      if (!parsedUrl.pathname.startsWith(RUTA_PUBLICA_UPLOADS)) return;
      
      const fileName = path.basename(parsedUrl.pathname);
      const filePath = path.join(env.UPLOADS_DIR, 'imagenes', fileName);
      
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
    }
  }
};
`;

const controllerContent = `import type { Request, Response } from 'express';
import { env } from '../../core/config/env';
import { RUTA_PUBLICA_UPLOADS } from './uploads.service';

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }
  
  const imageUrl = \`\${env.PUBLIC_URL}\${RUTA_PUBLICA_UPLOADS}/\${req.file.filename}\`;
  res.status(201).json({ url: imageUrl });
};
`;

const routesContent = `import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { env } from '../../core/config/env';
import { uploadImage } from './uploads.controller';

const uploadDir = path.join(env.UPLOADS_DIR, 'imagenes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

export const uploadRoutes = Router();

uploadRoutes.post('/imagenes', upload.single('imagen'), uploadImage);
`;

fs.writeFileSync(path.join(dir, 'uploads.service.ts'), serviceContent);
fs.writeFileSync(path.join(dir, 'uploads.controller.ts'), controllerContent);
fs.writeFileSync(path.join(dir, 'uploads.routes.ts'), routesContent);

console.log('Files created successfully');
